import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Compass, Play, Music, Sparkles, Loader2, Zap } from 'lucide-react';
import axios from 'axios';
import TrackRow from '../components/TrackRow';
import SpotlightCard from '../components/SpotlightCard';
import { useAudioStore } from '../store/useAudioStore';

const searchPageCache = new Map();

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(query);
  const [genres, setGenres] = useState([]);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef(null);

  const { playTrack } = useAudioStore();

  // Load genres once
  useEffect(() => {
    axios.get('/api/genres').then((res) => setGenres(res.data)).catch(() => {});
  }, []);

  // Sync input when URL param changes
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Ultra-fast search query effect
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    const cacheKey = q.toLowerCase();
    if (searchPageCache.has(cacheKey)) {
      setResults(searchPageCache.get(cacheKey));
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);

    axios.get(`/api/search?q=${encodeURIComponent(q)}`, {
      signal: abortControllerRef.current.signal,
    })
      .then((res) => {
        searchPageCache.set(cacheKey, res.data);
        if (searchPageCache.size > 50) {
          const first = searchPageCache.keys().next().value;
          searchPageCache.delete(first);
        }
        setResults(res.data);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          console.error('Search error:', err);
        }
      })
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
          Tìm Kiếm & Khám Phá Nhạc Mở
        </h1>

        <form onSubmit={handleSearchSubmit} className="relative">
          {isLoading ? (
            <Loader2 className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#5E6AD2] animate-spin pointer-events-none" />
          ) : (
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8F98] pointer-events-none" />
          )}

          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm bài hát, nghệ sĩ, remix, lofi, nonstop 2026..."
            className="w-full h-13 pl-12 pr-24 rounded-2xl bg-[#0a0a0c] border border-white/[0.08] focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/30 text-sm text-white placeholder-[#8A8F98] outline-none transition-all shadow-card"
          />

          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-[#5E6AD2] hover:bg-[#6872D9] text-white text-xs font-semibold shadow-sm transition-all"
          >
            Tìm Kiếm
          </button>
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white tracking-tight">Kết Quả Nổi Bật</h3>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Full Length 100%
                  </span>
                </div>

                <SpotlightCard
                  className="p-6 flex flex-col justify-between h-56 cursor-pointer group relative"
                  onClick={() => playTrack(results.top_result, results.tracks)}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={results.top_result.cover_url || results.top_result.display_cover_url}
                      alt="Top result"
                      className="w-20 h-20 object-cover shadow-lg rounded-2xl"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xl font-bold text-white group-hover:text-[#5E6AD2] transition-colors truncate">
                        {results.top_result.title || results.top_result.name}
                      </h4>
                      <p className="text-xs text-[#8A8F98] mt-0.5 truncate">
                        {results.top_result.artist?.name || 'Open Creator'}
                      </p>
                      <p className="text-[11px] font-mono text-[#5E6AD2] mt-1">
                        Thời lượng: {results.top_result.duration_formatted}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                    <span className="px-2.5 py-1 rounded-full bg-white/[0.08] text-[10px] font-mono uppercase tracking-wider text-white">
                      {results.top_result.genre || 'Remix / Audio'}
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Danh Sách Bài Hát ({results.tracks?.length || 0})
                </h3>
                <span className="text-xs font-mono text-[#8A8F98]">Phát trực tiếp chất lượng cao</span>
              </div>

              {results.tracks?.length === 0 ? (
                <p className="text-xs text-[#8A8F98]">Không tìm thấy bài hát phù hợp</p>
              ) : (
                <div className="space-y-1">
                  {results.tracks.map((t, idx) => (
                    <TrackRow key={`${t.id}-${idx}`} track={t} index={idx} tracklist={results.tracks} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Artists */}
          {results.artists?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Nghệ Sĩ</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.artists.map((a, idx) => (
                  <SpotlightCard
                    key={a.id || idx}
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
                    <span className="text-xs text-[#8A8F98]">Nghệ sĩ</span>
                  </SpotlightCard>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Case 2: Browse All Categories & Genres --- */}
      {!query && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#5E6AD2]" />
            <h2 className="text-xl font-bold text-white tracking-tight">Danh Mục Âm Nhạc Nổi Bật</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <div
                key={genre.id}
                onClick={() => setSearchParams({ q: genre.name.split(' ')[0] })}
                style={{ backgroundColor: genre.color_accent || '#5E6AD2' }}
                className="relative h-36 rounded-2xl p-4 overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] shadow-card hover:shadow-2xl"
              >
                <h3 className="text-xl font-extrabold text-white tracking-tight leading-tight max-w-[140px] drop-shadow-md">
                  {genre.name}
                </h3>

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
