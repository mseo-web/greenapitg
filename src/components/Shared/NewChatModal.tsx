import { useState } from 'react';
import { X, UserPlus, Phone } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

interface NewChatModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewChatModal({ open, onClose }: NewChatModalProps) {
  const { createChat, selectChat } = useChat();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const trimmed = input.trim();
  //   if (!trimmed) {
  //     setError('Enter a Chat ID or phone number');
  //     return;
  //   }
  //   if (!/^[\d+@.a-zA-Z]+$/.test(trimmed)) {
  //     setError('Only digits, +, and @ are allowed');
  //     return;
  //   }
  //   const chat = createChat(trimmed);
  //   selectChat(chat.id);
  //   setInput('');
  //   setError(null);
  //   onClose();
  // };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   let trimmed = input.trim().replace(/\+/g, '');
  //   if (!trimmed) {
  //     setError('Enter a Chat ID or phone number');
  //     return;
  //   }
  //   if (!/^[\d+@.a-zA-Z]+$/.test(trimmed)) {
  //     setError('Only digits, +, and @ are allowed');
  //     return;
  //   }

  //   if (!trimmed.endsWith('@telegram')) {
  //     trimmed = `${trimmed}@telegram`;
  //   }

  //   const chat = createChat(trimmed);
  //   selectChat(chat.id);
  //   setInput('');
  //   setError(null);
  //   onClose();
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let trimmed = input.trim();
    if (!trimmed) {
      setError('Enter a Chat ID or phone number');
      return;
    }
    if (!/^[\d+@.a-zA-Z_]+$/.test(trimmed)) {
      setError('Only digits, +, _, and @ are allowed');
      return;
    }

    const chat = createChat(trimmed);
    selectChat(chat.id);
    setInput('');
    setError(null);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-[#212d3b] rounded-2xl w-full max-w-md mx-4 shadow-2xl animate-scaleIn">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            New Message
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <div className="w-12 h-12 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-500">
              <UserPlus size={24} />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Start a new chat
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter a Telegram Chat ID or phone number
              </p>
            </div>
          </div>

          <div className="relative">
            <Phone
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              placeholder="e.g. 123456789 or 123456789@telegram"
              autoFocus
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-[#0e1621] text-gray-900 dark:text-white border border-transparent focus:border-blue-500 focus:outline-none transition-colors placeholder:text-gray-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
            <p>• Numeric ID will be formatted as <code className="text-blue-500">123456789@telegram</code></p>
            <p>• Or enter a full Chat ID like <code className="text-blue-500">123456789@telegram</code></p>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
          >
            Start Chat
          </button>
        </form>
      </div>
    </div>
  );
}
