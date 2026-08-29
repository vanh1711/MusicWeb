import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Pause, Shuffle, Heart, Clock3, Disc, Sparkles, MessageSquare } from 'lucide-react';
import axios from 'axios';
import TrackRow from '../components/TrackRow';
import SpotlightCard from '../components/SpotlightCard';
import WaveformScrubber from '../components/WaveformScrubber';
import TimedComments from '../components/TimedComments';
import { useAudioStore } from '../store/useAudioStore';

export default function AlbumPage() {
  const { slug } = useParams();
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [moreAlbums, setMoreAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioStore();

  useEffect(() => {
    setIsLoading(true);
    axios.get(`/api/albums/${slug}`)
      .then((res) => {
        setAlbum(res.data.album);
        setTracks(res.data.tracks || []);
        setMoreAlbums(res.data.more_albums || []);
      })
      .catch((err) => console.error('Album load error:', err))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading || !album) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 rounded-3xl bg-white/[0.04]" />
        <div className="h-96 rounded-2xl bg-white/[0.04]" />
      </div>
    );
  }

  const isAlbumPlaying = tracks.some((t) => t.id === currentTrack?.id) && isPlaying;
  const activeAlbumTrack = tracks.find((t) => t.id === currentTrack?.id);

  const totalDurationSecs = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalMinutes = Math.floor(totalDurationSecs / 60);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Dynamic Hero Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl overflow-hidden border border-white/[0.08] bg-gradient-to-b from-white/[0.08] to-transparent shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
        {/* Blurred Glow */}
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-[100px] opacity-30 pointer-events-none scale-125"
          style={{ backgroundImage: `url(${album.cover_url})` }}
        />

        {/* Cover Art */}
        <div className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden flex-shrink-0 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.8)] border border-white/10">
          <img
            src={album.cover_url}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Album Meta */}
        <div className="relative z-10 flex-1 text-center md:text-left space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#5E6AD2] font-semibold">
            {album.type?.toUpperCase() || 'ALBUM'}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            {album.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-[#EDEDEF] pt-1">
            <Link
              to={`/artist/${album.artist?.slug}`}
              className="font-bold hover:underline hover:text-[#5E6AD2] flex items-center gap-1.5"
            >
              <img
                src={album.artist?.avatar_url}
                alt={album.artist?.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span>{album.artist?.name}</span>
            </Link>
            <span className="text-[#8A8F98]">•</span>
            <span className="text-[#8A8F98]">{album.release_date ? new Date(album.release_date).getFullYear() : '2026'}</span>
            <span className="text-[#8A8F98]">•</span>
            <span className="text-[#8A8F98] font-mono">{tracks.length} bài hát, ~{totalMinutes} phút</span>
          </div>
        </div>
      </div>

      {/* 2. Action Controls Bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (isAlbumPlaying) {
              togglePlay();
            } else if (tracks.length > 0) {
              playTrack(tracks[0], tracks);
            }
          }}
          className="w-13 h-13 rounded-full bg-[#5E6AD2] hover:bg-[#6872D9] text-white flex items-center justify-center shadow-accent-glow hover:scale-105 active:scale-95 transition-all"
        >
          {isAlbumPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={() => {
            if (tracks.length > 0) {
              const shuffled = [...tracks].sort(() => Math.random() - 0.5);
              playTrack(shuffled[0], shuffled);
            }
          }}
          className="p-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#8A8F98] hover:text-white transition-colors"
          title="Phát Ngẫu Nhiên"
        >
          <Shuffle className="w-5 h-5" />
        </button>
      </div>

      {/* 3. SoundCloud Waveform & Timed Comments Preview (if track playing from this album) */}
      {activeAlbumTrack && (
        <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#5E6AD2] font-semibold">
              Waveform Spectrum: {activeAlbumTrack.title}
            </span>
          </div>
          <WaveformScrubber track={activeAlbumTrack} height={52} showComments={true} />
          <TimedComments track={activeAlbumTrack} />
        </div>
      )}

      {/* 4. Tracklist Table */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 py-2 text-xs font-mono uppercase tracking-wider text-[#8A8F98] border-b border-white/[0.06]">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <span className="w-7 text-center">#</span>
            <span>Tiêu Đề</span>
          </div>
          <div className="hidden md:block w-1/4 px-2">Album</div>
          <div className="hidden lg:block w-24 text-right px-2">Lượt Nghe</div>
          <div className="flex items-center justify-end w-28 pr-3">
            <Clock3 className="w-3.5 h-3.5" />
          </div>
        </div>

        {tracks.map((track, idx) => (
          <TrackRow
            key={track.id}
            track={track}
            index={idx}
            tracklist={tracks}
            showCover={false}
            showAlbum={false}
          />
        ))}
      </div>

      {/* 5. More by Artist */}
      {moreAlbums.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-white/[0.06]">
          <h3 className="text-xl font-bold text-white tracking-tight">
            Thêm từ {album.artist?.name}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {moreAlbums.map((alb) => (
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
                <p className="text-xs text-[#8A8F98]">{alb.type?.toUpperCase()}</p>
              </SpotlightCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
