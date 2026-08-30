import React, { useState } from 'react';
import { X, Plus, Check, ListMusic, Music, Sparkles } from 'lucide-react';
import { usePlaylistStore } from '../store/usePlaylistStore';

export default function AddToPlaylistModal({ isOpen, onClose, track, onCreateNew }) {
  const { customPlaylists, addTrackToPlaylist } = usePlaylistStore();
  const [addedPlaylists, setAddedPlaylists] = useState(new Set());

  if (!isOpen || !track) return null;

  const handleSelectPlaylist = (playlist) => {
    const success = addTrackToPlaylist(playlist.id, track);
    if (success) {
      setAddedPlaylists((prev) => new Set([...prev, playlist.id]));
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm glass-dropdown rounded-3xl p-6 border border-white/[0.12] shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5E6AD2]/15 border border-[#5E6AD2]/30 flex items-center justify-center text-[#5E6AD2]">
              <ListMusic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Thêm vào Playlist</h3>
              <p className="text-[11px] text-[#8A8F98] truncate max-w-[200px]">{track.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#8A8F98] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Create New Playlist Button */}
        <button
          onClick={() => {
            onClose();
            if (onCreateNew) onCreateNew();
          }}
          className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] text-xs font-semibold text-white group transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5E6AD2] to-[#EC4899] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Plus className="w-4 h-4" />
          </div>
          <span>Tạo Playlist Mới</span>
        </button>

        {/* Playlists List */}
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8F98] px-1 block mb-1">
            Danh sách playlist của bạn ({customPlaylists.length})
          </span>

          {customPlaylists.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#8A8F98]">
              Bạn chưa có playlist nào. Hãy tạo mới ở trên!
            </div>
          ) : (
            customPlaylists.map((pl) => {
              const alreadyHas = pl.tracks?.some((t) => t.id === track.id) || addedPlaylists.has(pl.id);

              return (
                <div
                  key={pl.id}
                  onClick={() => handleSelectPlaylist(pl)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer group transition-all border ${
                    alreadyHas
                      ? 'bg-[#5E6AD2]/10 border-[#5E6AD2]/30 text-white'
                      : 'hover:bg-white/[0.06] border-transparent text-[#EDEDEF]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={pl.cover_url}
                      alt={pl.title}
                      className="w-10 h-10 rounded-xl object-cover border border-white/[0.08] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold group-hover:text-white truncate">
                        {pl.title}
                      </p>
                      <p className="text-[10px] text-[#8A8F98] font-mono">
                        {pl.tracks?.length || 0} bài hát
                      </p>
                    </div>
                  </div>

                  {alreadyHas ? (
                    <div className="w-6 h-6 rounded-full bg-[#5E6AD2] text-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-white/20 group-hover:border-white text-transparent group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
