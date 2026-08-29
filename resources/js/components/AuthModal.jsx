import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import VanhSoundLogo from './VanhSoundLogo';
import confetti from 'canvas-confetti';

export default function AuthModal() {
  const { isAuthModalOpen, authModalTab, closeAuthModal, setAuthModalTab, login, register } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (authModalTab === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#5E6AD2', '#8B5CF6', '#EC4899'],
          });
        } catch (_) {}
      }
      closeAuthModal();
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-dropdown rounded-3xl p-7 border border-white/[0.10] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <VanhSoundLogo size="small" showTagline={false} />
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#8A8F98] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-[#0a0a0c] p-1 my-5 border border-white/[0.06]">
          <button
            type="button"
            onClick={() => { setAuthModalTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              authModalTab === 'login'
                ? 'bg-white text-[#050506] shadow-sm'
                : 'text-[#8A8F98] hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng Nhập</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthModalTab('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              authModalTab === 'register'
                ? 'bg-white text-[#050506] shadow-sm'
                : 'text-[#8A8F98] hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Đăng Ký</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#8A8F98] mb-1.5">
                Họ và Tên
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 absolute left-3.5 text-[#8A8F98]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nguyễn Văn Anh"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#0a0a0c] border border-white/10 focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/30 text-sm text-white placeholder-[#8A8F98] outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#8A8F98] mb-1.5">
              Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3.5 text-[#8A8F98]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#0a0a0c] border border-white/10 focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/30 text-sm text-white placeholder-[#8A8F98] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#8A8F98] mb-1.5">
              Mật khẩu
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3.5 text-[#8A8F98]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#0a0a0c] border border-white/10 focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/30 text-sm text-white placeholder-[#8A8F98] outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-[#5E6AD2] to-[#8B5CF6] hover:from-[#6872D9] hover:to-[#9d71f7] text-white font-bold text-sm shadow-accent-glow active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : authModalTab === 'login' ? (
              'Đăng Nhập VanhSound'
            ) : (
              'Tạo Tài Khoản Mới'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
