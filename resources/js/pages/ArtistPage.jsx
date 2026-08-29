import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, CheckCircle2, Radio, Disc, Sparkles, UserPlus, UserCheck } from 'lucide-react';
import axios from 'axios';
import TrackRow from '../components/TrackRow';
import SpotlightCard from '../components/SpotlightCard';
import WaveformScrubber from '../components/WaveformScrubber';
import TimedComments from '../components/TimedComments';
import { useAudioStore } from '../store/useAudioStore';
import { useAuthStore } from '../store/useAuthStore';

export default function ArtistPage() {
  const { slug } = useParams();
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  const { playTrack, currentTrack, isPlaying } = useAudioStore();
  const { isAuthenticated, openLoginModal } = useAuthStore();

  useEffect(() => {
    setIsLoading(true);
    axios.get(`/api/artists/${slug}`)
      .then((res) => {
        setArtist(res.data.artist);
        setTopTracks(res.data.top_tracks || []);
        setAlbums(res.data.albums || []);
        setRelatedArtists(res.data.related_artists || []);
        setIsFollowing(res.data.is_following || false);
      })
      .catch((err) => console.error('Artist load error:', err))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (!artist) return;

    try {
      const res = await axios.post(`/api/artists/${artist.id}/follow`);
      setIsFollowing(res.data.is_following);
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  if (isLoading || !artist) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-80 rounded-3xl bg-white/[0.04]" />
        <div className="h-64 rounded-2xl bg-white/[0.04]" />
      </div>
    );
  }

  const activeArtistTrack = topTracks.find((t) => t.id === currentTrack?.id);

  return (
    <div className="space-y-10 pb-12">
      {/* 1. Cinematic Hero Banner */}
      <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl flex flex-col justify-end p-8">
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-75 scale-105"
          style={{ backgroundImage: `url(${artist.banner_url || artist.avatar_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050506] via-[#050506]/50 to-transparent" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#5E6AD2]">
            <CheckCircle2 className="w-4 h-4 fill-current text-white" />
            <span className="font-bold uppercase tracking-wider text-white">Nghệ Sĩ Xác Minh</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
            {artist.name}
          </h1>

          <p className="text-xs text-[#EDEDEF] font-mono">
            {(artist.monthly_listeners / 1000000).toFixed(1)}M Người Nghe Hàng Tháng
          </p>

          <p className="text-xs text-[#8A8F98] line-clamp-2 max-w-xl">
            {artist.bio}
          </p>
        </div>
      </div>

      {/* 2. Action Controls Bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (topTracks.length > 0) {
              playTrack(topTracks[0], topTracks);
            }
          }}
          className="w-13 h-13 rounded-full bg-[#5E6AD2] hover:bg-[#6872D9] text-white flex items-center justify-center shadow-accent-glow hover:scale-105 active:scale-95 transition-all"
        >
          <Play className="w-6 h-6 fill-current ml-0.5" />
        </button>

        <button
          onClick={handleFollowToggle}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all ${
            isFollowing
              ? 'bg-white text-[#050506] border-white'
              : 'border-white/20 text-white hover:border-white hover:bg-white/[0.08]'
          }`}
        >
          {isFollowing ? (
            <>
              <UserCheck className="w-3.5 h-3.5" />
              <span>Đang Theo Dõi</span>
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5" />
              <span>Theo Dõi</span>
            </>
          )}
        </button>
      </div>

      {/* 3. SoundCloud Waveform & Timed Comments Preview (if track playing from artist) */}
      {activeArtistTrack && (
        <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#5E6AD2] font-semibold">
              Live Waveform: {activeArtistTrack.title}
            </span>
          </div>
          <WaveformScrubber track={activeArtistTrack} height={52} showComments={true} />
          <TimedComments track={activeArtistTrack} />
        </div>
      )}

      {/* 4. Popular Top Tracks */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Bài Hát Phổ Biến</h2>
        <div className="space-y-1">
          {topTracks.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              tracklist={topTracks}
              showCover={true}
              showAlbum={true}
            />
          ))}
        </div>
      </section>

      {/* 5. Discography (Albums & Singles) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Danh Sách Đĩa Nhạc</h2>
          <span className="text-xs font-mono text-[#8A8F98]">{albums.length} phát hành</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {albums.map((album) => (
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
              <h4 className="text-sm font-semibold text-white group-hover:text-[#5E6AD2] truncate">
                {album.title}
              </h4>
              <p className="text-xs text-[#8A8F98] mt-0.5">
                {album.release_date ? new Date(album.release_date).getFullYear() : '2026'} • {album.type?.toUpperCase()}
              </p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* 6. Fans Also Like */}
      {relatedArtists.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-white/[0.06]">
          <h2 className="text-xl font-bold text-white tracking-tight">Khán Giả Cũng Nghe</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedArtists.map((rel) => (
              <SpotlightCard
                key={rel.id}
                onClick={() => navigate(`/artist/${rel.slug}`)}
                className="p-4 flex flex-col items-center text-center cursor-pointer group"
              >
                <img
                  src={rel.avatar_url}
                  alt={rel.name}
                  className="w-24 h-24 rounded-full object-cover mb-3 group-hover:scale-105 transition-transform"
                />
                <h4 className="text-sm font-bold text-white group-hover:text-[#5E6AD2] truncate w-full">
                  {rel.name}
                </h4>
                <span className="text-xs text-[#8A8F98]">Nghệ sĩ</span>
              </SpotlightCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
