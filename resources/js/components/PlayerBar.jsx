import React, { useState } from 'react';
import { 
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
  Maximize2, 
  Mic2, 
  ListMusic,
  Plus,
  PanelRight,
  Tv2
} from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';
import { Link } from 'react-router-dom';
import AddToPlaylistModal from './AddToPlaylistModal';

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
    isRightPanelOpen,
    isLyricsOpen,
    isFullScreenLyricsOpen,
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
    toggleRightPanel,
    toggleLyrics,
    toggleFullScreenLyrics,
    toggleQueue,
    toggleFullscreen,
    toggleLike,
  } = useAudioStore();

  const [hoverTime, setHoverTime] = useState(null);
  const [isHoveringScrubber, setIsHoveringScrubber] = useState(false);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);

  if (!currentTrack) {
    return null;
  }

  const isLiked = likedTrackIds.has(currentTrack.id);

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

  const handleScrubberMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(pos * duration);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferPercent = duration > 0 ? Math.min(100, (bufferedTime / duration) * 100) : 0;

  return (
    <>
      <footer className="h-22 bg-[#08080a]/95 backdrop-blur-2xl border-t border-white/[0.08] px-5 flex items-center justify-between select-none relative z-40 shadow-2xl">
        {/* 1. Left: Track Info & Quick Actions (Clicking opens Right Big Cover View) */}
        <div className="flex items-center gap-3.5 w-1/4 min-w-[220px]">
          <div 
            onClick={() => toggleRightPanel()}
            className="relative group flex-shrink-0 cursor-pointer"
            title="Nhấn để mở màn hình bài hát đang phát bên phải"
          >
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
            <div 
              className="overflow-hidden cursor-pointer" 
              onClick={() => toggleRightPanel()} 
              title="Nhấn để mở màn hình bài hát đang phát bên phải"
            >
              <h4 className="text-sm font-semibold text-white hover:text-[#5E6AD2] transition-colors truncate">
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

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsAddToPlaylistOpen(true)}
              className="p-1.5 rounded-full text-[#8A8F98] hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Thêm vào playlist"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleLike(currentTrack.id)}
              className={`p-1.5 rounded-full hover:bg-white/[0.06] transition-colors ${
                isLiked ? 'text-[#10B981]' : 'text-[#8A8F98] hover:text-white'
              }`}
              title={isLiked ? 'Bỏ thích' : 'Yêu thích'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#10B981]' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. Center: Playback Controls & Dual Buffer Scrubber */}
        <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-full transition-colors ${
                isShuffled ? 'text-[#5E6AD2]' : 'text-[#8A8F98] hover:text-white'
              }`}
              title="Trộn bài (Shuffle)"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={prevTrack}
              className="p-1.5 text-[#EDEDEF] hover:text-white hover:scale-110 active:scale-95 transition-all"
              title="Bài trước"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white text-[#050506] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
              title="Phát/Tạm dừng (Space)"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-1.5 text-[#EDEDEF] hover:text-white hover:scale-110 active:scale-95 transition-all"
              title="Bài kế tiếp"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-full transition-colors relative ${
                repeatMode !== 'off' ? 'text-[#5E6AD2]' : 'text-[#8A8F98] hover:text-white'
              }`}
              title={`Chế độ lặp: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Progress Timeline & Scrubber with Buffer Bar */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-[#8A8F98] w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <div
              onClick={handleScrubberClick}
              onMouseEnter={() => setIsHoveringScrubber(true)}
              onMouseLeave={() => setIsHoveringScrubber(false)}
              onMouseMove={handleScrubberMouseMove}
              className="group relative flex-1 h-1.5 hover:h-2.5 bg-white/10 rounded-full cursor-pointer transition-all duration-150 flex items-center"
            >
              {/* Hover Time Tooltip */}
              {isHoveringScrubber && hoverTime !== null && (
                <div
                  className="absolute -top-7 px-2 py-0.5 rounded bg-[#18181b] border border-white/10 text-[10px] font-mono text-white pointer-events-none -translate-x-1/2 shadow-lg z-50"
                  style={{ left: `${Math.max(5, Math.min(95, (hoverTime / duration) * 100))}%` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}

              {/* Buffer Bar */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-white/20 rounded-full transition-all duration-300"
                style={{ width: `${bufferPercent}%` }}
              />

              {/* Played Progress Bar */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-white group-hover:bg-[#5E6AD2] transition-colors rounded-full"
                style={{ width: `${progressPercent}%` }}
              />

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

        {/* 3. Right: Now Playing View, Karaoke, Queue, Volume & Fullscreen */}
        <div className="flex items-center justify-end gap-2 w-1/4 min-w-[220px]">
          {/* Now Playing Panel Toggle (Screenshot 1 & 2 view) */}
          <button
            onClick={() => toggleRightPanel()}
            className={`p-2 rounded-xl transition-all ${
              isRightPanelOpen
                ? 'bg-white/[0.12] text-white border border-white/20'
                : 'text-[#8A8F98] hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Màn hình bài hát đang phát bên phải (Now Playing View)"
          >
            <PanelRight className="w-4 h-4" />
          </button>

          {/* Synchronized Karaoke Lyrics Button */}
          <button
            onClick={() => toggleFullScreenLyrics()}
            className={`p-2 rounded-xl transition-all ${
              isFullScreenLyricsOpen
                ? 'bg-[#135d66] text-white shadow-lg border border-white/20'
                : 'text-[#8A8F98] hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Lời bài hát đồng bộ Karaoke (L)"
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
            title="Danh sách phát & Gợi ý (Q)"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Volume Controls */}
          <div className="flex items-center gap-1.5 group/vol pl-1">
            <button
              onClick={toggleMute}
              className="text-[#8A8F98] hover:text-white p-1"
              title={isMuted ? 'Bật âm (M)' : 'Tắt âm (M)'}
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
              className="w-16 sm:w-20 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#5E6AD2]"
            />
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="text-[#8A8F98] hover:text-white p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors"
            title="Toàn màn hình (F)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        isOpen={isAddToPlaylistOpen}
        onClose={() => setIsAddToPlaylistOpen(false)}
        track={currentTrack}
      />
    </>
  );
}
