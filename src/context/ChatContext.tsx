import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Chat, ChatMessage, MessageStatus } from '@/types/telegram';
import {
  getContactInfo,
  deleteNotification,
  receiveNotification,
  sendMessage as apiSendMessage,
} from '@/api/greenApiTelegram';
import { useAuth } from '@/context/AuthContext';

const AVATAR_COLORS = [
  '#e17076', // red
  '#eda84f', // orange
  '#74c279', // green
  '#6ab4e8', // light blue
  '#5b8ddd', // blue
  '#9b8fe0', // purple
  '#62c7ad', // teal
  '#e87a96', // pink
];

function colorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function titleFromChatId(chatId: string): string {
  const base = chatId.replace(/@telegram$/, '').replace(/@c\.us$/, '');
  return base;
}

// function normalizeChatId(raw: string): string {
//   const trimmed = raw.trim();
//   if (trimmed.includes('@')) return trimmed;
//   if (/^\d+$/.test(trimmed)) return `${trimmed}@telegram`;
//   if (/^\+?\d+$/.test(trimmed)) return `${trimmed.replace('+', '')}@telegram`;
//   return trimmed;
// }

function normalizeChatId(raw: string): string {
  let trimmed = raw.trim();
  // Убираем случайно добавленный суффикс @telegram
  trimmed = trimmed.replace(/@telegram$/i, '');

  // Если это юзернейм (начинается с @), оставляем как есть
  if (trimmed.startsWith('@')) return trimmed;

  // Если состоит только из цифр или номера с плюсом — оставляем только чистый ID
  return trimmed.replace(/\+/g, '');
}

function genLocalId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ChatContextValue {
  chats: Chat[];
  activeChatId: string | null;
  activeChat: Chat | null;
  messages: ChatMessage[];
  isPolling: boolean;
  selectChat: (chatId: string) => void;
  createChat: (rawChatId: string) => Chat;
  sendMessage: (text: string) => Promise<void>;
  clearActiveChat: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { credentials } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messagesByChat, setMessagesByChat] = useState<Record<string, ChatMessage[]>>({});
  const [isPolling, setIsPolling] = useState(false);
  const pollActiveRef = useRef(false);

  // Реф для хранения актуального activeChatId внутри polling цикла
  const activeChatIdRef = useRef<string | null>(activeChatId);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeChatId) ?? null,
    [chats, activeChatId],
  );

  const messages = useMemo(
    () => (activeChatId ? messagesByChat[activeChatId] ?? [] : []),
    [messagesByChat, activeChatId],
  );

  const upsertChat = useCallback((chat: Chat) => {
    setChats((prev) => {
      const existing = prev.find((c) => c.id === chat.id);
      if (existing) {
        return prev.map((c) =>
          c.id === chat.id ? { ...c, ...chat, createdAt: c.createdAt } : c,
        );
      }
      return [chat, ...prev];
    });
  }, []);

  const appendMessages = useCallback(
    (chatId: string, msgs: ChatMessage[]) => {
      if (msgs.length === 0) return;
      setMessagesByChat((prev) => {
        const existing = prev[chatId] ?? [];
        const seen = new Set(
          existing.filter((m) => m.apiId).map((m) => m.apiId),
        );
        const toAdd = msgs.filter(
          (m) => !m.apiId || !seen.has(m.apiId),
        );
        if (toAdd.length === 0) return prev;
        const next = [...existing, ...toAdd].sort((a, b) => a.timestamp - b.timestamp);
        return { ...prev, [chatId]: next };
      });
    },
    [],
  );

  const updateMessageStatus = useCallback(
    (chatId: string, localId: string, status: MessageStatus, apiId?: string) => {
      setMessagesByChat((prev) => {
        const list = prev[chatId];
        if (!list) return prev;
        return {
          ...prev,
          [chatId]: list.map((m) =>
            m.id === localId
              ? { ...m, status, apiId: apiId ?? m.apiId }
              : m,
          ),
        };
      });
    },
    [],
  );

  const updateChatLastMessage = useCallback((chatId: string) => {
    setMessagesByChat((prevMessages) => {
      const msgs = prevMessages[chatId];
      if (!msgs || msgs.length === 0) return prevMessages;
      const last = msgs[msgs.length - 1];
      setChats((prevChats) =>
        prevChats.map((c) =>
          c.id === chatId ? { ...c, lastMessage: last } : c,
        ),
      );
      return prevMessages;
    });
  }, []);

  const selectChat = useCallback(
    (chatId: string) => {
      setActiveChatId(chatId);
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)),
      );
    },
    [],
  );

  const createChat = useCallback(
    (rawChatId: string): Chat => {
      const id = normalizeChatId(rawChatId);
      const title = titleFromChatId(id);
      const chat: Chat = {
        id,
        title,
        avatarColor: colorForId(id),
        unreadCount: 0,
        createdAt: Date.now(),
      };
      upsertChat(chat);

      // Запрашиваем актуальные имя, аватар и числовой chatId с сервера GREEN-API
      if (credentials) {
        getContactInfo(credentials, id)
          .then((info) => {
            console.log('[getContactInfo] Received data:', info);
            
            setChats((prev) =>
              prev.map((c) => {
                if (c.id !== id) return c;

                // Если сервер вернул числовой chatId (например, "77088210593"), 
                // обновляем id чата, чтобы входящие вебхуки попадали в этот же диалог
                const realId = info.chatId || c.id;

                return {
                  ...c,
                  id: realId,
                  title: info.name || info.contactName || c.title,
                  avatarUrl: info.avatar || c.avatarUrl,
                };
              }),
            );

            // Если ID изменился с юзернейма на числовой, обновляем выбранный чат
            if (info.chatId && info.chatId !== id) {
              selectChat(info.chatId);
            }
          })
          .catch((err) => console.error('[getContactInfo] Failed:', err));
      }

      return chat;
    },
    [credentials, upsertChat, selectChat],
  );

  const clearActiveChat = useCallback(() => setActiveChatId(null), []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!credentials || !activeChatId || !text.trim()) return;

      const localId = genLocalId();
      const msg: ChatMessage = {
        id: localId,
        chatId: activeChatId,
        text: text.trim(),
        direction: 'outgoing',
        status: 'sending',
        timestamp: Date.now(),
      };

      appendMessages(activeChatId, [msg]);
      updateChatLastMessage(activeChatId);

      try {
        const res = await apiSendMessage(credentials, activeChatId, text.trim());
        updateMessageStatus(activeChatId, localId, 'sent', res.idMessage);
        updateChatLastMessage(activeChatId);
      } catch (err) {
        console.error('sendMessage failed', err);
        updateMessageStatus(activeChatId, localId, 'failed');
      }
    },
    [credentials, activeChatId, appendMessages, updateChatLastMessage, updateMessageStatus],
  );

  // Long-polling loop for incoming notifications
  useEffect(() => {
    if (!credentials || pollActiveRef.current) return;

    pollActiveRef.current = true;
    setIsPolling(true);

    let cancelled = false;

    async function poll() {
      if (cancelled || !credentials) return;
      try {
        const notification = await receiveNotification(credentials);
        if (cancelled) return;

        if (notification && notification.body) {
          const body = notification.body;
          const receiptId = notification.receiptId;

          // Безопасное извлечение chatId из структуры Telegram
          const chatId =
            body.senderData?.chatId ||
            (body as Record<string, any>).chatId ||
            (body.senderData?.chatName ? normalizeChatId(body.senderData.chatName) : null);

          if (chatId) {
            if (body.typeWebhook === 'incomingMessageReceived' && body.messageData) {
              const text =
                body.messageData.textMessageData?.textMessage ||
                body.messageData.extendedTextMessageData?.text ||
                '';

              if (text) {
                const incomingMsg: ChatMessage = {
                  id: body.idMessage || genLocalId(),
                  chatId,
                  text,
                  direction: 'incoming',
                  status: 'delivered',
                  timestamp: (body.timestamp ?? Math.floor(Date.now() / 1000)) * 1000,
                  apiId: body.idMessage,
                };

                setChats((prev) => {
                  const existing = prev.find((c) => c.id === chatId);
                  const isCurrentActive = activeChatIdRef.current === chatId;

                  if (!existing) {
                    return [
                      {
                        id: chatId,
                        title: body.senderData?.chatName || titleFromChatId(chatId),
                        avatarColor: colorForId(chatId),
                        unreadCount: isCurrentActive ? 0 : 1,
                        createdAt: Date.now(),
                      },
                      ...prev,
                    ];
                  }

                  return prev.map((c) =>
                    c.id === chatId
                      ? { ...c, unreadCount: isCurrentActive ? 0 : c.unreadCount + 1 }
                      : c,
                  );
                });

                appendMessages(chatId, [incomingMsg]);
                updateChatLastMessage(chatId);
              }
            } else if (body.typeWebhook === 'outgoingMessageReceived' && body.messageData) {
              const text =
                body.messageData.textMessageData?.textMessage ||
                body.messageData.extendedTextMessageData?.text ||
                '';

              if (text && body.idMessage) {
                setMessagesByChat((prev) => {
                  const list = prev[chatId];
                  if (!list) return prev;
                  return {
                    ...prev,
                    [chatId]: list.map((m) =>
                      m.apiId === body.idMessage || m.text === text
                        ? { ...m, status: 'delivered' as MessageStatus, apiId: body.idMessage }
                        : m,
                    ),
                  };
                });
              }
            } else if (body.typeWebhook === 'outgoingAPIMessageReceived' && body.idMessage) {
              setMessagesByChat((prev) => {
                const list = prev[chatId];
                if (!list) return prev;
                return {
                  ...prev,
                  [chatId]: list.map((m) =>
                    m.apiId === body.idMessage
                      ? { ...m, status: 'delivered' as MessageStatus }
                      : m,
                  ),
                };
              });
            }
          }

          // Удаляем обработанное уведомление
          try {
            await deleteNotification(credentials, receiptId);
          } catch (e) {
            console.error('deleteNotification failed', e);
          }
        }

        if (!cancelled) {
          setTimeout(poll, 200);
        }
      } catch (err) {
        console.error('receiveNotification error', err);
        if (!cancelled) {
          setTimeout(poll, 3000);
        }
      }
    }

    poll();

    return () => {
      cancelled = true;
      pollActiveRef.current = false;
      setIsPolling(false);
    };
  }, [credentials, appendMessages, updateChatLastMessage]);

  const sortedChats = useMemo(
    () =>
      [...chats].sort((a, b) => {
        const aTime = a.lastMessage?.timestamp ?? a.createdAt;
        const bTime = b.lastMessage?.timestamp ?? b.createdAt;
        return bTime - aTime;
      }),
    [chats],
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      chats: sortedChats,
      activeChatId,
      activeChat,
      messages,
      isPolling,
      selectChat,
      createChat,
      sendMessage,
      clearActiveChat,
    }),
    [
      sortedChats,
      activeChatId,
      activeChat,
      messages,
      isPolling,
      selectChat,
      createChat,
      sendMessage,
      clearActiveChat,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}