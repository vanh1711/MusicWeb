import React, { useState, useEffect } from 'react';
import { Heart, Play, Shuffle, Clock3, Sparkles } from 'lucide-react';
import axios from 'axios';
import TrackRow from '../components/TrackRow';
import { useAudioStore } from '../store/useAudioStore';

export default function LikedSongsPage() {
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { playTrack, currentTrack, isPlaying, togglePlay, likedTrackIds } = useAudioStore();

  useEffect(() => {
    setIsLoading(true);
    axios.get('/api/favorites')
      .then((res) => setTracks(res.data.tracks || []))
      .catch((err) => console.error('Favorites load error:', err))
      .finally(() => setIsLoading(false));
  }, [likedTrackIds]);

  const isLikedPlaying = tracks.some((t) => t.id === currentTrack?.id) && isPlaying;
  const totalDurationSecs = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalMinutes = Math.floor(totalDurationSecs / 60);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Gradient Hero Banner */}
      <div className="relative p-8 rounded-3xl overflow-hidden border border-white/[0.08] bg-gradient-to-br from-[#8B5CF6]/30 via-[#EC4899]/15 to-transparent shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-8">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#EC4899]/15 filter blur-[90px] pointer-events-none" />

        {/* Heart Tile */}
        <div className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center flex-shrink-0 shadow-[0_20px_50px_rgba(236,72,153,0.3)]">
          <Heart className="w-20 h-20 text-white fill-white" />
        </div>

        {/* Info */}
        <div className="relative z-10 flex-1 text-center md:text-left space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-white/80 font-semibold">
            Auto Collection
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
            Liked Songs
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-[#EDEDEF] pt-2">
            <span className="font-semibold">Alex Rivera</span>
            <span className="text-[#8A8F98]">•</span>
            <span className="text-[#8A8F98] font-mono">{tracks.length} tracks, ~{totalMinutes} mins</span>
          </div>
        </div>
      </div>

      {/* 2. Controls */}
      {tracks.length > 0 && (
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (isLikedPlaying) {
                togglePlay();
              } else if (tracks.length > 0) {
                playTrack(tracks[0], tracks);
              }
            }}
            className="w-13 h-13 rounded-full bg-[#EC4899] hover:bg-[#F472B6] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(236,72,153,0.4)] hover:scale-105 active:scale-95 transition-all"
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
      )}

      {/* 3. Tracklist */}
      <div className="space-y-1">
        {tracks.length === 0 ? (
          <div className="p-16 text-center text-[#8A8F98] border border-dashed border-white/[0.06] rounded-3xl">
            <Heart className="w-10 h-10 text-[#EC4899]/50 mx-auto mb-3" />
            <p className="text-base font-semibold text-white">Songs you like will appear here</p>
            <p className="text-xs text-[#8A8F98] mt-1">Save tracks by tapping the heart icon on any song.</p>
          </div>
        ) : (
          <div>
            {/* Header */}
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

            {/* Rows */}
            {tracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                tracklist={tracks}
                showCover={true}
                showAlbum={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
