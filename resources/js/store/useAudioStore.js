import { create } from 'zustand';
import axios from 'axios';

let globalAudio = null;
let globalYTPlayer = null;
let ytPollInterval = null;

if (typeof window !== 'undefined') {
  globalAudio = new Audio();
  globalAudio.preload = 'auto';
}

export const useAudioStore = create((set, get) => ({
  // Core Playback State
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  bufferedTime: 0,
  volume: typeof window !== 'undefined' ? parseFloat(localStorage.getItem('musicweb_volume') || '0.75') : 0.75,
  isMuted: false,

  // Queue & Playlist State
  queue: [],
  queueIndex: 0,
  history: [],
  isShuffled: false,
  repeatMode: 'off', // 'off' | 'all' | 'one'
  isLoadingRecommendations: false,

  // UI Panels State
  isLyricsOpen: false,
  isFullScreenLyricsOpen: false,
  isQueueOpen: false,
  isFullscreen: false,
  likedTrackIds: new Set([1, 4, 6]),

  // Init Audio & YouTube Listeners
  initAudio: () => {
    if (typeof window === 'undefined') return;

    // 1. Initialize HTML5 Audio listeners
    if (globalAudio && !globalAudio._initialized) {
      globalAudio._initialized = true;
      globalAudio.volume = get().volume;

      globalAudio.addEventListener('timeupdate', () => {
        if (get().currentTrack?.source !== 'youtube') {
          set({ currentTime: globalAudio.currentTime });
        }
      });

      globalAudio.addEventListener('durationchange', () => {
        if (get().currentTrack?.source !== 'youtube') {
          set({ duration: globalAudio.duration || get().currentTrack?.duration || 0 });
        }
      });

      globalAudio.addEventListener('progress', () => {
        if (get().currentTrack?.source !== 'youtube' && globalAudio.buffered.length > 0) {
          set({ bufferedTime: globalAudio.buffered.end(globalAudio.buffered.length - 1) });
        }
      });

      globalAudio.addEventListener('ended', () => {
        if (get().currentTrack?.source !== 'youtube') {
          const { repeatMode, nextTrack } = get();
          if (repeatMode === 'one') {
            globalAudio.currentTime = 0;
            globalAudio.play().catch(() => {});
          } else {
            nextTrack();
          }
        }
      });

      globalAudio.addEventListener('play', () => {
        if (get().currentTrack?.source !== 'youtube') set({ isPlaying: true });
      });

      globalAudio.addEventListener('pause', () => {
        if (get().currentTrack?.source !== 'youtube') set({ isPlaying: false });
      });

      globalAudio.addEventListener('error', (e) => {
        console.warn('HTML5 Audio notice:', e);
        // If error, try next track
        if (get().isPlaying) {
          setTimeout(() => get().nextTrack(), 1000);
        }
      });
    }

    // 2. Initialize YouTube IFrame Audio API player (hidden)
    const initYT = () => {
      if (window.YT && window.YT.Player && !globalYTPlayer) {
        try {
          globalYTPlayer = new window.YT.Player('vanhsound-yt-player', {
            height: '200',
            width: '200',
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              playsinline: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: (event) => {
                event.target.setVolume(get().volume * 100);
              },
              onStateChange: (event) => {
                if (get().currentTrack?.source === 'youtube') {
                  if (event.data === window.YT.PlayerState.PLAYING) {
                    set({ isPlaying: true, duration: globalYTPlayer.getDuration() || get().currentTrack?.duration || 0 });
                  } else if (event.data === window.YT.PlayerState.PAUSED) {
                    set({ isPlaying: false });
                  } else if (event.data === window.YT.PlayerState.ENDED) {
                    const { repeatMode, nextTrack } = get();
                    if (repeatMode === 'one') {
                      globalYTPlayer.seekTo(0, true);
                      globalYTPlayer.playVideo();
                    } else {
                      nextTrack();
                    }
                  }
                }
              },
              onError: (event) => {
                console.warn('YouTube playback error code:', event.data);
                // Auto skip on unplayable video
                setTimeout(() => get().nextTrack(), 800);
              },
            },
          });
        } catch (err) {
          console.warn('YouTube Player init error:', err);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      initYT();
    } else {
      window.onYouTubeIframeAPIReady = initYT;
    }

    // 3. Start high-precision polling timer for YouTube progress
    if (!ytPollInterval) {
      ytPollInterval = setInterval(() => {
        const { currentTrack, isPlaying } = get();
        if (currentTrack?.source === 'youtube' && globalYTPlayer && isPlaying) {
          try {
            if (typeof globalYTPlayer.getCurrentTime === 'function') {
              const cur = globalYTPlayer.getCurrentTime() || 0;
              const dur = globalYTPlayer.getDuration() || currentTrack.duration || 0;
              const fraction = typeof globalYTPlayer.getVideoLoadedFraction === 'function' 
                ? globalYTPlayer.getVideoLoadedFraction() 
                : 0;

              set({
                currentTime: cur,
                duration: dur > 0 ? dur : currentTrack.duration || 0,
                bufferedTime: fraction * dur,
              });
            }
          } catch (_) {}
        }
      }, 250);
    }

    // 4. Keyboard Shortcuts Setup
    if (!window._vanhKeyListenersAdded) {
      window._vanhKeyListenersAdded = true;
      window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

        if (e.code === 'Space') {
          e.preventDefault();
          get().togglePlay();
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          get().seek(Math.min(get().duration, get().currentTime + 5));
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          get().seek(Math.max(0, get().currentTime - 5));
        } else if (e.code === 'ArrowUp') {
          e.preventDefault();
          get().setVolume(Math.min(1, get().volume + 0.05));
        } else if (e.code === 'ArrowDown') {
          e.preventDefault();
          get().setVolume(Math.max(0, get().volume - 0.05));
        } else if (e.key.toLowerCase() === 'm') {
          get().toggleMute();
        } else if (e.key.toLowerCase() === 'l') {
          get().toggleLyrics();
        } else if (e.key.toLowerCase() === 'q') {
          get().toggleQueue();
        } else if (e.key.toLowerCase() === 'f') {
          get().toggleFullscreen();
        }
      });
    }

    // Fetch initial favorites
    axios.get('/api/favorites').then(res => {
      if (res.data && res.data.tracks) {
        const ids = new Set(res.data.tracks.map(t => t.id));
        set({ likedTrackIds: ids });
      }
    }).catch(() => {});
  },

  // Fetch smart recommendations and append to queue
  fetchRecommendations: async (track) => {
    if (!track) return;
    set({ isLoadingRecommendations: true });

    try {
      const res = await axios.get('/api/recommendations', {
        params: {
          title: track.title,
          artist: track.artist?.name || '',
          track_id: track.id,
          duration: track.duration || 240,
        },
      });

      const recs = res.data.tracks || [];
      if (recs.length > 0) {
        set((state) => {
          // Append recommended tracks avoiding duplicates
          const existingIds = new Set(state.queue.map(t => t.id));
          const newUniqueRecs = recs.filter(t => !existingIds.has(t.id));

          return {
            queue: [...state.queue, ...newUniqueRecs],
            isLoadingRecommendations: false,
          };
        });
      }
    } catch (err) {
      console.warn('Failed to fetch recommendations:', err);
    } finally {
      set({ isLoadingRecommendations: false });
    }
  },

  // Play a specific track
  playTrack: (track, newQueue = null) => {
    if (!track) return;
    get().initAudio();

    let queue = [];
    let queueIndex = 0;

    if (newQueue && Array.isArray(newQueue) && newQueue.length > 1) {
      // User clicked a track from an explicit list/playlist
      queue = [...newQueue];
      const idx = queue.findIndex(t => t.id === track.id);
      queueIndex = idx !== -1 ? idx : 0;
    } else {
      // User played a single track (from search, quick pick, etc.)
      queue = [track];
      queueIndex = 0;
    }

    const isYT = track.source === 'youtube' || !!track.youtube_id;
    const ytVideoId = track.youtube_id || (isYT ? String(track.id).replace('yt_', '') : null);

    set({
      currentTrack: track,
      queue,
      queueIndex,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration || 0,
      bufferedTime: 0,
    });

    if (isYT && ytVideoId) {
      if (globalAudio) globalAudio.pause();

      if (globalYTPlayer && typeof globalYTPlayer.loadVideoById === 'function') {
        globalYTPlayer.loadVideoById(ytVideoId);
        globalYTPlayer.playVideo();
      } else {
        setTimeout(() => {
          if (globalYTPlayer && typeof globalYTPlayer.loadVideoById === 'function') {
            globalYTPlayer.loadVideoById(ytVideoId);
            globalYTPlayer.playVideo();
          }
        }, 500);
      }
    } else {
      if (globalYTPlayer && typeof globalYTPlayer.pauseVideo === 'function') {
        globalYTPlayer.pauseVideo();
      }

      if (globalAudio && track.audio_url) {
        globalAudio.src = track.audio_url;
        globalAudio.play().catch(err => {
          console.warn('HTML5 Auto-play notice:', err);
        });
      }
    }

    // Media Session API
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist?.name || 'Artist',
        album: track.album?.title || 'VanhSound Release',
        artwork: [
          { src: track.cover_url || track.display_cover_url || '', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => get().resume());
      navigator.mediaSession.setActionHandler('pause', () => get().pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => get().prevTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => get().nextTrack());
      navigator.mediaSession.setActionHandler('seekto', (details) => get().seek(details.seekTime || 0));
    }

    // Automatically trigger background smart recommendations to populate upcoming queue!
    get().fetchRecommendations(track);

    // Automatically fetch real synchronized LRC lyrics if not yet fetched
    if (!track.lyrics_lrc || track.lyrics_lrc.includes('Đang phát:') || track.lyrics_lrc.includes('Thưởng thức')) {
      axios.get('/api/lyrics', {
        params: {
          title: track.title,
          artist: track.artist?.name || '',
          duration: track.duration || 0,
        }
      }).then(res => {
        if (res.data && res.data.lyrics_lrc) {
          set(state => {
            if (state.currentTrack?.id === track.id) {
              return {
                currentTrack: {
                  ...state.currentTrack,
                  lyrics_lrc: res.data.lyrics_lrc,
                }
              };
            }
            return state;
          });
        }
      }).catch(() => {});
    }

    if (track.id) {
      axios.post(`/api/tracks/${track.id}/play`).catch(() => {});
    }
  },

  togglePlay: () => {
    const { isPlaying, currentTrack, resume, pause } = get();
    if (!currentTrack) return;
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  },

  pause: () => {
    const { currentTrack } = get();
    if (currentTrack?.source === 'youtube' && globalYTPlayer && typeof globalYTPlayer.pauseVideo === 'function') {
      globalYTPlayer.pauseVideo();
    } else if (globalAudio) {
      globalAudio.pause();
    }
    set({ isPlaying: false });
  },

  resume: () => {
    const { currentTrack } = get();
    if (!currentTrack) return;

    if (currentTrack.source === 'youtube' && globalYTPlayer && typeof globalYTPlayer.playVideo === 'function') {
      globalYTPlayer.playVideo();
    } else if (globalAudio) {
      globalAudio.play().catch(() => {});
    }
    set({ isPlaying: true });
  },

  seek: (newTime) => {
    const { currentTrack } = get();
    set({ currentTime: newTime });

    if (currentTrack?.source === 'youtube' && globalYTPlayer && typeof globalYTPlayer.seekTo === 'function') {
      globalYTPlayer.seekTo(newTime, true);
    } else if (globalAudio) {
      globalAudio.currentTime = newTime;
    }
  },

  setVolume: (vol) => {
    const safeVol = Math.max(0, Math.min(1, vol));
    set({ volume: safeVol, isMuted: safeVol === 0 });
    localStorage.setItem('musicweb_volume', safeVol.toString());

    if (globalAudio) globalAudio.volume = safeVol;
    if (globalYTPlayer && typeof globalYTPlayer.setVolume === 'function') {
      globalYTPlayer.setVolume(safeVol * 100);
    }
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    const newMuted = !isMuted;
    set({ isMuted: newMuted });

    if (globalAudio) globalAudio.muted = newMuted;
    if (globalYTPlayer) {
      if (newMuted) {
        if (typeof globalYTPlayer.mute === 'function') globalYTPlayer.mute();
      } else {
        if (typeof globalYTPlayer.unMute === 'function') globalYTPlayer.unMute();
      }
    }
  },

  nextTrack: () => {
    const { queue, queueIndex, isShuffled, playTrack, currentTrack } = get();
    if (queue.length === 0) return;

    let nextIdx = queueIndex + 1;
    if (isShuffled) {
      nextIdx = Math.floor(Math.random() * queue.length);
    }

    if (nextIdx < queue.length) {
      // Move to the next queued/recommended song!
      const nextSong = queue[nextIdx];
      
      // Update queue index and play
      set({ queueIndex: nextIdx });
      
      // Play through same queue without wiping it
      const isYT = nextSong.source === 'youtube' || !!nextSong.youtube_id;
      const ytVideoId = nextSong.youtube_id || (isYT ? String(nextSong.id).replace('yt_', '') : null);

      set({
        currentTrack: nextSong,
        isPlaying: true,
        currentTime: 0,
        duration: nextSong.duration || 0,
        bufferedTime: 0,
      });

      if (isYT && ytVideoId) {
        if (globalAudio) globalAudio.pause();
        if (globalYTPlayer && typeof globalYTPlayer.loadVideoById === 'function') {
          globalYTPlayer.loadVideoById(ytVideoId);
          globalYTPlayer.playVideo();
        }
      } else {
        if (globalYTPlayer && typeof globalYTPlayer.pauseVideo === 'function') {
          globalYTPlayer.pauseVideo();
        }
        if (globalAudio && nextSong.audio_url) {
          globalAudio.src = nextSong.audio_url;
          globalAudio.play().catch(() => {});
        }
      }

      // If near end of queue, fetch more recommendations
      if (nextIdx >= queue.length - 2) {
        get().fetchRecommendations(nextSong);
      }
    } else {
      // Reached end, loop or fetch fresh recommendations
      get().fetchRecommendations(currentTrack);
      set({ queueIndex: 0 });
    }
  },

  prevTrack: () => {
    const { queue, queueIndex, currentTime, seek, playTrack } = get();
    if (currentTime > 3) {
      seek(0);
      return;
    }

    if (queue.length === 0) return;
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }

    const prevSong = queue[prevIdx];
    set({ queueIndex: prevIdx });

    const isYT = prevSong.source === 'youtube' || !!prevSong.youtube_id;
    const ytVideoId = prevSong.youtube_id || (isYT ? String(prevSong.id).replace('yt_', '') : null);

    set({
      currentTrack: prevSong,
      isPlaying: true,
      currentTime: 0,
      duration: prevSong.duration || 0,
      bufferedTime: 0,
    });

    if (isYT && ytVideoId) {
      if (globalAudio) globalAudio.pause();
      if (globalYTPlayer && typeof globalYTPlayer.loadVideoById === 'function') {
        globalYTPlayer.loadVideoById(ytVideoId);
        globalYTPlayer.playVideo();
      }
    } else {
      if (globalYTPlayer && typeof globalYTPlayer.pauseVideo === 'function') {
        globalYTPlayer.pauseVideo();
      }
      if (globalAudio && prevSong.audio_url) {
        globalAudio.src = prevSong.audio_url;
        globalAudio.play().catch(() => {});
      }
    }
  },

  toggleShuffle: () => {
    set((state) => ({ isShuffled: !state.isShuffled }));
  },

  toggleRepeat: () => {
    set((state) => {
      const modes = ['off', 'all', 'one'];
      const nextMode = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length];
      return { repeatMode: nextMode };
    });
  },

  toggleLyrics: () => set((state) => ({ isLyricsOpen: !state.isLyricsOpen, isQueueOpen: false })),
  toggleFullScreenLyrics: (force) => set((state) => ({ 
    isFullScreenLyricsOpen: typeof force === 'boolean' ? force : !state.isFullScreenLyricsOpen,
    isLyricsOpen: false 
  })),
  toggleQueue: () => set((state) => ({ isQueueOpen: !state.isQueueOpen, isLyricsOpen: false })),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

  toggleLike: async (trackId) => {
    try {
      const res = await axios.post('/api/favorites/toggle', { track_id: trackId });
      set((state) => {
        const nextSet = new Set(state.likedTrackIds);
        if (res.data.is_liked) {
          nextSet.add(trackId);
        } else {
          nextSet.delete(trackId);
        }
        return { likedTrackIds: nextSet };
      });
    } catch (err) {
      console.error('Toggle like error:', err);
    }
  },

  removeFromQueue: (index) => {
    set((state) => {
      const newQ = [...state.queue];
      newQ.splice(index, 1);
      return { queue: newQ };
    });
  },

  clearQueue: () => {
    set((state) => ({
      queue: state.currentTrack ? [state.currentTrack] : [],
      queueIndex: 0,
    }));
  },
}));
