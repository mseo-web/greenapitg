import { ChatHeader } from '@/components/Chat/ChatHeader';
import { MessageList } from '@/components/Chat/MessageList';
import { MessageInput } from '@/components/Chat/MessageInput';
import { useChat } from '@/context/ChatContext';

interface ChatWindowProps {
  onBack: () => void;
}

export function ChatWindow({ onBack }: ChatWindowProps) {
  const { activeChat } = useChat();

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-[#0e1621]">
      <ChatHeader onBack={onBack} />
      <MessageList />
      <MessageInput />
    </div>
  );
}

export function EmptyChat() {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center h-full w-full bg-gray-50 dark:bg-[#0e1621] telegram-chat-bg relative">
      <div className="relative z-10 text-center px-8">
        <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-14 h-14 text-blue-500"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3.75h6m-6 6h9m-9-3.75h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Select a chat
        </h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
          Choose a conversation from the sidebar or start a new chat to begin
          messaging
        </p>
      </div>
    </div>
  );
}
