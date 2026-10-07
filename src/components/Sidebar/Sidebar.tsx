import { useState } from 'react';
import { Header } from '@/components/Sidebar/Header';
import { ChatList } from '@/components/Sidebar/ChatList';
import { NewChatModal } from '@/components/Shared/NewChatModal';

export function Sidebar() {
  const [search, setSearch] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col h-full w-full bg-white dark:bg-[#17212b] border-r border-gray-200 dark:border-white/5">
        <Header
          search={search}
          onSearchChange={setSearch}
          onNewChat={() => setNewChatOpen(true)}
        />
        <ChatList search={search} />
      </div>
      <NewChatModal open={newChatOpen} onClose={() => setNewChatOpen(false)} />
    </>
  );
}
