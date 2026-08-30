import React, { useMemo, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Share2, 
  MoreHorizontal, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Sparkles,
  Heart,
  Volume2
} from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';

export default function FullScreenLyrics({ isOpen, onClose }) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    likedTrackIds,
    toggleLike
  } = useAudioStore();

  const activeLineRef = useRef(null);
  const containerRef = useRef(null);

  // Parse LRC formatted lyrics
  const parsedLyrics = useMemo(() => {
    if (!currentTrack?.lyrics_lrc) return [];

    const lines = currentTrack.lyrics_lrc.split('\n');
    const result = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    for (const line of lines) {
      const match = line.match(timeRegex);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const milliseconds = parseInt(match[3].padEnd(3, '0').slice(0, 3), 10);
        const time = minutes * 60 + seconds + milliseconds / 1000;
        const text = line.replace(timeRegex, '').trim();
        if (text) result.push({ time, text });
      }
    }
    return result.sort((a, b) => a.time - b.time);
  }, [currentTrack]);

  // Find active line index based on current time
  const activeIndex = useMemo(() => {
    if (parsedLyrics.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (currentTime >= parsedLyrics[i].time) idx = i;
      else break;
    }
    return idx;
  }, [parsedLyrics, currentTime]);

  // Smoothly center the active lyric line
  useEffect(() => {
    if (activeLineRef.current && isOpen) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, isOpen]);

  if (!isOpen || !currentTrack) return null;

  const isLiked = likedTrackIds.has(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remainingSecs = Math.max(0, duration - currentTime);

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleScrubberClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    seek(pos * duration);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#135d66] via-[#0e484f] to-[#08282d] flex flex-col justify-between p-6 md:p-10 select-none animate-in slide-in-from-bottom-6 duration-300 overflow-hidden text-white font-sans">
      {/* 1. Top Header Bar */}
      <div className="flex items-center justify-between z-10">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
          title="Thu nhỏ lời bài hát"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center px-4 min-w-0 max-w-md">
          <p className="text-sm font-bold text-white truncate drop-shadow-sm">
            {currentTrack.title}
          </p>
          <p className="text-xs text-white/70 truncate">
            {currentTrack.artist?.name || 'Artist'}
          </p>
        </div>

        <button
          onClick={() => toggleLike(currentTrack.id)}
          className={`w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors ${
            isLiked ? 'text-[#EC4899]' : 'text-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#EC4899]' : ''}`} />
        </button>
      </div>

      {/* 2. Main Live Synced Lyrics Viewport (Image 2 style) */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto my-6 px-4 md:px-12 py-16 space-y-7 text-left no-scrollbar scroll-smooth"
      >
        {parsedLyrics.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-white/60">
            <Sparkles className="w-12 h-12 text-white/70 animate-pulse" />
            <p className="text-xl font-bold text-white">Chưa có lời bài hát đồng bộ</p>
            <p className="text-sm text-white/70">Đang tận hưởng giai điệu tuyệt vời của ca khúc...</p>
          </div>
        ) : (
          parsedLyrics.map((line, index) => {
            const isActive = index === activeIndex;
            const isPast = index < activeIndex;

            return (
              <div
                key={`${line.time}-${index}`}
                ref={isActive ? activeLineRef : null}
                onClick={() => seek(line.time)}
                className={`cursor-pointer transition-all duration-300 origin-left py-1 ${
                  isActive
                    ? 'text-white font-extrabold text-2xl sm:text-3xl md:text-4xl drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] scale-[1.02]'
                    : isPast
                      ? 'text-white/45 font-bold text-xl sm:text-2xl md:text-3xl hover:text-white/70'
                      : 'text-black/60 font-bold text-xl sm:text-2xl md:text-3xl hover:text-white/60'
                }`}
              >
                {line.text}
              </div>
            );
          })
        )}
      </div>

      {/* 3. Bottom Controls Bar (Image 2 style) */}
      <div className="z-10 max-w-2xl mx-auto w-full space-y-4">
        {/* Scrubber Bar */}
        <div className="space-y-1.5">
          <div
            onClick={handleScrubberClick}
            className="group relative h-2 bg-white/20 hover:h-2.5 rounded-full cursor-pointer transition-all overflow-hidden"
          >
            <div
              className="absolute left-0 top-0 bottom-0 bg-white rounded-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-white/80">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(remainingSecs)}</span>
          </div>
        </div>

        {/* Action Buttons & Centered Play/Pause Button */}
        <div className="flex items-center justify-between pt-1">
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: currentTrack.title, url: window.location.href }).catch(() => {});
              }
            }}
            className="p-2.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            title="Chia sẻ bài hát"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={prevTrack}
              className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-15 h-15 rounded-full bg-white text-[#050506] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            title="Tùy chọn khác"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
