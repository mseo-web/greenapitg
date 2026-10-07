export interface AuthCredentials {
  idInstance: string;
  apiTokenInstance: string;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type MessageDirection = 'outgoing' | 'incoming';

export interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  direction: MessageDirection;
  status: MessageStatus;
  timestamp: number;
  /** GREEN-API message id returned after sending (idMessage) */
  apiId?: string;
}

export interface Chat {
  id: string; // e.g. 123456789@telegram
  title: string;
  avatarColor: string;
  avatarUrl?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: number;
}

/** GREEN-API: getStateInstance response */
export interface StateInstanceResponse {
  stateInstance: string;
}

/** GREEN-API: sendMessage response */
export interface SendMessageResponse {
  idMessage: string;
}

/** GREEN-API: receiveNotification response (or null when empty) */
export interface GreenApiNotification {
  receiptId: number;
  body: {
    typeWebhook: string;
    instanceData: {
      idInstance: string;
      wid: string;
    };
    timestamp: number;
    idMessage: string;
    chatId?: string;
    senderData?: {
      chatId?: string;
      chatName?: string;
      senderId?: string;
      senderName?: string;
    };
    messageData?: {
      typeMessage: string;
      textMessageData?: {
        textMessage: string;
      };
      extendedTextMessageData?: {
        text: string;
      };
    };
  } | null;
}

export type ThemeMode = 'dark' | 'light';
