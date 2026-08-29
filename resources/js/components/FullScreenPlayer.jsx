import React, { useEffect, useMemo, useRef } from 'react';
import { 
  Minimize2, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Heart, 
  Volume2, 
  VolumeX,
  Volume1,
  Sparkles
} from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';

export default function FullScreenPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    isFullscreen,
    likedTrackIds,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleFullscreen,
    toggleLike,
  } = useAudioStore();

  const activeLineRef = useRef(null);

  // Parse lyrics for fullscreen view
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

  const activeIndex = useMemo(() => {
    if (parsedLyrics.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (currentTime >= parsedLyrics[i].time) idx = i;
      else break;
    }
    return idx;
  }, [parsedLyrics, currentTime]);

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex]);

  if (!isFullscreen || !currentTrack) return null;

  const isLiked = likedTrackIds.has(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050506] flex flex-col justify-between p-8 md:p-12 overflow-hidden select-none animate-in fade-in zoom-in-95 duration-300">
      {/* Dynamic Ambient Background Blurred Artwork */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-[140px] opacity-25 scale-125 pointer-events-none transition-all duration-1000"
        style={{ backgroundImage: `url(${currentTrack.cover_url || currentTrack.display_cover_url})` }}
      />
      <div className="absolute inset-0 bg-[#050506]/70 pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/[0.08] flex items-center justify-center border border-white/[0.08]">
            <Sparkles className="w-4 h-4 text-[#5E6AD2]" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#8A8F98]">Playing from album</p>
            <p className="text-sm font-semibold text-white">{currentTrack.album?.title || 'Singles Collection'}</p>
          </div>
        </div>

        <button
          onClick={toggleFullscreen}
          className="p-3 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white transition-all shadow-md"
          title="Exit Fullscreen (Esc/F)"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Center Stage: Artwork + Synced Lyrics */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto w-full my-6 min-h-0">
        {/* Left: Giant Vinyl Artwork */}
        <div className="flex flex-col items-center lg:items-start justify-center">
          <div className="relative group max-w-md w-full aspect-square">
            <img
              src={currentTrack.cover_url || currentTrack.display_cover_url}
              alt={currentTrack.title}
              className="w-full h-full rounded-3xl object-cover shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_80px_rgba(94,106,210,0.2)] border border-white/[0.12] transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>

          <div className="mt-8 flex items-center justify-between w-full max-w-md">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {currentTrack.title}
              </h2>
              <p className="text-base text-[#8A8F98] mt-1 font-medium">
                {currentTrack.artist?.name}
              </p>
            </div>
            <button
              onClick={() => toggleLike(currentTrack.id)}
              className={`p-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition-colors ${
                isLiked ? 'text-[#EC4899]' : 'text-[#8A8F98] hover:text-white'
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-[#EC4899]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right: Synced Lyrics Waterfall */}
        <div className="h-[360px] lg:h-[440px] overflow-y-auto pr-4 space-y-6 flex flex-col justify-center no-scrollbar mask-gradient">
          {parsedLyrics.length === 0 ? (
            <div className="text-center text-[#8A8F98] py-12">
              <p className="text-xl font-semibold text-white/80">Instrumental or No Lyrics</p>
              <p className="text-sm text-[#8A8F98] mt-2">Immerse in the audio soundscape</p>
            </div>
          ) : (
            parsedLyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              return (
                <p
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => seek(line.time)}
                  className={`cursor-pointer transition-all duration-300 leading-snug font-bold ${
                    isActive
                      ? 'text-white text-3xl md:text-4xl scale-105 drop-shadow-[0_0_18px_rgba(94,106,210,0.6)] text-[#EDEDEF]'
                      : 'text-white/30 text-2xl hover:text-white/70'
                  }`}
                >
                  {line.text}
                </p>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 max-w-4xl mx-auto w-full space-y-4">
        {/* Scrubber Timeline */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-[#8A8F98]">{formatTime(currentTime)}</span>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              seek(pos * duration);
            }}
            className="flex-1 h-3 flex items-center cursor-pointer group"
          >
            <div className="w-full h-1.5 rounded-full bg-white/[0.12] overflow-hidden relative">
              <div
                className="absolute top-0 bottom-0 left-0 bg-[#5E6AD2] rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-mono text-[#8A8F98]">{formatTime(duration)}</span>
        </div>

        {/* Buttons Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full ${isShuffled ? 'text-[#5E6AD2]' : 'text-[#8A8F98] hover:text-white'}`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-6">
            <button onClick={prevTrack} className="text-[#8A8F98] hover:text-white transition-colors">
              <SkipBack className="w-7 h-7 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-white text-[#050506] hover:scale-105 active:scale-95 flex items-center justify-center shadow-xl transition-all"
            >
              {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
            </button>
            <button onClick={nextTrack} className="text-[#8A8F98] hover:text-white transition-colors">
              <SkipForward className="w-7 h-7 fill-current" />
            </button>
          </div>

          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full ${repeatMode !== 'off' ? 'text-[#5E6AD2]' : 'text-[#8A8F98] hover:text-white'}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
