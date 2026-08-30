import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Music, Sparkles, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePlaylistStore } from '../store/usePlaylistStore';

export default function CreatePlaylistModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customCover, setCustomCover] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { createPlaylist } = usePlaylistStore();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);

    const newPlaylist = createPlaylist(title, description, customCover);

    // Delight micro-animation confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#5E6AD2', '#8B5CF6', '#EC4899', '#EDEDEF'],
      });
    } catch (_) {}

    setIsLoading(false);
    onClose();
    setTitle('');
    setDescription('');
    setCustomCover('');

    if (newPlaylist) {
      navigate(`/playlist/${newPlaylist.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-dropdown rounded-3xl p-6 border border-white/[0.12] shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5E6AD2]/15 border border-[#5E6AD2]/30 flex items-center justify-center text-[#5E6AD2]">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Tạo Playlist Mới</h3>
              <p className="text-[11px] text-[#8A8F98]">Lưu tự động vào bộ nhớ LocalStorage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#8A8F98] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#8A8F98] mb-1.5">
              Tên Playlist *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ví dụ: Nhạc Chill Đêm Muộn, Nhạc Tập Gym..."
              className="w-full h-11 px-4 rounded-xl bg-[#0a0a0c] border border-white/10 focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/30 text-sm text-white placeholder-[#8A8F98] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#8A8F98] mb-1.5">
              Mô tả (Tùy chọn)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Thêm mô tả cho tuyển tập của bạn..."
              className="w-full p-3 rounded-xl bg-[#0a0a0c] border border-white/10 focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/30 text-sm text-white placeholder-[#8A8F98] outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#8A8F98] mb-1.5">
              Link Ảnh Bìa (Tùy chọn)
            </label>
            <input
              type="url"
              value={customCover}
              onChange={(e) => setCustomCover(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full h-11 px-4 rounded-xl bg-[#0a0a0c] border border-white/10 focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/30 text-sm text-white placeholder-[#8A8F98] outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#8A8F98] hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5E6AD2] to-[#EC4899] hover:opacity-90 active:scale-95 text-xs font-bold text-white shadow-accent-glow transition-all disabled:opacity-50"
            >
              {isLoading ? 'Đang tạo...' : 'Tạo Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
