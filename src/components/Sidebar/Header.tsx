import { useState, useRef, useEffect } from 'react';
import { Search, Moon, Sun, MoreVertical, LogOut, PencilLine, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  onNewChat: () => void;
}

export function Header({ search, onSearchChange, onNewChat }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#17212b] flex-shrink-0">
      <div className="flex items-center gap-2 px-4 h-14">
        {/* Search bar */}
        <div className="flex-1 relative">
          {search ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
          ) : (
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          )}
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="w-full h-10 pl-10 pr-4 rounded-full bg-gray-100 dark:bg-[#242f3d] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
          >
            <MoreVertical size={20} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#212d3b] shadow-xl border border-gray-200 dark:border-white/10 py-1.5 z-40 animate-fadeIn">
              <button
                onClick={() => {
                  onNewChat();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <PencilLine size={18} />
                New Chat
              </button>
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={18} />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
