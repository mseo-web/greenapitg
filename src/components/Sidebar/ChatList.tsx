import { Check, CheckCheck, AlertCircle, Clock } from 'lucide-react';
import { Avatar } from '@/components/Shared/Avatar';
import { useChat } from '@/context/ChatContext';
import type { Chat } from '@/types/telegram';

interface ChatListProps {
  search: string;
}

export function ChatList({ search }: ChatListProps) {
  const { chats, activeChatId, selectChat } = useChat();

  const filtered = search.trim()
    ? chats.filter((c) =>
        c.title.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : chats;

  if (filtered.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4 text-gray-300 dark:text-gray-600">
          {search.trim() ? (
            <span className="text-3xl">?</span>
          ) : (
            <span className="text-3xl font-light">∅</span>
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          {search.trim() ? 'No chats found' : 'No chats yet'}
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
          {search.trim()
            ? 'Try a different search term'
            : 'Create a new chat to start messaging'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto telegram-scroll">
      {filtered.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onSelect={() => selectChat(chat.id)}
        />
      ))}
    </div>
  );
}

function ChatListItem({
  chat,
  isActive,
  onSelect,
}: {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
}) {
  const last = chat.lastMessage;
  const preview = last ? last.text : 'No messages yet';

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left ${
        isActive
          ? 'bg-blue-500/10 dark:bg-blue-500/15'
          : 'hover:bg-gray-100 dark:hover:bg-white/5'
      }`}
    >
      <Avatar
        name={chat.title}
        color={chat.avatarColor}
        url={chat.avatarUrl}
        size={54}
      />
      <div className="flex-1 min-w-0 border-b border-gray-100 dark:border-white/5 pb-2.5 -mb-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-gray-900 dark:text-white truncate text-[15px]">
            {chat.title}
          </span>
          {last && (
            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
              {formatTime(last.timestamp)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <div className="flex items-center gap-1 min-w-0">
            {last?.direction === 'outgoing' && (
              <StatusIcon
                status={last.status}
                className="flex-shrink-0 text-blue-500"
                size={16}
              />
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {preview}
            </span>
          </div>
          {chat.unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-blue-500 text-white text-xs font-medium flex items-center justify-center">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function StatusIcon({
  status,
  className,
  size,
}: {
  status: string;
  className?: string;
  size?: number;
}) {
  if (status === 'sending')
    return <Clock size={size} className={className} />;
  if (status === 'sent')
    return <Check size={size} className={className} />;
  if (status === 'delivered' || status === 'read')
    return (
      <CheckCheck
        size={size}
        className={status === 'read' ? 'text-blue-500' : className}
      />
    );
  if (status === 'failed')
    return <AlertCircle size={size} className="text-red-500" />;
  return null;
}

function formatTime(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
