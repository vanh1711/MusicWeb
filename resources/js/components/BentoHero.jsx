import React from 'react';
import { Play, Sparkles, Radio, Heart } from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';
import { useNavigate } from 'react-router-dom';
import SpotlightCard from './SpotlightCard';

export default function BentoHero({ featuredTracks = [], featuredArtists = [], featuredPlaylists = [] }) {
  const { playTrack, currentTrack, isPlaying } = useAudioStore();
  const navigate = useNavigate();

  const heroTrack = featuredTracks[0];
  const secondaryTrack = featuredTracks[1];
  const topArtist = featuredArtists[0];
  const topPlaylist = featuredPlaylists[0];

  if (!heroTrack) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Main Featured Hero Card (2 cols, 2 rows on large) */}
      <SpotlightCard
        className="md:col-span-2 lg:col-span-2 relative p-7 flex flex-col justify-between min-h-[300px] group cursor-pointer"
        spotlightColor="rgba(94, 106, 210, 0.25)"
        onClick={() => playTrack(heroTrack, featuredTracks)}
      >
        {/* Background Artwork Blend */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 pointer-events-none"
          style={{ backgroundImage: `url(${heroTrack.cover_url || heroTrack.display_cover_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050506] via-[#050506]/70 to-transparent pointer-events-none" />

        {/* Top Tag */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.08] text-xs font-medium text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#5E6AD2] animate-spin" style={{ animationDuration: '8s' }} />
            <span>Featured Track of the Day</span>
          </div>

          <span className="text-xs font-mono text-[#8A8F98]">320kbps Lossless</span>
        </div>

        {/* Bottom Content */}
        <div className="relative z-10 mt-12">
          <p className="text-xs font-mono uppercase tracking-widest text-[#5E6AD2] font-semibold mb-1">
            {heroTrack.artist?.name}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight group-hover:text-white drop-shadow-md">
            {heroTrack.title}
          </h2>
          <p className="text-xs text-[#8A8F98] mt-2 line-clamp-2 max-w-md">
            {heroTrack.album?.title || 'Singles Edition'} • Experience breathtaking synth textures and crisp percussions.
          </p>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                playTrack(heroTrack, featuredTracks);
              }}
              className="px-5 py-2.5 rounded-full bg-white text-[#050506] hover:bg-[#EDEDEF] hover:scale-105 active:scale-95 font-semibold text-xs flex items-center gap-2 transition-all shadow-lg"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Listen Now</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/artist/${heroTrack.artist?.slug}`);
              }}
              className="px-4 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white border border-white/[0.08] transition-colors"
            >
              View Artist
            </button>
          </div>
        </div>
      </SpotlightCard>

      {/* 2. Top Trending Artist Card */}
      {topArtist && (
        <SpotlightCard
          className="relative p-6 flex flex-col justify-between group cursor-pointer min-h-[200px]"
          spotlightColor="rgba(139, 92, 246, 0.20)"
          onClick={() => navigate(`/artist/${topArtist.slug}`)}
        >
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#8A8F98]">Trending Artist</span>
          </div>

          <div className="flex items-center gap-4 my-3">
            <img
              src={topArtist.avatar_url}
              alt={topArtist.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/[0.08] group-hover:scale-105 transition-transform shadow-md"
            />
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white group-hover:text-[#8B5CF6] transition-colors truncate">
                {topArtist.name}
              </h3>
              <p className="text-xs text-[#8A8F98] truncate">
                {(topArtist.monthly_listeners / 1000000).toFixed(1)}M Monthly Listeners
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.06] text-white/80">
                Verified Artist ✓
              </span>
            </div>
          </div>

          <div className="text-[11px] text-[#5E6AD2] font-semibold flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <span>Explore Discography</span>
            <span>→</span>
          </div>
        </SpotlightCard>
      )}

      {/* 3. Top Curated Playlist */}
      {topPlaylist && (
        <SpotlightCard
          className="relative p-6 flex flex-col justify-between group cursor-pointer min-h-[200px]"
          spotlightColor="rgba(236, 72, 153, 0.20)"
          onClick={() => navigate(`/playlist/${topPlaylist.id}`)}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8A8F98]">Curated Playlist</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#EC4899]/20 text-[#EC4899] border border-[#EC4899]/30">
              Hot
            </span>
          </div>

          <div className="flex items-center gap-3.5 my-3">
            <img
              src={topPlaylist.cover_url}
              alt={topPlaylist.title}
              className="w-14 h-14 rounded-xl object-cover border border-white/[0.08] group-hover:scale-105 transition-transform"
            />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white group-hover:text-[#EC4899] transition-colors line-clamp-1">
                {topPlaylist.title}
              </h3>
              <p className="text-xs text-[#8A8F98] line-clamp-2 mt-0.5">
                {topPlaylist.description}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-[#EC4899] font-semibold flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <span>Play Playlist</span>
            <span>→</span>
          </div>
        </SpotlightCard>
      )}
    </div>
  );
}
