import React, { useState } from 'react';
import { Play, Pause, Heart, MoreHorizontal, Plus, ListPlus, Radio } from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';
import { Link } from 'react-router-dom';

export default function TrackRow({
  track,
  index,
  tracklist = [],
  showCover = true,
  showAlbum = true,
  showPlays = true,
}) {
  const { currentTrack, isPlaying, playTrack, togglePlay, likedTrackIds, toggleLike, addToQueue } = useAudioStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isLiked = likedTrackIds.has(track.id);

  const handlePlayClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, tracklist.length > 0 ? tracklist : [track]);
    }
  };

  const formatPlays = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div
      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
        isCurrent
          ? 'bg-white/[0.08] text-white border border-white/[0.06]'
          : 'hover:bg-white/[0.04] text-[#8A8F98] hover:text-[#EDEDEF]'
      }`}
    >
      {/* 1. Index / Play Trigger & Title Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Index or Animated Visualizer or Play Button */}
        <div className="w-7 flex items-center justify-center flex-shrink-0">
          {isCurrent && isPlaying ? (
            <div className="flex items-center gap-0.5 group-hover:hidden">
              <span className="w-0.5 bg-[#5E6AD2] visualizer-bar-1 rounded-full"></span>
              <span className="w-0.5 bg-[#5E6AD2] visualizer-bar-2 rounded-full"></span>
              <span className="w-0.5 bg-[#5E6AD2] visualizer-bar-3 rounded-full"></span>
            </div>
          ) : (
            <span className={`text-xs font-mono group-hover:hidden ${isCurrent ? 'text-[#5E6AD2] font-semibold' : 'text-[#8A8F98]'}`}>
              {index !== undefined ? index + 1 : track.track_number}
            </span>
          )}

          <button
            onClick={handlePlayClick}
            className="hidden group-hover:flex w-7 h-7 rounded-full bg-white text-[#050506] items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-md"
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Cover Art */}
        {showCover && (
          <img
            src={track.cover_url || track.display_cover_url}
            alt={track.title}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/[0.06]"
          />
        )}

        {/* Track Title & Artist */}
        <div className="min-w-0 flex-1 pr-2">
          <p className={`text-sm font-semibold truncate transition-colors ${
            isCurrent ? 'text-[#5E6AD2]' : 'text-[#EDEDEF] group-hover:text-white'
          }`}>
            {track.title}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[#8A8F98] truncate">
            {track.is_featured && (
              <span className="px-1.5 py-0.2 rounded bg-white/[0.08] text-[10px] font-mono uppercase tracking-wider text-white/80">
                Hit
              </span>
            )}
            <Link
              to={`/artist/${track.artist?.slug || ''}`}
              className="hover:text-white hover:underline truncate"
            >
              {track.artist?.name || 'Artist'}
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Album Name */}
      {showAlbum && (
        <div className="hidden md:block w-1/4 min-w-0 px-2">
          <Link
            to={`/album/${track.album?.slug || ''}`}
            className="text-xs text-[#8A8F98] hover:text-[#EDEDEF] hover:underline truncate block"
          >
            {track.album?.title || 'Single'}
          </Link>
        </div>
      )}

      {/* 3. Plays Count */}
      {showPlays && (
        <div className="hidden lg:block w-24 text-right px-2">
          <span className="text-xs text-[#8A8F98] font-mono">
            {formatPlays(track.plays_count)}
          </span>
        </div>
      )}

      {/* 4. Actions & Duration */}
      <div className="flex items-center justify-end gap-3 w-28 flex-shrink-0">
        <button
          onClick={() => toggleLike(track.id)}
          className={`p-1 rounded-full transition-opacity ${
            isLiked ? 'text-[#EC4899] opacity-100' : 'text-[#8A8F98] opacity-0 group-hover:opacity-100 hover:text-white'
          }`}
          title={isLiked ? 'Remove from Liked' : 'Like'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#EC4899]' : ''}`} />
        </button>

        <span className="text-xs text-[#8A8F98] font-mono w-10 text-right">
          {track.duration_formatted}
        </span>

        {/* More Options Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded-lg text-[#8A8F98] opacity-0 group-hover:opacity-100 hover:text-white hover:bg-white/[0.08] transition-all"
            title="More Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div
              onMouseLeave={() => setIsMenuOpen(false)}
              className="absolute right-0 top-8 w-44 glass-dropdown rounded-xl p-1 z-50 shadow-2xl"
            >
              <button
                onClick={() => {
                  addToQueue(track);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#EDEDEF] hover:bg-white/[0.08] rounded-lg transition-colors text-left"
              >
                <ListPlus className="w-3.5 h-3.5 text-[#5E6AD2]" />
                <span>Add to Queue</span>
              </button>
              <button
                onClick={() => {
                  toggleLike(track.id);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#EDEDEF] hover:bg-white/[0.08] rounded-lg transition-colors text-left"
              >
                <Heart className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>{isLiked ? 'Remove from Liked' : 'Save to Liked'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
