import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Heart, 
  Plus, 
  Library, 
  UploadCloud, 
  Sparkles,
  Flame,
  Radio,
  Music2
} from 'lucide-react';
import axios from 'axios';
import VanhSoundLogo from './VanhSoundLogo';

export default function Sidebar({ onCreatePlaylistOpen, onUploadOpen }) {
  const [playlists, setPlaylists] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/browse/featured').then(res => {
      if (res.data && res.data.featured_playlists) {
        setPlaylists(res.data.featured_playlists);
      }
    }).catch(() => {});
  }, []);

  return (
    <aside className="w-64 flex-shrink-0 h-full flex flex-col bg-[#050506]/95 border-r border-white/[0.06] select-none z-30">
      {/* Brand Header with VanhSound Custom Monogram Logo */}
      <div className="p-5 pb-3 flex items-center justify-between">
        <NavLink to="/">
          <VanhSoundLogo size="default" />
        </NavLink>
      </div>

      {/* Main Navigation Links */}
      <div className="px-3 py-2 space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white/[0.08] text-white shadow-inner-highlight border border-white/[0.08]'
                : 'text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.04]'
            }`
          }
        >
          <Home className="w-4 h-4 text-[#5E6AD2]" />
          <span>Trang Chủ</span>
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white/[0.08] text-white shadow-inner-highlight border border-white/[0.08]'
                : 'text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.04]'
            }`
          }
        >
          <Search className="w-4 h-4 text-[#8A8F98]" />
          <span>Tìm Kiếm & Khám Phá</span>
        </NavLink>

        <NavLink
          to="/liked"
          className={({ isActive }) =>
            `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-[#8B5CF6]/20 to-transparent text-white border border-[#8B5CF6]/30'
                : 'text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.04]'
            }`
          }
        >
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center">
            <Heart className="w-3 h-3 text-white fill-white" />
          </div>
          <span>Bài Hát Đã Thích</span>
        </NavLink>

        {/* Creator Studio Upload CTA */}
        <button
          onClick={onUploadOpen}
          className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#5E6AD2]/20 to-[#EC4899]/20 hover:from-[#5E6AD2]/30 hover:to-[#EC4899]/30 border border-white/10 shadow-sm transition-all"
        >
          <UploadCloud className="w-4 h-4 text-[#EC4899]" />
          <span>Creator Studio (Tải Nhạc)</span>
        </button>
      </div>

      {/* Divider */}
      <div className="px-5 my-2">
        <div className="h-px bg-white/[0.06]" />
      </div>

      {/* Your Library Section */}
      <div className="flex-1 flex flex-col min-h-0 px-3">
        <div className="flex items-center justify-between px-3 py-2 text-[#8A8F98]">
          <div className="flex items-center gap-2">
            <Library className="w-4 h-4 text-[#EDEDEF]" />
            <span className="text-xs font-semibold tracking-wider uppercase text-[#EDEDEF]">Thư Viện Nhạc</span>
          </div>
          <button
            onClick={onCreatePlaylistOpen}
            title="Tạo Playlist Mới"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8A8F98] hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 px-2 py-1.5 overflow-x-auto no-scrollbar">
          {['Tất cả', 'Playlists', 'Nghệ sĩ'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-white text-[#050506] font-semibold'
                  : 'bg-white/[0.05] text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.08]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Scrollable Playlists List */}
        <div className="flex-1 overflow-y-auto mt-2 pr-1 space-y-1">
          {/* Dynamic Playlists */}
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer group transition-all ${
                location.pathname === `/playlist/${playlist.id}`
                  ? 'bg-white/[0.08] text-white border border-white/[0.06]'
                  : 'hover:bg-white/[0.04] text-[#8A8F98] hover:text-[#EDEDEF]'
              }`}
            >
              <img
                src={playlist.cover_url}
                alt={playlist.title}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-sm border border-white/[0.06] group-hover:scale-105 transition-transform"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#EDEDEF] group-hover:text-white truncate">
                  {playlist.title}
                </p>
                <p className="text-xs text-[#8A8F98] truncate">
                  Playlist • {playlist.tracks_count || playlist.tracks?.length || 0} bài
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/[0.06] bg-black/20 text-[11px] text-[#8A8F98] flex items-center justify-between">
        <span className="font-mono">VanhSound v2.0</span>
        <span className="flex items-center gap-1 text-[#5E6AD2]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          SoundCloud Engine
        </span>
      </div>
    </aside>
  );
}
