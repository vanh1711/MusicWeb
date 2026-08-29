import React from 'react';
import { X, ListMusic, Trash2, Play, Sparkles, Radio, Loader2 } from 'lucide-react';
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
    clearQueue,
    isLoadingRecommendations
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
            <h3 className="text-sm font-bold text-white tracking-tight">Danh Sách Phát & Gợi Ý</h3>
            <p className="text-[11px] text-[#8A8F98]">
              {queue.length} bài hát • Autoplay Radio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {queue.length > 1 && (
            <button
              onClick={clearQueue}
              className="p-1.5 rounded-lg text-[#8A8F98] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Xóa hàng đợi"
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
        {/* 1. Now Playing Block */}
        {currentTrack && (
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A8F98]">
                Đang Phát
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-[#5E6AD2]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5E6AD2] animate-ping"></span>
                Live
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.08] border border-white/[0.08] shadow-sm">
              <img
                src={currentTrack.cover_url || currentTrack.display_cover_url}
                alt={currentTrack.title}
                className="w-13 h-13 rounded-xl object-cover border border-white/[0.06] flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{currentTrack.title}</p>
                <p className="text-xs text-[#5E6AD2] font-medium truncate">{currentTrack.artist?.name}</p>
                <span className="text-[10px] font-mono text-[#8A8F98] mt-0.5 block">{currentTrack.duration_formatted}</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Next Up & Recommended Songs */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A8F98]">
              Bài Hát Kế Tiếp ({nextUpTracks.length})
            </span>
            {isLoadingRecommendations && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-[#8B5CF6]">
                <Loader2 className="w-3 h-3 animate-spin" />
                Đang gợi ý...
              </span>
            )}
          </div>

          {nextUpTracks.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#8A8F98] border border-dashed border-white/[0.06] rounded-2xl space-y-2">
              <Radio className="w-6 h-6 text-[#5E6AD2] mx-auto opacity-50" />
              <p>Đang tải bài hát gợi ý tự động...</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {nextUpTracks.map((t, idx) => (
                <div
                  key={`${t.id}-${idx}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.06] group transition-colors cursor-pointer"
                  onClick={() => {
                    const targetIndex = queueIndex + 1 + idx;
                    useAudioStore.setState({ queueIndex: targetIndex });
                    playTrack(t, queue);
                  }}
                >
                  <span className="text-xs text-[#8A8F98] font-mono w-4 text-center">
                    {idx + 1}
                  </span>
                  <img
                    src={t.cover_url || t.display_cover_url}
                    alt={t.title}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
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
                    title="Xóa khỏi danh sách"
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
