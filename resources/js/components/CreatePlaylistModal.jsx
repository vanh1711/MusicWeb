import React, { useState } from 'react';
import { X, Plus, Music, Sparkles } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';

export default function CreatePlaylistModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const res = await axios.post('/api/playlists', {
        title: title.trim(),
        description: description.trim(),
      });

      // Delight micro-animation confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#5E6AD2', '#8B5CF6', '#EC4899', '#EDEDEF'],
        });
      } catch (_) {}

      if (onCreated) onCreated(res.data);
      onClose();
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Failed to create playlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-dropdown rounded-3xl p-6 border border-white/[0.10] shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#5E6AD2]/10 border border-[#5E6AD2]/30 flex items-center justify-center text-[#5E6AD2]">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Create New Playlist</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#8A8F98] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#8A8F98] mb-1.5">
              Playlist Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Late Night Coding Vibes"
              className="w-full h-11 px-4 rounded-xl bg-[#0a0a0c] border border-white/10 focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/30 text-sm text-white placeholder-[#8A8F98] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#8A8F98] mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give your playlist a memorable description..."
              className="w-full p-3.5 rounded-xl bg-[#0a0a0c] border border-white/10 focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/30 text-sm text-white placeholder-[#8A8F98] outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#8A8F98] hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#5E6AD2] hover:bg-[#6872D9] active:scale-95 disabled:opacity-50 text-xs font-semibold text-white shadow-accent-glow transition-all flex items-center gap-2"
            >
              {isLoading ? 'Creating...' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
