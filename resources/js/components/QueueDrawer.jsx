import React from 'react';
import { X, ListMusic, Trash2, Play } from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';

export default function QueueDrawer() {
  const { 
    currentTrack, 
    queue, 
    queueIndex, 
    isQueueOpen, 
    toggleQueue, 
    playTrack, 
    removeFromQueue, 
    clearQueue 
  } = useAudioStore();

  if (!isQueueOpen) return null;

  const nextUpTracks = queue.slice(queueIndex + 1);

  return (
    <div className="w-96 flex-shrink-0 h-full flex flex-col bg-[#070709]/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl relative z-30 select-none animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="p-5 pb-3 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#5E6AD2]/10 border border-[#5E6AD2]/30 flex items-center justify-center text-[#5E6AD2]">
            <ListMusic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Play Queue</h3>
            <p className="text-[11px] text-[#8A8F98]">{queue.length} tracks in queue</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {queue.length > 1 && (
            <button
              onClick={clearQueue}
              className="p-1.5 rounded-lg text-[#8A8F98] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Clear Queue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={toggleQueue}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#8A8F98] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Queue Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Now Playing Block */}
        {currentTrack && (
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A8F98] px-1 block mb-2">
              Now Playing
            </span>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.08] border border-white/[0.08] shadow-sm">
              <img
                src={currentTrack.cover_url || currentTrack.display_cover_url}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-xl object-cover border border-white/[0.06]"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{currentTrack.title}</p>
                <p className="text-xs text-[#5E6AD2] font-medium truncate">{currentTrack.artist?.name}</p>
              </div>
              <span className="text-xs text-[#8A8F98] font-mono">{currentTrack.duration_formatted}</span>
            </div>
          </div>
        )}

        {/* Next in Queue */}
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A8F98] px-1 block mb-2">
            Next Up
          </span>

          {nextUpTracks.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#8A8F98] border border-dashed border-white/[0.06] rounded-2xl">
              No upcoming tracks in queue. Add songs from any album or playlist!
            </div>
          ) : (
            <div className="space-y-1.5">
              {nextUpTracks.map((t, idx) => (
                <div
                  key={`${t.id}-${idx}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] group transition-colors cursor-pointer"
                  onClick={() => playTrack(t, queue)}
                >
                  <span className="text-xs text-[#8A8F98] font-mono w-4 text-center">
                    {idx + 1}
                  </span>
                  <img
                    src={t.cover_url || t.display_cover_url}
                    alt={t.title}
                    className="w-9 h-9 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#EDEDEF] group-hover:text-white truncate">
                      {t.title}
                    </p>
                    <p className="text-[11px] text-[#8A8F98] truncate">{t.artist?.name}</p>
                  </div>
                  <span className="text-xs text-[#8A8F98] font-mono">{t.duration_formatted}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(queueIndex + 1 + idx);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#8A8F98] hover:text-red-400"
                    title="Remove from queue"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
