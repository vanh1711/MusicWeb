import { create } from 'zustand';

const STORAGE_KEY = 'vanhsound_custom_playlists_v1';

// Default starter custom playlists if none exist
const DEFAULT_PLAYLISTS = [
  {
    id: 'pl_favorites_chill',
    title: 'Giai Điệu Chill Đêm Khuya',
    description: 'Tuyển tập những bài hát acoustic, lofi và chill nhẹ nhàng lúc đêm muộn.',
    cover_url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString(),
    is_custom: true,
    tracks: [
      {
        id: 'yt_ZOEtcR5EW08',
        youtube_id: 'ZOEtcR5EW08',
        title: 'Chúng Ta Của Tương Lai',
        duration: 277,
        duration_formatted: '4:37',
        audio_url: 'https://www.youtube.com/watch?v=ZOEtcR5EW08',
        cover_url: 'https://i.ytimg.com/vi/ZOEtcR5EW08/hqdefault.jpg',
        display_cover_url: 'https://i.ytimg.com/vi/ZOEtcR5EW08/hqdefault.jpg',
        genre: 'V-Pop',
        source: 'youtube',
        artist: { name: 'Sơn Tùng M-TP', slug: 'son-tung-m-tp', avatar_url: 'https://i.ytimg.com/vi/ZOEtcR5EW08/hqdefault.jpg' },
      }
    ]
  },
  {
    id: 'pl_workout_remix',
    title: 'Vinahouse & Remix Bốc Lửa',
    description: 'Năng lượng bùng nổ cho buổi tập gym và quẩy cùng bạn bè.',
    cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    created_at: new Date().toISOString(),
    is_custom: true,
    tracks: []
  }
];

const loadInitialPlaylists = () => {
  if (typeof window === 'undefined') return DEFAULT_PLAYLISTS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load playlists from localStorage:', err);
  }
  return DEFAULT_PLAYLISTS;
};

export const usePlaylistStore = create((set, get) => ({
  customPlaylists: loadInitialPlaylists(),
  activeToast: null,

  showToast: (message) => {
    set({ activeToast: message });
    setTimeout(() => {
      if (get().activeToast === message) {
        set({ activeToast: null });
      }
    }, 3000);
  },

  // Save to LocalStorage helper
  saveToStorage: (playlists) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
      } catch (err) {
        console.error('LocalStorage write error:', err);
      }
    }
  },

  // Create a new playlist
  createPlaylist: (title, description = '', customCover = '') => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return null;

    const defaultCovers = [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80'
    ];

    const randomCover = defaultCovers[Math.floor(Math.random() * defaultCovers.length)];

    const newPlaylist = {
      id: 'pl_local_' + Date.now(),
      title: cleanTitle,
      description: description.trim() || 'Playlist tạo bởi bạn trên VanhSound',
      cover_url: customCover.trim() || randomCover,
      created_at: new Date().toISOString(),
      is_custom: true,
      tracks: []
    };

    set((state) => {
      const updated = [newPlaylist, ...state.customPlaylists];
      get().saveToStorage(updated);
      return { customPlaylists: updated };
    });

    get().showToast(`Đã tạo playlist "${cleanTitle}" thành công!`);
    return newPlaylist;
  },

  // Add track to a playlist
  addTrackToPlaylist: (playlistId, track) => {
    if (!track) return false;

    let added = false;
    let playlistTitle = '';

    set((state) => {
      const updated = state.customPlaylists.map((pl) => {
        if (pl.id === playlistId) {
          playlistTitle = pl.title;
          const exists = pl.tracks.some((t) => t.id === track.id);
          if (exists) {
            return pl; // already exists
          }
          added = true;
          return {
            ...pl,
            cover_url: pl.tracks.length === 0 ? (track.cover_url || track.display_cover_url || pl.cover_url) : pl.cover_url,
            tracks: [...pl.tracks, track],
            updated_at: new Date().toISOString()
          };
        }
        return pl;
      });

      if (added) {
        get().saveToStorage(updated);
        return { customPlaylists: updated };
      }
      return state;
    });

    if (added) {
      get().showToast(`Đã thêm "${track.title}" vào playlist "${playlistTitle}"!`);
      return true;
    } else {
      get().showToast(`Bài hát đã có sẵn trong playlist "${playlistTitle}"!`);
      return false;
    }
  },

  // Remove track from a playlist
  removeTrackFromPlaylist: (playlistId, trackId) => {
    set((state) => {
      const updated = state.customPlaylists.map((pl) => {
        if (pl.id === playlistId) {
          return {
            ...pl,
            tracks: pl.tracks.filter((t) => t.id !== trackId),
            updated_at: new Date().toISOString()
          };
        }
        return pl;
      });

      get().saveToStorage(updated);
      return { customPlaylists: updated };
    });

    get().showToast('Đã xóa bài hát khỏi playlist.');
  },

  // Delete a playlist
  deletePlaylist: (playlistId) => {
    set((state) => {
      const updated = state.customPlaylists.filter((pl) => pl.id !== playlistId);
      get().saveToStorage(updated);
      return { customPlaylists: updated };
    });

    get().showToast('Đã xóa playlist.');
  },

  // Get a playlist by ID
  getPlaylistById: (id) => {
    return get().customPlaylists.find((pl) => String(pl.id) === String(id));
  },
}));
