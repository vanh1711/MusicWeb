import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  X, 
  User, 
  Bell, 
  Settings, 
  LogOut,
  Sparkles,
  UploadCloud,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { useAudioStore } from '../store/useAudioStore';
import { useAuthStore } from '../store/useAuthStore';

// In-memory client-side cache for 0ms instant search responses
const clientSearchCache = new Map();

export default function Topbar({ onUploadOpen }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const searchRef = useRef(null);
  const abortControllerRef = useRef(null);

  const { playTrack } = useAudioStore();
  const { user, isAuthenticated, logout, openLoginModal, openRegisterModal } = useAuthStore();

  // High-performance search debounce with in-memory caching & request cancellation
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    // 1. Instant 0ms cache hit
    const cacheKey = query.toLowerCase();
    if (clientSearchCache.has(cacheKey)) {
      setSearchResults(clientSearchCache.get(cacheKey));
      setIsDropdownOpen(true);
      setIsSearching(false);
      return;
    }

    // 2. Cancel previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: abortControllerRef.current.signal,
        });

        // Store in cache
        clientSearchCache.set(cacheKey, res.data);
        if (clientSearchCache.size > 50) {
          const firstKey = clientSearchCache.keys().next().value;
          clientSearchCache.delete(firstKey);
        }

        setSearchResults(res.data);
        setIsDropdownOpen(true);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.warn('Search request error:', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 bg-[#050506]/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-20">
      {/* Left: History & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* Navigation History */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#8A8F98] hover:text-white flex items-center justify-center transition-colors border border-white/[0.06]"
            title="Go back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#8A8F98] hover:text-white flex items-center justify-center transition-colors border border-white/[0.06]"
            title="Go forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Live Universal Search Input */}
        <div className="relative flex-1" ref={searchRef}>
          <div className="relative flex items-center">
            {isSearching ? (
              <Loader2 className="w-4 h-4 absolute left-3.5 text-[#5E6AD2] animate-spin pointer-events-none" />
            ) : (
              <Search className="w-4 h-4 absolute left-3.5 text-[#8A8F98] pointer-events-none" />
            )}

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchResults) setIsDropdownOpen(true); }}
              placeholder="Tìm kiếm bài hát, remix, nghệ sĩ (Người Ấy Remix, Sơn Tùng, EDM)..."
              className="w-full h-10 pl-10 pr-9 rounded-full bg-[#0a0a0c] border border-white/[0.08] focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/30 text-xs sm:text-sm text-[#EDEDEF] placeholder-[#8A8F98] outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults(null); }}
                className="absolute right-3 text-[#8A8F98] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Instant Search Dropdown Results */}
          {isDropdownOpen && searchResults && (
            <div className="absolute top-12 left-0 right-0 glass-dropdown rounded-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl">
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {/* Top Tracks */}
                {searchResults.tracks?.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between px-2 mb-1">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A8F98]">
                        Bài hát & Remix ({searchResults.tracks.length})
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">Full Track 100%</span>
                    </div>

                    <div className="space-y-1">
                      {searchResults.tracks.slice(0, 5).map((t, idx) => (
                        <div
                          key={`${t.id}-${idx}`}
                          onClick={() => {
                            playTrack(t);
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.06] cursor-pointer group transition-colors"
                        >
                          <img
                            src={t.cover_url || t.display_cover_url}
                            alt={t.title}
                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white group-hover:text-[#5E6AD2] truncate">
                              {t.title}
                            </p>
                            <p className="text-xs text-[#8A8F98] truncate">{t.artist?.name}</p>
                          </div>
                          <span className="text-xs text-[#8A8F98] font-mono">{t.duration_formatted}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-[#8A8F98]">
                    Không tìm thấy bài hát phù hợp.
                  </div>
                )}

                {/* Artists */}
                {searchResults.artists?.length > 0 && (
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A8F98] px-2 block mb-1">
                      Nghệ sĩ
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {searchResults.artists.slice(0, 2).map((a) => (
                        <div
                          key={a.id}
                          onClick={() => {
                            navigate(`/artist/${a.slug}`);
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.06] cursor-pointer transition-colors"
                        >
                          <img
                            src={a.avatar_url}
                            alt={a.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{a.name}</p>
                            <span className="text-[10px] text-[#8A8F98]">Nghệ sĩ</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Search Action */}
                <div
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                    setIsDropdownOpen(false);
                  }}
                  className="p-2 text-center text-xs font-semibold text-[#5E6AD2] hover:text-[#6872D9] cursor-pointer border-t border-white/[0.06]"
                >
                  Xem toàn bộ kết quả cho "{searchQuery}" →
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onUploadOpen}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#5E6AD2] to-[#EC4899] hover:opacity-90 active:scale-95 text-xs font-bold text-white shadow-accent-glow transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          <span className="hidden sm:inline">Tải Nhạc Lên</span>
        </button>

        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1 pl-1.5 pr-3 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] transition-all group"
            >
              <img
                src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-[#5E6AD2]/50"
              />
              <span className="text-xs font-medium text-[#EDEDEF] group-hover:text-white hidden md:inline">
                {user.name}
              </span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-12 w-52 glass-dropdown rounded-2xl p-2 z-50 shadow-2xl">
                <div className="px-3 py-2 border-b border-white/[0.06]">
                  <p className="text-xs font-semibold text-white">{user.name}</p>
                  <p className="text-[11px] text-[#8A8F98] truncate">{user.email}</p>
                </div>
                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => { onUploadOpen(); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#EDEDEF] hover:bg-white/[0.08] rounded-xl transition-colors text-left"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#EC4899]" />
                    <span>Creator Studio</span>
                  </button>
                </div>
                <div className="pt-1 border-t border-white/[0.06]">
                  <button
                    onClick={() => { logout(); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={openLoginModal}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#EDEDEF] hover:text-white hover:bg-white/[0.08] transition-all"
            >
              Đăng Nhập
            </button>
            <button
              onClick={openRegisterModal}
              className="px-4 py-1.5 rounded-full bg-white text-[#050506] hover:bg-[#EDEDEF] text-xs font-bold shadow-sm transition-all"
            >
              Đăng Ký
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
