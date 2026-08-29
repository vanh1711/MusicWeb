import React, { useState } from 'react';
import { X, UploadCloud, Music, Image, Sparkles, Check } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { useAudioStore } from '../store/useAudioStore';

export default function UploadModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { playTrack } = useAudioStore();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !artistName.trim()) return;

    setIsSubmitting(true);

    // Generate realistic 75-point waveform
    const waveform = [];
    for (let i = 0; i < 75; i++) {
      waveform.push(roundFloat(0.2 + 0.6 * Math.abs(Math.sin(i / 5)) + (Math.random() * 0.2 - 0.1)));
    }

    try {
      const res = await axios.post('/api/tracks/upload', {
        title: title.trim(),
        artist_name: artistName.trim(),
        cover_url: coverUrl.trim() || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
        audio_url: audioUrl.trim() || 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3',
        lyrics_lrc: lyrics.trim(),
        waveform_data: waveform,
        duration: 215,
      });

      try {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#5E6AD2', '#8B5CF6', '#EC4899', '#EDEDEF'],
        });
      } catch (_) {}

      if (res.data && res.data.track) {
        playTrack(res.data.track);
      }

      onClose();
      setTitle('');
      setArtistName('');
      setCoverUrl('');
      setAudioUrl('');
      setLyrics('');
    } catch (err) {
      console.error('Upload track error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  function roundFloat(v) {
    return Math.round(Math.max(0.12, Math.min(0.98, v)) * 100) / 100;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-dropdown rounded-3xl p-7 border border-white/[0.10] shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5E6AD2] to-[#EC4899] flex items-center justify-center text-white shadow-accent-glow">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Creator Studio: Tải Nhạc</h3>
              <p className="text-[11px] text-[#8A8F98]">Phát hành bài hát của bạn lên VanhSound</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#8A8F98] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#8A8F98] mb-1.5">
              Tên bài hát *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sài Gòn Đêm Mưa (Chill Remix)"
              className="w-full h-11 px-4 rounded-xl bg-[#0a0a0c] border border-white/10 focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/30 text-sm text-white placeholder-[#8A8F98] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#8A8F98] mb-1.5">
              Tên Nghệ Sĩ / Performer *
            </label>
            <input
              type="text"
              required
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="e.g. Vanh Producer feat. Luna"
              className="w-full h-11 px-4 rounded-xl bg-[#0a0a0c] border border-white/10 focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/30 text-sm text-white placeholder-[#8A8F98] outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#8A8F98] mb-1.5">
                Ảnh bìa Artwork (URL)
              </label>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://... (hoặc để trống)"
                className="w-full h-11 px-4 rounded-xl bg-[#0a0a0c] border border-white/10 focus:border-[#5E6AD2] text-xs text-white placeholder-[#8A8F98] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#8A8F98] mb-1.5">
                Audio Stream (MP3 URL)
              </label>
              <input
                type="text"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://... (hoặc tự tạo stream)"
                className="w-full h-11 px-4 rounded-xl bg-[#0a0a0c] border border-white/10 focus:border-[#5E6AD2] text-xs text-white placeholder-[#8A8F98] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#8A8F98] mb-1.5">
              Lời bài hát LRC (Karaoke Sync)
            </label>
            <textarea
              rows={3}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="[00:05.00] Dòng lời bài hát đầu tiên..."
              className="w-full p-3 rounded-xl bg-[#0a0a0c] border border-white/10 focus:border-[#5E6AD2] text-xs text-white placeholder-[#8A8F98] outline-none transition-all resize-none font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#8A8F98] hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !artistName.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5E6AD2] to-[#EC4899] hover:opacity-90 active:scale-95 disabled:opacity-50 text-xs font-bold text-white shadow-accent-glow transition-all flex items-center gap-2"
            >
              {isSubmitting ? 'Đang phát hành...' : 'Xuất Bản Bài Hát 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
