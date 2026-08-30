import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Heart, 
  Plus, 
  MoreHorizontal, 
  Clock, 
  Music, 
  Sparkles, 
  Mic2, 
  Share2, 
  Disc3,
  Flame,
  Radio
} from 'lucide-react';
import axios from 'axios';
import { useAudioStore } from '../store/useAudioStore';
import { usePlaylistStore } from '../store/usePlaylistStore';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import LyricsPreviewCard from '../components/LyricsPreviewCard';

export default function TrackPage() {
  const { id } = useParams();
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    likedTrackIds,
    toggleLike,
    toggleRightPanel,
    toggleFullScreenLyrics
  } = useAudioStore();

  const { showToast } = usePlaylistStore();
  const [track, setTrack] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);

  useEffect(() => {
    // Ensure right panel is open
    toggleRightPanel(true);

    setIsLoading(true);
    // If current track matches id, use it immediately
    if (currentTrack && String(currentTrack.id) === String(id)) {
      setTrack(currentTrack);
      fetchRecommendations(currentTrack);
      setIsLoading(false);
      return;
    }

    // Fetch track by universal ID
    axios.get(`/api/tracks/${encodeURIComponent(id)}`)
      .then(res => {
        if (res.data && res.data.track) {
          setTrack(res.data.track);
          fetchRecommendations(res.data.track);
        }
      })
      .catch(() => {
        // Fallback search
        axios.get(`/api/search?q=${encodeURIComponent(id.replace('yt_', '').replace('audius_', ''))}`)
          .then(res => {
            if (res.data && res.data.tracks && res.data.tracks.length > 0) {
              setTrack(res.data.tracks[0]);
              fetchRecommendations(res.data.tracks[0]);
            }
          })
          .catch(() => {});
      })
      .finally(() => setIsLoading(false));
  }, [id, currentTrack?.id]);

  const fetchRecommendations = (targetTrack) => {
    if (!targetTrack) return;
    axios.get('/api/recommendations', {
      params: {
        title: targetTrack.title,
        artist: targetTrack.artist?.name || '',
        track_id: targetTrack.id,
        duration: targetTrack.duration || 210,
      }
    }).then(res => {
      if (res.data && res.data.tracks) {
        setRecommendations(res.data.tracks);
      }
    }).catch(() => {});
  };

  const activeTrack = (currentTrack && String(currentTrack.id) === String(id)) ? currentTrack : track;

  if (isLoading || !activeTrack) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-64 rounded-3xl bg-white/[0.04]" />
        <div className="h-96 rounded-2xl bg-white/[0.02]" />
      </div>
    );
  }

  const isCurrentActive = currentTrack && String(currentTrack.id) === String(activeTrack.id);
  const isLiked = likedTrackIds.has(activeTrack.id);

  const handlePlayHero = () => {
    if (isCurrentActive) {
      togglePlay();
    } else {
      playTrack(activeTrack, [activeTrack, ...recommendations]);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* 1. Spotify-Style Glowing Hero Banner (Matches Screenshot 2) */}
      <div className="relative -mx-6 md:-mx-8 -mt-6 md:-mt-8 p-6 md:p-10 pt-16 bg-gradient-to-b from-[#1d3557]/90 via-[#0a192f]/70 to-transparent flex flex-col md:flex-row items-end gap-6 md:gap-8 border-b border-white/[0.06]">
        {/* Big Album Art */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border border-white/10 bg-[#121216] relative group">
          <img
            src={activeTrack.cover_url || activeTrack.display_cover_url}
            alt={activeTrack.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Track Metadata */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/10 text-white border border-white/10">
              Bài hát
            </span>
            <span className="text-xs text-[#8A8F98]">
              {activeTrack.genre || 'V-Pop'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none break-words">
            {activeTrack.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#EDEDEF] pt-1">
            {activeTrack.artist?.avatar_url && (
              <img
                src={activeTrack.artist.avatar_url}
                alt={activeTrack.artist?.name}
                className="w-6 h-6 rounded-full object-cover border border-white/20"
              />
            )}
            <Link
              to={`/artist/${activeTrack.artist?.slug || ''}`}
              className="font-bold text-white hover:underline hover:text-[#5E6AD2] transition-colors"
            >
              {activeTrack.artist?.name || 'Nghệ sĩ'}
            </Link>
            <span className="text-[#8A8F98]">•</span>
            <span className="text-[#8A8F98]">Đĩa đơn</span>
            <span className="text-[#8A8F98]">•</span>
            <span className="text-[#8A8F98]">2026</span>
            <span className="text-[#8A8F98]">•</span>
            <span className="font-mono text-[#8A8F98]">
              {activeTrack.duration_formatted || '3:30'}
            </span>
            {activeTrack.plays_count && (
              <>
                <span className="text-[#8A8F98]">•</span>
                <span className="text-[#8A8F98]">
                  {Number(activeTrack.plays_count).toLocaleString()} lượt phát
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Action Control Bar (Big Play Button, Heart, Add to Playlist, Karaoke) */}
      <div className="flex items-center gap-4 py-2">
        <button
          onClick={handlePlayHero}
          className="w-14 h-14 rounded-full bg-[#10B981] hover:bg-[#059669] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_24px_rgba(16,185,129,0.5)]"
          title={isCurrentActive && isPlaying ? 'Tạm dừng' : 'Phát'}
        >
          {isCurrentActive && isPlaying ? (
            <Pause className="w-7 h-7 fill-current" />
          ) : (
            <Play className="w-7 h-7 fill-current ml-1" />
          )}
        </button>

        <button
          onClick={() => toggleLike(activeTrack.id)}
          className={`p-3 rounded-full hover:bg-white/[0.08] transition-colors ${
            isLiked ? 'text-[#10B981]' : 'text-[#8A8F98] hover:text-white'
          }`}
          title={isLiked ? 'Bỏ thích' : 'Yêu thích'}
        >
          <Heart className={`w-6 h-6 ${isLiked ? 'fill-[#10B981]' : ''}`} />
        </button>

        <button
          onClick={() => setIsAddToPlaylistOpen(true)}
          className="p-3 rounded-full hover:bg-white/[0.08] text-[#8A8F98] hover:text-white transition-colors"
          title="Thêm vào Playlist"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => toggleFullScreenLyrics(true)}
          className="p-3 rounded-full hover:bg-white/[0.08] text-[#8A8F98] hover:text-white transition-colors"
          title="Mở Lời bài hát Karaoke toàn màn hình"
        >
          <Mic2 className="w-6 h-6" />
        </button>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            showToast('Đã sao chép liên kết bài hát!');
          }}
          className="p-3 rounded-full hover:bg-white/[0.08] text-[#8A8F98] hover:text-white transition-colors"
          title="Chia sẻ liên kết"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Lyrics Preview Section (Matches Screenshot 1 & 2) */}
      <section className="space-y-4 max-w-3xl">
        <LyricsPreviewCard />
      </section>

      {/* 4. Artist Info Card */}
      <section className="space-y-4 max-w-3xl">
        <h3 className="text-xl font-bold text-white tracking-tight">Nghệ sĩ</h3>
        <Link
          to={`/artist/${activeTrack.artist?.slug || ''}`}
          className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all group cursor-pointer"
        >
          <img
            src={activeTrack.artist?.avatar_url || activeTrack.cover_url}
            alt={activeTrack.artist?.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white/10 group-hover:border-[#5E6AD2] transition-colors"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#8A8F98]">Nghệ sĩ chính</p>
            <h4 className="text-base font-bold text-white group-hover:text-[#5E6AD2] transition-colors truncate">
              {activeTrack.artist?.name}
            </h4>
            <p className="text-xs text-[#8A8F98]">
              {Number(activeTrack.artist?.monthly_listeners || 1500000).toLocaleString()} người nghe hàng tháng
            </p>
          </div>
        </Link>
      </section>

      {/* 5. Recommended Next Tracks (Các bài hát tương tự & gợi ý tiếp theo) */}
      {recommendations.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#5E6AD2]" />
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Có thể bạn cũng thích
                </h3>
                <p className="text-xs text-[#8A8F98]">
                  Dựa trên giai điệu và ca sĩ của bài hát này
                </p>
              </div>
            </div>
          </div>

          <div className="p-2 rounded-2xl bg-white/[0.02] border border-white/[0.06] divide-y divide-white/[0.04]">
            {recommendations.slice(0, 10).map((t, idx) => (
              <div
                key={`${t.id}-${idx}`}
                onClick={() => playTrack(t, [activeTrack, ...recommendations])}
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-white/[0.06] cursor-pointer group transition-all"
              >
                <span className="text-xs font-mono text-[#8A8F98] w-5 text-center">
                  {idx + 1}
                </span>
                <img
                  src={t.cover_url || t.display_cover_url}
                  alt={t.title}
                  className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-white/10"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white group-hover:text-[#5E6AD2] transition-colors truncate">
                    {t.title}
                  </p>
                  <p className="text-xs text-[#8A8F98] truncate">
                    {t.artist?.name || 'Artist'}
                  </p>
                </div>
                <span className="text-xs font-mono text-[#8A8F98] flex-shrink-0">
                  {t.duration_formatted}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        isOpen={isAddToPlaylistOpen}
        onClose={() => setIsAddToPlaylistOpen(false)}
        track={activeTrack}
      />
    </div>
  );
}
