import React, { useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX, 
  Volume1,
  Heart, 
  Mic2, 
  ListMusic, 
  Maximize2,
  Minimize2,
  Sparkles
} from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';
import { Link } from 'react-router-dom';

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    bufferedTime,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    isLyricsOpen,
    isQueueOpen,
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
    toggleLyrics,
    toggleQueue,
    toggleFullscreen,
    toggleLike,
  } = useAudioStore();

  const [isHoveringTimeline, setIsHoveringTimeline] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const timelineRef = useRef(null);

  if (!currentTrack) {
    return (
      <div className="h-20 bg-[#0a0a0c]/90 backdrop-blur-2xl border-t border-white/[0.06] flex items-center justify-center text-xs text-[#8A8F98] select-none z-40">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#5E6AD2]" />
          <span>Select any track, album, or playlist to start listening</span>
        </div>
      </div>
    );
  }

  const isLiked = likedTrackIds.has(currentTrack.id);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Timeline click / drag handler
  const handleTimelineClick = (e) => {
    if (!timelineRef.current || duration === 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(duration, pos * duration));
    seek(newTime);
  };

  const handleTimelineMouseMove = (e) => {
    if (!timelineRef.current || duration === 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(pos * duration);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferPercent = duration > 0 ? Math.min(100, (bufferedTime / duration) * 100) : 0;

  return (
    <footer className="h-22 bg-[#08080a]/95 backdrop-blur-2xl border-t border-white/[0.08] px-5 flex items-center justify-between select-none relative z-40 shadow-2xl">
      {/* 1. Left: Track Info & Quick Actions */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[220px]">
        <div className="relative group flex-shrink-0">
          <img
            src={currentTrack.cover_url || currentTrack.display_cover_url}
            alt={currentTrack.title}
            className="w-13 h-13 rounded-xl object-cover shadow-md border border-white/[0.08] group-hover:scale-105 transition-transform"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center gap-0.5">
              <span className="w-0.5 bg-[#5E6AD2] visualizer-bar-1 rounded-full"></span>
              <span className="w-0.5 bg-[#5E6AD2] visualizer-bar-2 rounded-full"></span>
              <span className="w-0.5 bg-[#5E6AD2] visualizer-bar-3 rounded-full"></span>
              <span className="w-0.5 bg-[#5E6AD2] visualizer-bar-4 rounded-full"></span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-white hover:text-[#5E6AD2] cursor-pointer transition-colors truncate">
              {currentTrack.title}
            </h4>
          </div>
          <Link
            to={`/artist/${currentTrack.artist?.slug || ''}`}
            className="text-xs text-[#8A8F98] hover:text-[#EDEDEF] hover:underline truncate block"
          >
            {currentTrack.artist?.name || 'Unknown Artist'}
          </Link>
        </div>

        <button
          onClick={() => toggleLike(currentTrack.id)}
          className={`p-2 rounded-full hover:bg-white/[0.06] transition-colors ${
            isLiked ? 'text-[#EC4899]' : 'text-[#8A8F98] hover:text-white'
          }`}
          title={isLiked ? 'Remove from Liked' : 'Save to Liked'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#EC4899]' : ''}`} />
        </button>
      </div>

      {/* 2. Center: Audio Controls & Precision Timeline */}
      <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-2xl px-4">
        {/* Buttons Bar */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-full transition-colors relative ${
              isShuffled ? 'text-[#5E6AD2]' : 'text-[#8A8F98] hover:text-white'
            }`}
            title={`Shuffle: ${isShuffled ? 'On' : 'Off'}`}
          >
            <Shuffle className="w-4 h-4" />
            {isShuffled && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#5E6AD2]"></span>
            )}
          </button>

          <button
            onClick={prevTrack}
            className="text-[#8A8F98] hover:text-white transition-colors active:scale-95"
            title="Previous (or restart)"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-white text-[#050506] hover:bg-[#EDEDEF] hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-md"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current text-[#050506]" />
            ) : (
              <Play className="w-5 h-5 fill-current text-[#050506] ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="text-[#8A8F98] hover:text-white transition-colors active:scale-95"
            title="Next Track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-1.5 rounded-full transition-colors relative ${
              repeatMode !== 'off' ? 'text-[#5E6AD2]' : 'text-[#8A8F98] hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
            {repeatMode !== 'off' && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#5E6AD2]"></span>
            )}
          </button>
        </div>

        {/* Scrubber Timeline */}
        <div className="w-full flex items-center gap-3">
          <span className="text-[11px] font-mono text-[#8A8F98] w-10 text-right">
            {formatTime(currentTime)}
          </span>

          <div
            ref={timelineRef}
            onClick={handleTimelineClick}
            onMouseEnter={() => setIsHoveringTimeline(true)}
            onMouseLeave={() => setIsHoveringTimeline(false)}
            onMouseMove={handleTimelineMouseMove}
            className="relative flex-1 h-4 flex items-center cursor-pointer group"
          >
            {/* Hover timestamp tooltip */}
            {isHoveringTimeline && (
              <div
                className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#0a0a0c] border border-white/10 text-[10px] font-mono text-white pointer-events-none shadow-lg"
                style={{ left: `${(hoverTime / (duration || 1)) * 100}%` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}

            {/* Base track */}
            <div className="w-full h-1 group-hover:h-1.5 rounded-full bg-white/[0.10] overflow-hidden relative transition-all">
              {/* Buffer Progress */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-white/[0.15] transition-all"
                style={{ width: `${bufferPercent}%` }}
              />
              {/* Current Play Progress */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-white group-hover:bg-[#5E6AD2] transition-colors rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Glowing Scrubber Thumb */}
            <div
              className="absolute w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 pointer-events-none"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <span className="text-[11px] font-mono text-[#8A8F98] w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* 3. Right: Lyrics, Queue, Volume & Fullscreen */}
      <div className="flex items-center justify-end gap-2.5 w-1/4 min-w-[220px]">
        {/* Lyrics Button */}
        <button
          onClick={toggleLyrics}
          className={`p-2 rounded-xl transition-all ${
            isLyricsOpen
              ? 'bg-[#5E6AD2] text-white shadow-accent-glow'
              : 'text-[#8A8F98] hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Lyrics (L)"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* Queue Button */}
        <button
          onClick={toggleQueue}
          className={`p-2 rounded-xl transition-all ${
            isQueueOpen
              ? 'bg-[#5E6AD2] text-white shadow-accent-glow'
              : 'text-[#8A8F98] hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Queue (Q)"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Volume Controls */}
        <div className="flex items-center gap-2 group/vol pl-1">
          <button
            onClick={toggleMute}
            className="text-[#8A8F98] hover:text-white p-1"
            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-white/[0.15] rounded-full accent-[#5E6AD2] cursor-pointer appearance-none outline-none"
          />
        </div>

        {/* Fullscreen Player */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl text-[#8A8F98] hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Fullscreen Mode (F)"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </footer>
  );
}
