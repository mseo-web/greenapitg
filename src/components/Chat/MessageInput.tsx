import { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

export function MessageInput() {
  const { sendMessage, activeChatId } = useChat();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [text]);

  // Clear input when switching chats
  useEffect(() => {
    setText('');
  }, [activeChatId]);

  if (!activeChatId) return null;

  const canSend = text.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    sendMessage(text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        sendMessage(text);
        setText('');
      }
    }
  };

  return (
    <div className="flex-shrink-0 px-4 py-3 bg-white dark:bg-[#17212b] border-t border-gray-200 dark:border-white/5">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex items-center gap-1 pb-1.5">
          <button
            type="button"
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <Smile size={24} />
          </button>
          <button
            type="button"
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <Paperclip size={22} />
          </button>
        </div>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message"
            rows={1}
            className="w-full resize-none px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-[#242f3d] text-gray-900 dark:text-white text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 leading-relaxed"
            style={{ maxHeight: '120px' }}
          />
        </div>

        <button
          type="submit"
          disabled={!canSend}
          className={`p-3 rounded-full transition-all flex items-center justify-center ${
            canSend
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-100'
              : 'text-gray-300 dark:text-gray-600 scale-95 cursor-default'
          }`}
        >
          <Send size={22} className={canSend ? 'translate-x-0.5' : ''} />
        </button>
      </form>
    </div>
  );
}
