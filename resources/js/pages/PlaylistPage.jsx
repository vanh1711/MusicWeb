import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Shuffle, Music, Clock3, Sparkles, Trash2, Plus, Share2, FolderHeart } from 'lucide-react';
import axios from 'axios';
import TrackRow from '../components/TrackRow';
import { useAudioStore } from '../store/useAudioStore';
import { usePlaylistStore } from '../store/usePlaylistStore';

export default function PlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioStore();
  const { customPlaylists, deletePlaylist, removeTrackFromPlaylist } = usePlaylistStore();

  useEffect(() => {
    setIsLoading(true);

    // 1. Check if it's a custom playlist in usePlaylistStore / LocalStorage
    const localPlaylist = customPlaylists.find((pl) => String(pl.id) === String(id));
    if (localPlaylist) {
      setPlaylist(localPlaylist);
      setTracks(localPlaylist.tracks || []);
      setIsLoading(false);
      return;
    }

    // 2. Otherwise fetch from backend API
    axios.get(`/api/playlists/${id}`)
      .then((res) => {
        setPlaylist(res.data.playlist);
        setTracks(res.data.tracks || []);
      })
      .catch((err) => {
        console.error('Playlist load error:', err);
      })
      .finally(() => setIsLoading(false));
  }, [id, customPlaylists]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 rounded-3xl bg-white/[0.04]" />
        <div className="h-96 rounded-2xl bg-white/[0.04]" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-20 space-y-4">
        <FolderHeart className="w-12 h-12 text-[#5E6AD2] mx-auto opacity-50" />
        <h2 className="text-xl font-bold text-white">Không tìm thấy playlist này</h2>
        <p className="text-xs text-[#8A8F98]">Playlist có thể đã bị xóa hoặc không tồn tại.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2 rounded-xl bg-white text-[#050506] text-xs font-bold hover:bg-[#EDEDEF]"
        >
          Quay lại Trang Chủ
        </button>
      </div>
    );
  }

  const isPlaylistPlaying = tracks.some((t) => t.id === currentTrack?.id) && isPlaying;
  const totalDurationSecs = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalMinutes = Math.floor(totalDurationSecs / 60);

  const handleDeletePlaylist = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa playlist "${playlist.title}"?`)) {
      deletePlaylist(playlist.id);
      navigate('/');
    }
  };

  const handleRemoveTrack = (trackId) => {
    removeTrackFromPlaylist(playlist.id, trackId);
  };

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
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#5E6AD2] font-semibold">
              {playlist.is_custom ? 'Playlist Của Bạn (LocalStorage)' : 'Tuyển Tập Nổi Bật'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            {playlist.title}
          </h1>

          <p className="text-xs text-[#8A8F98] max-w-xl">
            {playlist.description || 'Tuyển tập bài hát được lưu trữ trong trình duyệt của bạn.'}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-[#EDEDEF] pt-2">
            <span className="font-semibold">{playlist.user?.name || 'Bạn'}</span>
            <span className="text-[#8A8F98]">•</span>
            <span className="text-[#8A8F98] font-mono">{tracks.length} bài hát, ~{totalMinutes} phút</span>
          </div>
        </div>
      </div>

      {/* 2. Action Controls Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (isPlaylistPlaying) {
                togglePlay();
              } else if (tracks.length > 0) {
                playTrack(tracks[0], tracks);
              }
            }}
            disabled={tracks.length === 0}
            className="w-13 h-13 rounded-full bg-[#5E6AD2] hover:bg-[#6872D9] text-white flex items-center justify-center shadow-accent-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isPlaylistPlaying ? (
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
            disabled={tracks.length === 0}
            className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.10] text-[#EDEDEF] flex items-center justify-center border border-white/[0.08] transition-all disabled:opacity-50"
            title="Xáo trộn bài hát"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>

        {playlist.is_custom && (
          <button
            onClick={handleDeletePlaylist}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa Playlist</span>
          </button>
        )}
      </div>

      {/* 3. Tracks List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[11px] font-mono text-[#8A8F98] uppercase tracking-wider px-4">
          <div className="flex items-center gap-4">
            <span className="w-6 text-center">#</span>
            <span>Tiêu đề</span>
          </div>
          <div className="flex items-center gap-6">
            <Clock3 className="w-3.5 h-3.5" />
            {playlist.is_custom && <span className="w-8 text-center">Xóa</span>}
          </div>
        </div>

        {tracks.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-dashed border-white/[0.06] space-y-3">
            <Music className="w-10 h-10 text-[#5E6AD2] mx-auto opacity-50" />
            <p className="text-sm font-medium text-white">Chưa có bài hát nào trong playlist này</p>
            <p className="text-xs text-[#8A8F98]">
              Hãy tìm kiếm các bài hát yêu thích và nhấn nút "+" để thêm vào đây!
            </p>
            <button
              onClick={() => navigate('/search')}
              className="px-4 py-2 rounded-xl bg-[#5E6AD2] text-white text-xs font-semibold shadow-sm hover:scale-105 transition-transform"
            >
              Tìm Kiếm Bài Hát Ngay
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {tracks.map((track, idx) => (
              <div key={`${track.id}-${idx}`} className="flex items-center group">
                <div className="flex-1 min-w-0">
                  <TrackRow
                    track={track}
                    index={idx}
                    tracklist={tracks}
                  />
                </div>
                {playlist.is_custom && (
                  <button
                    onClick={() => handleRemoveTrack(track.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-[#8A8F98] hover:text-red-400 transition-opacity ml-1"
                    title="Xóa khỏi playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
