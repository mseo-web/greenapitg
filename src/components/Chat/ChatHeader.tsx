import { ArrowLeft, MoreVertical, Phone, Search } from 'lucide-react';
import { Avatar } from '@/components/Shared/Avatar';
import { useChat } from '@/context/ChatContext';

interface ChatHeaderProps {
  onBack: () => void;
}

export function ChatHeader({ onBack }: ChatHeaderProps) {
  const { activeChat } = useChat();

  if (!activeChat) return null;

  return (
    <div className="flex items-center gap-3 px-4 h-14 bg-white dark:bg-[#17212b] border-b border-gray-200 dark:border-white/5 flex-shrink-0 z-10">
      <button
        onClick={onBack}
        className="lg:hidden p-1.5 -ml-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
      >
        <ArrowLeft size={22} />
      </button>

      <Avatar
        name={activeChat.title}
        color={activeChat.avatarColor}
        url={activeChat.avatarUrl}
        size={42}
      />

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate text-[15px]">
          {activeChat.title}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
          {activeChat.id}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors">
          <Search size={20} />
        </button>
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors">
          <Phone size={20} />
        </button>
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
}
