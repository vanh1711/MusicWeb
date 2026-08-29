import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Shuffle, Music, Clock3, Sparkles } from 'lucide-react';
import axios from 'axios';
import TrackRow from '../components/TrackRow';
import { useAudioStore } from '../store/useAudioStore';

export default function PlaylistPage() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioStore();

  useEffect(() => {
    setIsLoading(true);
    axios.get(`/api/playlists/${id}`)
      .then((res) => {
        setPlaylist(res.data.playlist);
        setTracks(res.data.tracks || []);
      })
      .catch((err) => console.error('Playlist load error:', err))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading || !playlist) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 rounded-3xl bg-white/[0.04]" />
        <div className="h-96 rounded-2xl bg-white/[0.04]" />
      </div>
    );
  }

  const isPlaylistPlaying = tracks.some((t) => t.id === currentTrack?.id) && isPlaying;
  const totalDurationSecs = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalMinutes = Math.floor(totalDurationSecs / 60);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Dynamic Hero Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl overflow-hidden border border-white/[0.08] bg-gradient-to-b from-white/[0.08] to-transparent shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
        {/* Background Glow */}
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-[100px] opacity-25 pointer-events-none scale-125"
          style={{ backgroundImage: `url(${playlist.cover_url})` }}
        />

        {/* Cover Art */}
        <div className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl border border-white/10">
          <img
            src={playlist.cover_url}
            alt={playlist.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Playlist Info */}
        <div className="relative z-10 flex-1 text-center md:text-left space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#5E6AD2] font-semibold">
            Public Playlist
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            {playlist.title}
          </h1>

          <p className="text-xs text-[#8A8F98] max-w-xl">
            {playlist.description}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-[#EDEDEF] pt-2">
            <span className="font-semibold">{playlist.user?.name || 'Curated'}</span>
            <span className="text-[#8A8F98]">•</span>
            <span className="text-[#8A8F98] font-mono">{tracks.length} tracks, ~{totalMinutes} mins</span>
          </div>
        </div>
      </div>

      {/* 2. Action Controls Bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (isPlaylistPlaying) {
              togglePlay();
            } else if (tracks.length > 0) {
              playTrack(tracks[0], tracks);
            }
          }}
          className="w-13 h-13 rounded-full bg-[#5E6AD2] hover:bg-[#6872D9] text-white flex items-center justify-center shadow-accent-glow hover:scale-105 active:scale-95 transition-all"
        >
          <Play className="w-6 h-6 fill-current ml-0.5" />
        </button>

        <button
          onClick={() => {
            if (tracks.length > 0) {
              const shuffled = [...tracks].sort(() => Math.random() - 0.5);
              playTrack(shuffled[0], shuffled);
            }
          }}
          className="p-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#8A8F98] hover:text-white transition-colors"
          title="Shuffle Play"
        >
          <Shuffle className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Tracklist Table */}
      <div className="space-y-1">
        {/* Table Header */}
        <div className="flex items-center justify-between px-3 py-2 text-xs font-mono uppercase tracking-wider text-[#8A8F98] border-b border-white/[0.06]">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <span className="w-7 text-center">#</span>
            <span>Title</span>
          </div>
          <div className="hidden md:block w-1/4 px-2">Album</div>
          <div className="hidden lg:block w-24 text-right px-2">Plays</div>
          <div className="flex items-center justify-end w-28 pr-3">
            <Clock3 className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Tracks */}
        {tracks.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#8A8F98]">
            This playlist currently has no tracks.
          </div>
        ) : (
          tracks.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              tracklist={tracks}
              showCover={true}
              showAlbum={true}
            />
          ))
        )}
      </div>
    </div>
  );
}
