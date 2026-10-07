import { useEffect, useRef } from 'react';
import { Check, CheckCheck, AlertCircle, Clock } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import type { ChatMessage } from '@/types/telegram';

export function MessageList() {
  const { messages, activeChat } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!activeChat) return null;

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className="max-w-sm">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-3xl font-light">
            ✉
          </div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
            No messages yet
          </h2>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Send a message to start the conversation
          </p>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groups: { label: string; items: ChatMessage[] }[] = [];
  let lastLabel = '';
  for (const msg of messages) {
    const label = dateLabel(msg.timestamp);
    if (label !== lastLabel) {
      groups.push({ label, items: [] });
      lastLabel = label;
    }
    groups[groups.length - 1].items.push(msg);
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto telegram-scroll telegram-chat-bg"
    >
      <div className="min-h-full flex flex-col justify-end px-4 py-4 gap-1">
        {groups.map((group, gi) => (
          <div key={gi} className="flex flex-col gap-1">
            <div className="flex justify-center my-2">
              <span className="px-3 py-1 rounded-full bg-black/10 dark:bg-black/30 backdrop-blur-sm text-xs font-medium text-gray-600 dark:text-gray-300">
                {group.label}
              </span>
            </div>
            {group.items.map((msg, mi) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                showTail={
                  mi === group.items.length - 1 ||
                  group.items[mi + 1].direction !== msg.direction
                }
              />
            ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  showTail,
}: {
  message: ChatMessage;
  showTail: boolean;
}) {
  const isOutgoing = message.direction === 'outgoing';

  return (
    <div
      className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} ${
        showTail ? 'mt-1' : 'mt-0.5'
      }`}
    >
      <div
        className={`relative max-w-[75%] sm:max-w-[65%] md:max-w-[60%] px-3 py-1.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
          isOutgoing
            ? 'bg-[#effdde] dark:bg-[#2b5278] text-gray-900 dark:text-white rounded-br-md'
            : 'bg-white dark:bg-[#182533] text-gray-900 dark:text-white rounded-bl-md'
        } ${showTail ? '' : isOutgoing ? 'rounded-br-2xl' : 'rounded-bl-2xl'}`}
      >
        <p className="whitespace-pre-wrap break-words pr-1">{message.text}</p>
        <div className="flex items-center justify-end gap-1 -mt-0.5 -mb-0.5 ml-2 h-4">
          <span className="text-[11px] text-gray-400 dark:text-gray-400 leading-none">
            {formatTime(message.timestamp)}
          </span>
          {isOutgoing && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'sending')
    return <Clock size={14} className="text-gray-400" />;
  if (status === 'sent')
    return <Check size={14} className="text-gray-400" />;
  if (status === 'delivered')
    return <CheckCheck size={14} className="text-gray-400" />;
  if (status === 'read')
    return <CheckCheck size={14} className="text-blue-500" />;
  if (status === 'failed')
    return <AlertCircle size={14} className="text-red-500" />;
  return null;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function dateLabel(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}
