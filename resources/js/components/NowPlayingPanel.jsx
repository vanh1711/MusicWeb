import React, { useState } from 'react';
import { 
  X, 
  MoreHorizontal, 
  Heart, 
  Share2, 
  Plus, 
  Play, 
  Pause, 
  Music, 
  Sparkles, 
  ListMusic, 
  Radio, 
  UserCheck, 
  UserPlus, 
  Mic2,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';
import { Link } from 'react-router-dom';
import AddToPlaylistModal from './AddToPlaylistModal';

export default function NowPlayingPanel() {
  const {
    currentTrack,
    isPlaying,
    queue,
    queueIndex,
    isRightPanelOpen,
    toggleRightPanel,
    playTrack,
    likedTrackIds,
    toggleLike,
    toggleFullScreenLyrics
  } = useAudioStore();

  const [showUpNext, setShowUpNext] = useState(false);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [followedArtists, setFollowedArtists] = useState(new Set());

  if (!isRightPanelOpen || !currentTrack) return null;

  const isLiked = likedTrackIds.has(currentTrack.id);
  const upNextTracks = queue.slice(queueIndex + 1);

  const toggleFollow = (artistName) => {
    setFollowedArtists(prev => {
      const next = new Set(prev);
      if (next.has(artistName)) next.delete(artistName);
      else next.add(artistName);
      return next;
    });
  };

  return (
    <>
      <aside className="w-80 lg:w-92 flex-shrink-0 h-full flex flex-col bg-[#070709]/95 backdrop-blur-2xl border-l border-white/[0.08] select-none z-30 animate-in slide-in-from-right-4 duration-300">
        {/* 1. Header matching Spotify Top Bar */}
        <div className="p-4 pb-3 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#5E6AD2] animate-pulse" />
            <h3 className="text-sm font-bold text-white tracking-tight truncate">
              {currentTrack.album?.title || 'Đang phát'}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleFullScreenLyrics(true)}
              className="p-1.5 rounded-lg text-[#8A8F98] hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Mở Lời bài hát Karaoke"
            >
              <Mic2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleRightPanel(false)}
              className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#8A8F98] hover:text-white flex items-center justify-center transition-colors"
              title="Đóng bảng bên phải"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
          {/* Big Track Cover Artwork (Ảnh To theo ảnh mẫu) */}
          <div className="relative group w-full aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#121216]">
            <img
              src={currentTrack.cover_url || currentTrack.display_cover_url}
              alt={currentTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="text-[11px] font-mono text-white/90 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                {currentTrack.genre || 'V-Pop'} • 320kbps HD
              </span>
            </div>
          </div>

          {/* Track Title, Artist & Quick Actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-extrabold text-white tracking-tight leading-snug line-clamp-2 hover:text-[#5E6AD2] transition-colors">
                {currentTrack.title}
              </h2>
              <Link
                to={`/artist/${currentTrack.artist?.slug || ''}`}
                className="text-xs text-[#8A8F98] hover:text-white hover:underline transition-colors mt-0.5 block truncate"
              >
                {currentTrack.artist?.name || 'Nghệ sĩ'}
              </Link>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
              <button
                onClick={() => setIsAddToPlaylistOpen(true)}
                className="p-2 rounded-full hover:bg-white/[0.08] text-[#8A8F98] hover:text-white transition-colors"
                title="Thêm vào Playlist"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                onClick={() => toggleLike(currentTrack.id)}
                className={`p-2 rounded-full hover:bg-white/[0.08] transition-colors ${
                  isLiked ? 'text-[#10B981]' : 'text-[#8A8F98] hover:text-white'
                }`}
                title={isLiked ? 'Bỏ thích' : 'Yêu thích'}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#10B981]' : ''}`} />
              </button>
            </div>
          </div>

          {/* 3. Dedicated Interactive Button to Reveal Up Next Recommendations */}
          <div className="pt-1">
            <button
              onClick={() => setShowUpNext(!showUpNext)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-xs font-semibold text-white transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#5E6AD2]/20 border border-[#5E6AD2]/40 flex items-center justify-center text-[#5E6AD2] group-hover:scale-105 transition-transform">
                  <ListMusic className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="font-bold">Danh sách bài gợi ý tiếp theo</p>
                  <p className="text-[10px] text-[#8A8F98]">
                    {upNextTracks.length > 0 ? `${upNextTracks.length} bài hát đang chờ` : 'Đang tải gợi ý...'}
                  </p>
                </div>
              </div>

              {showUpNext ? (
                <ChevronUp className="w-4 h-4 text-[#8A8F98] group-hover:text-white" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#8A8F98] group-hover:text-white" />
              )}
            </button>

            {/* Expanded Up Next List */}
            {showUpNext && (
              <div className="mt-2 p-2 rounded-xl bg-[#0f0f13] border border-white/[0.06] space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                {upNextTracks.length === 0 ? (
                  <div className="py-4 text-center text-xs text-[#8A8F98]">
                    Đang tìm bài hát cùng thể loại phù hợp...
                  </div>
                ) : (
                  upNextTracks.slice(0, 8).map((track, idx) => (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => playTrack(track, queue)}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.06] cursor-pointer group transition-all"
                    >
                      <span className="text-[10px] font-mono text-[#8A8F98] w-4 text-center">
                        {idx + 1}
                      </span>
                      <img
                        src={track.cover_url || track.display_cover_url}
                        alt={track.title}
                        className="w-9 h-9 rounded-md object-cover flex-shrink-0 border border-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white group-hover:text-[#5E6AD2] truncate">
                          {track.title}
                        </p>
                        <p className="text-[10px] text-[#8A8F98] truncate">
                          {track.artist?.name || 'Artist'}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-[#8A8F98] flex-shrink-0">
                        {track.duration_formatted}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 4. Credits Section matching Screenshot 1 & 2 */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white tracking-wide">Credits</h4>
              <span className="text-[10px] font-mono text-[#8A8F98]">V-Music Master</span>
            </div>

            {/* Main Artist */}
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {currentTrack.artist?.name || 'H2O Remix'}
                </p>
                <p className="text-[10px] text-[#8A8F98]">Nghệ sĩ chính (Main Artist)</p>
              </div>
              <button
                onClick={() => toggleFollow(currentTrack.artist?.name || 'main')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  followedArtists.has(currentTrack.artist?.name || 'main')
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-white border-white/30 hover:border-white'
                }`}
              >
                {followedArtists.has(currentTrack.artist?.name || 'main') ? 'Following' : 'Follow'}
              </button>
            </div>

            {/* Composer / Producer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {currentTrack.album?.title || 'VanhSound Music Team'}
                </p>
                <p className="text-[10px] text-[#8A8F98]">Nhạc sĩ & Sản xuất (Composer)</p>
              </div>
              <button
                onClick={() => toggleFollow('composer')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  followedArtists.has('composer')
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-white border-white/30 hover:border-white'
                }`}
              >
                {followedArtists.has('composer') ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        isOpen={isAddToPlaylistOpen}
        onClose={() => setIsAddToPlaylistOpen(false)}
        track={currentTrack}
      />
    </>
  );
}
