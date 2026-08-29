import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, Flame, Disc, Radio, ArrowRight, Music2, Globe2, Zap } from 'lucide-react';
import axios from 'axios';
import BentoHero from '../components/BentoHero';
import SpotlightCard from '../components/SpotlightCard';
import TrackRow from '../components/TrackRow';
import { useAudioStore } from '../store/useAudioStore';

export default function HomePage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { playTrack } = useAudioStore();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    axios.get('/api/browse/featured')
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => console.error('Failed to load featured music:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-72 rounded-3xl bg-white/[0.04] border border-white/[0.06]" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
    );
  }

  const { 
    featured_tracks = [], 
    featured_playlists = [], 
    featured_artists = [], 
    new_releases = [], 
    quick_picks = [],
    audius_trending = []
  } = data || {};

  return (
    <div className="space-y-10 pb-12">
      {/* 1. Asymmetric Bento Hero */}
      <BentoHero
        featuredTracks={featured_tracks}
        featuredArtists={featured_artists}
        featuredPlaylists={featured_playlists}
      />

      {/* 2. Quick Picks Grid (6 items with instant hover play) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#EC4899]" />
            <h2 className="text-xl font-bold text-white tracking-tight">Nghe Nhanh & Đang Thịnh Hành</h2>
          </div>
          <span className="text-xs font-mono text-[#8A8F98]">Phát trực tiếp chất lượng cao</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quick_picks.map((track, idx) => (
            <div
              key={track.id || idx}
              onClick={() => playTrack(track, quick_picks)}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] group cursor-pointer transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={track.cover_url || track.display_cover_url}
                  alt={track.title}
                  className="w-12 h-12 rounded-xl object-cover border border-white/[0.08] group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white group-hover:text-[#5E6AD2] transition-colors truncate">
                    {track.title}
                  </p>
                  <p className="text-xs text-[#8A8F98] truncate">{track.artist?.name}</p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playTrack(track, quick_picks);
                }}
                className="w-9 h-9 rounded-full bg-white text-[#050506] opacity-0 group-hover:opacity-100 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg mr-1"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 🔥 Trending Toàn Cầu (Audius Open Network - Full Length Tracks) */}
      {audius_trending.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#8B5CF6]" />
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Thịnh Hành Toàn Cầu (Audius Network)</h2>
                <p className="text-xs text-[#8A8F98]">Bản thu hoàn chỉnh (Full Track 320kbps) • Không giới hạn</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/search?q=remix')}
              className="text-xs font-semibold text-[#8B5CF6] hover:text-[#a78bfa] flex items-center gap-1 transition-colors"
            >
              <span>Khám phá thêm EDM/Remix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {audius_trending.slice(0, 6).map((track, idx) => (
              <SpotlightCard
                key={track.id || idx}
                onClick={() => playTrack(track, audius_trending)}
                className="p-3.5 flex flex-col group cursor-pointer"
                spotlightColor="rgba(139, 92, 246, 0.20)"
              >
                <div className="relative aspect-square mb-3 overflow-hidden rounded-xl">
                  <img
                    src={track.cover_url}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTrack(track, audius_trending);
                    }}
                    className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(139,92,246,0.5)] translate-y-2 group-hover:translate-y-0"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-[#8B5CF6] transition-colors truncate">
                  {track.title}
                </h3>
                <p className="text-xs text-[#8A8F98] truncate mt-0.5">
                  {track.artist?.name}
                </p>
              </SpotlightCard>
            ))}
          </div>
        </section>
      )}

      {/* 4. Featured Playlists */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-[#5E6AD2]" />
            <h2 className="text-xl font-bold text-white tracking-tight">Tuyển Tập Nổi Bật</h2>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="text-xs font-semibold text-[#5E6AD2] hover:text-[#6872D9] flex items-center gap-1 transition-colors"
          >
            <span>Tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {featured_playlists.map((pl) => (
            <SpotlightCard
              key={pl.id}
              onClick={() => navigate(`/playlist/${pl.id}`)}
              className="p-3.5 flex flex-col group cursor-pointer"
            >
              <div className="relative aspect-square mb-3 overflow-hidden rounded-xl">
                <img
                  src={pl.cover_url}
                  alt={pl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/playlist/${pl.id}`);
                  }}
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#5E6AD2] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 transition-all shadow-accent-glow translate-y-2 group-hover:translate-y-0"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>

              <h3 className="text-sm font-semibold text-white group-hover:text-[#5E6AD2] transition-colors truncate">
                {pl.title}
              </h3>
              <p className="text-xs text-[#8A8F98] line-clamp-2 mt-1">
                {pl.description}
              </p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* 5. Top Trending Artists */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#EC4899]" />
            <h2 className="text-xl font-bold text-white tracking-tight">Nghệ Sĩ Được Yêu Thích</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {featured_artists.map((artist) => (
            <SpotlightCard
              key={artist.id}
              onClick={() => navigate(`/artist/${artist.slug}`)}
              className="p-4 flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3.5 border-2 border-white/[0.08] shadow-md group-hover:border-[#5E6AD2]/50 transition-colors">
                <img
                  src={artist.avatar_url}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-[#5E6AD2] transition-colors truncate w-full">
                {artist.name}
              </h3>
              <p className="text-xs text-[#8A8F98] mt-0.5">
                {(artist.monthly_listeners / 1000000).toFixed(1)}M người nghe
              </p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* 6. New Releases */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-xl font-bold text-white tracking-tight">Phát Hành Mới</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {new_releases.map((album) => (
            <SpotlightCard
              key={album.id}
              onClick={() => navigate(`/album/${album.slug}`)}
              className="p-3.5 flex flex-col group cursor-pointer"
            >
              <div className="relative aspect-square mb-3 overflow-hidden rounded-xl">
                <img
                  src={album.cover_url}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <h3 className="text-sm font-semibold text-white group-hover:text-[#5E6AD2] transition-colors truncate">
                {album.title}
              </h3>
              <p className="text-xs text-[#8A8F98] truncate mt-0.5">
                {album.artist?.name} • {album.type?.toUpperCase()}
              </p>
            </SpotlightCard>
          ))}
        </div>
      </section>
    </div>
  );
}
