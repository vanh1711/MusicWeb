import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Compass, Play, Music, Sparkles } from 'lucide-react';
import axios from 'axios';
import TrackRow from '../components/TrackRow';
import SpotlightCard from '../components/SpotlightCard';
import { useAudioStore } from '../store/useAudioStore';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(query);
  const [genres, setGenres] = useState([]);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { playTrack } = useAudioStore();

  // Load genres
  useEffect(() => {
    axios.get('/api/genres').then((res) => setGenres(res.data)).catch(() => {});
  }, []);

  // Perform search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    axios.get(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => setResults(res.data))
      .catch((err) => console.error('Search error:', err))
      .finally(() => setIsLoading(false));
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Search Header Input Bar */}
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-4">
          Search & Browse
        </h1>

        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8F98]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Artists, songs, albums, or genres..."
            className="w-full h-13 pl-12 pr-4 rounded-2xl bg-[#0a0a0c] border border-white/[0.08] focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/30 text-sm text-white placeholder-[#8A8F98] outline-none transition-all shadow-card"
          />
        </form>
      </div>

      {/* --- Case 1: Active Search Results --- */}
      {query && results && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top Result + Top Songs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Result Card */}
            {results.top_result && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white tracking-tight">Top Result</h3>
                <SpotlightCard
                  className="p-6 flex flex-col justify-between h-56 cursor-pointer group relative"
                  onClick={() => {
                    if (results.top_result.audio_url) {
                      playTrack(results.top_result);
                    } else if (results.top_result.monthly_listeners !== undefined) {
                      navigate(`/artist/${results.top_result.slug}`);
                    } else if (results.top_result.release_date !== undefined) {
                      navigate(`/album/${results.top_result.slug}`);
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={results.top_result.cover_url || results.top_result.avatar_url || results.top_result.display_cover_url}
                      alt="Top result"
                      className={`w-20 h-20 object-cover shadow-lg ${
                        results.top_result.monthly_listeners !== undefined ? 'rounded-full' : 'rounded-2xl'
                      }`}
                    />
                    <div className="min-w-0">
                      <h4 className="text-xl font-bold text-white group-hover:text-[#5E6AD2] transition-colors truncate">
                        {results.top_result.title || results.top_result.name}
                      </h4>
                      <p className="text-xs text-[#8A8F98] mt-0.5">
                        {results.top_result.artist?.name || (results.top_result.monthly_listeners ? 'Artist' : 'Album')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                    <span className="px-2.5 py-1 rounded-full bg-white/[0.08] text-[10px] font-mono uppercase tracking-wider text-white">
                      {results.top_result.audio_url ? 'Song' : (results.top_result.monthly_listeners ? 'Artist' : 'Album')}
                    </span>
                    <button className="w-10 h-10 rounded-full bg-white text-[#050506] flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-transform">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>
                </SpotlightCard>
              </div>
            )}

            {/* Songs List */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-lg font-bold text-white tracking-tight">Matching Songs</h3>
              {results.tracks?.length === 0 ? (
                <p className="text-xs text-[#8A8F98]">No song matches</p>
              ) : (
                <div className="space-y-1">
                  {results.tracks.slice(0, 4).map((t, idx) => (
                    <TrackRow key={t.id} track={t} index={idx} tracklist={results.tracks} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Artists */}
          {results.artists?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Artists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.artists.map((a) => (
                  <SpotlightCard
                    key={a.id}
                    onClick={() => navigate(`/artist/${a.slug}`)}
                    className="p-4 flex flex-col items-center text-center cursor-pointer group"
                  >
                    <img
                      src={a.avatar_url}
                      alt={a.name}
                      className="w-24 h-24 rounded-full object-cover mb-3 border border-white/[0.08] group-hover:scale-105 transition-transform"
                    />
                    <h4 className="text-sm font-bold text-white group-hover:text-[#5E6AD2] truncate w-full">
                      {a.name}
                    </h4>
                    <span className="text-xs text-[#8A8F98]">Artist</span>
                  </SpotlightCard>
                ))}
              </div>
            </div>
          )}

          {/* Albums */}
          {results.albums?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Albums</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.albums.map((alb) => (
                  <SpotlightCard
                    key={alb.id}
                    onClick={() => navigate(`/album/${alb.slug}`)}
                    className="p-3.5 flex flex-col cursor-pointer group"
                  >
                    <img
                      src={alb.cover_url}
                      alt={alb.title}
                      className="w-full aspect-square rounded-xl object-cover mb-3 group-hover:scale-105 transition-transform"
                    />
                    <h4 className="text-sm font-semibold text-white group-hover:text-[#5E6AD2] truncate">
                      {alb.title}
                    </h4>
                    <p className="text-xs text-[#8A8F98] truncate">{alb.artist?.name}</p>
                  </SpotlightCard>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Case 2: Browse All Categories & Genres (Spotify Angled Tile Style) --- */}
      {!query && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#5E6AD2]" />
            <h2 className="text-xl font-bold text-white tracking-tight">Browse All Categories</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <div
                key={genre.id}
                onClick={() => setSearchParams({ q: genre.name.split(' ')[0] })}
                style={{ backgroundColor: genre.color_accent || '#5E6AD2' }}
                className="relative h-36 rounded-2xl p-4 overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] shadow-card hover:shadow-2xl"
              >
                {/* Genre Title */}
                <h3 className="text-xl font-extrabold text-white tracking-tight leading-tight max-w-[140px] drop-shadow-md">
                  {genre.name}
                </h3>

                {/* Angled Album Artwork Cover */}
                <div className="absolute -bottom-3 -right-3 w-24 h-24 rounded-xl overflow-hidden shadow-2xl transform rotate-[20deg] group-hover:rotate-[12deg] group-hover:scale-110 transition-all duration-300 border border-white/20">
                  <img
                    src={genre.cover_url}
                    alt={genre.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
