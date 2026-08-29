import React, { useMemo, useRef, useEffect } from 'react';
import { X, Mic2, Sparkles } from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';

export default function LyricsDrawer() {
  const { currentTrack, currentTime, isLyricsOpen, toggleLyrics, seek } = useAudioStore();
  const activeLineRef = useRef(null);

  // Parse LRC formatted lyrics string into array of { time: seconds, text: string }
  const parsedLyrics = useMemo(() => {
    if (!currentTrack?.lyrics_lrc) return [];

    const lines = currentTrack.lyrics_lrc.split('\n');
    const result = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    for (const line of lines) {
      const match = line.match(timeRegex);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const milliseconds = parseInt(match[3].padEnd(3, '0').slice(0, 3), 10);
        const time = minutes * 60 + seconds + milliseconds / 1000;
        const text = line.replace(timeRegex, '').trim();
        if (text) {
          result.push({ time, text });
        }
      } else if (line.trim()) {
        result.push({ time: 0, text: line.trim() });
      }
    }

    return result.sort((a, b) => a.time - b.time);
  }, [currentTrack]);

  // Find active line index based on currentTime
  const activeIndex = useMemo(() => {
    if (parsedLyrics.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (currentTime >= parsedLyrics[i].time) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [parsedLyrics, currentTime]);

  // Auto scroll to active line
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  if (!isLyricsOpen) return null;

  return (
    <div className="w-96 flex-shrink-0 h-full flex flex-col bg-[#070709]/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl relative z-30 select-none animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="p-5 pb-3 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#5E6AD2]/10 border border-[#5E6AD2]/30 flex items-center justify-center text-[#5E6AD2]">
            <Mic2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Synchronized Lyrics</h3>
            <p className="text-[11px] text-[#8A8F98] truncate max-w-[200px]">
              {currentTrack?.title} • {currentTrack?.artist?.name}
            </p>
          </div>
        </div>

        <button
          onClick={toggleLyrics}
          className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#8A8F98] hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Lyrics Content Viewport */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {parsedLyrics.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8A8F98]">
            <Sparkles className="w-8 h-8 text-[#5E6AD2] mb-3 opacity-60" />
            <p className="text-sm font-medium text-white mb-1">No lyrics available for this track</p>
            <p className="text-xs text-[#8A8F98]">Enjoy the music & melody!</p>
          </div>
        ) : (
          parsedLyrics.map((line, index) => {
            const isActive = index === activeIndex;
            const isPast = index < activeIndex;

            return (
              <div
                key={index}
                ref={isActive ? activeLineRef : null}
                onClick={() => seek(line.time)}
                className={`cursor-pointer transition-all duration-300 transform ${
                  isActive
                    ? 'text-white font-bold text-xl scale-105 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] text-[#EDEDEF]'
                    : isPast
                    ? 'text-[#8A8F98]/50 text-base hover:text-[#EDEDEF]'
                    : 'text-[#8A8F98] text-base hover:text-[#EDEDEF]'
                }`}
              >
                <p className="leading-relaxed">{line.text}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/[0.06] bg-black/20 text-center">
        <span className="text-[11px] text-[#8A8F98]">
          Click any line to jump audio • Synced via LRC
        </span>
      </div>
    </div>
  );
}
