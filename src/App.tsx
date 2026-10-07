import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ChatProvider, useChat } from '@/context/ChatContext';
import { LoginModal } from '@/components/Auth/LoginModal';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { ChatWindow, EmptyChat } from '@/components/Chat/ChatWindow';

function MessengerApp() {
  const { isAuthenticated } = useAuth();
  const { activeChatId, clearActiveChat } = useChat();

  if (!isAuthenticated) {
    return <LoginModal />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100 dark:bg-[#0e1621]">
      {/* Sidebar: full width on mobile when no chat selected, fixed on desktop */}
      <div
        className={`${
          activeChatId ? 'hidden lg:flex' : 'flex'
        } w-full lg:w-[400px] xl:w-[420px] flex-shrink-0`}
      >
        <Sidebar />
      </div>

      {/* Chat area */}
      <div
        className={`${
          activeChatId ? 'flex' : 'hidden lg:flex'
        } flex-1 min-w-0`}
      >
        {activeChatId ? (
          <ChatWindow onBack={clearActiveChat} />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <MessengerApp />
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
