import { create } from 'zustand';
import axios from 'axios';

// Global single HTML5 Audio element instance
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
  queueIndex: -1,
  history: [],
  isShuffled: false,
  repeatMode: 'off', // 'off' | 'all' | 'one'

  // UI Panels State
  isLyricsOpen: false,
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
    }

    // 2. Initialize YouTube IFrame Audio API player (hidden)
    const initYT = () => {
      if (window.YT && window.YT.Player && !globalYTPlayer) {
        try {
          globalYTPlayer = new window.YT.Player('vanhsound-yt-player', {
            height: '1',
            width: '1',
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              playsinline: 1,
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
            },
          });
        } catch (err) {
          console.warn('YouTube Player init notice:', err);
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

  // Play a specific track (supports Audius 320kbps full track, YouTube full remix, and MP3)
  playTrack: (track, newQueue = null) => {
    if (!track) return;
    get().initAudio();

    let queue = get().queue;
    let queueIndex = get().queueIndex;

    if (newQueue && Array.isArray(newQueue) && newQueue.length > 0) {
      queue = [...newQueue];
      queueIndex = queue.findIndex(t => t.id === track.id);
      if (queueIndex === -1) {
        queue.unshift(track);
        queueIndex = 0;
      }
    } else if (queue.length === 0) {
      queue = [track];
      queueIndex = 0;
    } else {
      const idx = queue.findIndex(t => t.id === track.id);
      if (idx !== -1) {
        queueIndex = idx;
      } else {
        queue = [track, ...queue];
        queueIndex = 0;
      }
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
      // 1. Play Full Length via YouTube background engine
      if (globalAudio) globalAudio.pause();

      if (globalYTPlayer && typeof globalYTPlayer.loadVideoById === 'function') {
        globalYTPlayer.loadVideoById(ytVideoId);
        globalYTPlayer.playVideo();
      } else {
        // Retry when ready
        setTimeout(() => {
          if (globalYTPlayer && typeof globalYTPlayer.loadVideoById === 'function') {
            globalYTPlayer.loadVideoById(ytVideoId);
            globalYTPlayer.playVideo();
          }
        }, 500);
      }
    } else {
      // 2. Play Full Length 320kbps via HTML5 Audio (Audius / MP3)
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

    // Media Session API for native OS lock screen
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
    const { queue, queueIndex, isShuffled, playTrack } = get();
    if (queue.length === 0) return;

    let nextIdx = queueIndex + 1;
    if (isShuffled) {
      nextIdx = Math.floor(Math.random() * queue.length);
    }

    if (nextIdx >= queue.length) {
      nextIdx = 0; // loop back to first track
    }

    playTrack(queue[nextIdx], queue);
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
    playTrack(queue[prevIdx], queue);
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
