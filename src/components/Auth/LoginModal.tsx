import { useState } from 'react';
import { X, Loader2, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function LoginModal() {
  const { login, isAuthenticating, authError } = useAuth();
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!idInstance.trim() || !apiTokenInstance.trim()) {
      setLocalError('Both fields are required');
      return;
    }
    await login({
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e1621] animate-fadeIn">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={chatPatternStyle} />

      <div className="relative w-full max-w-md mx-4">
        <div className="bg-[#17212b] rounded-2xl shadow-2xl overflow-hidden border border-white/5">
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <KeyRound size={36} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Telegram Web
            </h1>
            <p className="text-gray-400 text-sm">
              Sign in with your GREEN-API credentials to start messaging
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Id Instance
              </label>
              <input
                type="text"
                value={idInstance}
                onChange={(e) => setIdInstance(e.target.value)}
                placeholder="1100000000"
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-[#0e1621] text-white border border-white/10 focus:border-blue-500 focus:outline-none transition-colors placeholder:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Api Token Instance
              </label>
              <input
                type="password"
                value={apiTokenInstance}
                onChange={(e) => setApiTokenInstance(e.target.value)}
                placeholder="••••••••••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-[#0e1621] text-white border border-white/10 focus:border-blue-500 focus:outline-none transition-colors placeholder:text-gray-600 font-mono text-sm"
              />
            </div>

            {(localError || authError) && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{localError || authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Connecting...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="pt-2 text-xs text-gray-500 text-center">
              Get your credentials at{' '}
              <a
                href="https://console.green-api.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                console.green-api.com
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const chatPatternStyle: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M14 16H2v-2h12v2zm0-4H6v-2h8v2zm0-4H10v-2h4v2zm0-4h-2V2h2v2zM40 40h-2v-2h2v2zm0-4h-4v-2h4v2zm0-4h-6v-2h6v2zm0-4h-8v-2h8v2zm0-4h-2v-2h2v2zM66 72h-2v-2h2v2zm0-4h-4v-2h4v2zm0-4h-6v-2h6v2zm0-4h-8v-2h8v2z'/%3E%3C/g%3E%3C/svg%3E\")",
  backgroundSize: '80px 80px',
};
