import React, { useMemo } from 'react';
import { Maximize2, Mic2 } from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';

export default function LyricsPreviewCard({ onOpenFullLyrics }) {
  const { currentTrack, currentTime, toggleLyrics } = useAudioStore();

  // Parse LRC lyrics
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
        if (text) result.push({ time, text });
      }
    }
    return result.sort((a, b) => a.time - b.time);
  }, [currentTrack]);

  const activeIndex = useMemo(() => {
    if (parsedLyrics.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (currentTime >= parsedLyrics[i].time) idx = i;
      else break;
    }
    return idx;
  }, [parsedLyrics, currentTime]);

  if (!currentTrack || parsedLyrics.length === 0) return null;

  // Grab 3-4 lines around the active line for preview
  const previewLines = parsedLyrics.slice(Math.max(0, activeIndex - 1), Math.max(0, activeIndex - 1) + 4);

  return (
    <div className="w-full rounded-3xl bg-gradient-to-b from-[#135d66] to-[#0f434a] p-5 md:p-6 shadow-2xl border border-white/10 text-white space-y-4 select-none relative overflow-hidden group">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white/90 tracking-tight">
          Bản xem trước lời bài hát
        </h4>
        <button
          onClick={onOpenFullLyrics || toggleLyrics}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Mở toàn màn hình lời bài hát"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Live Synced Preview Lyrics */}
      <div className="space-y-2.5 py-1">
        {previewLines.map((line, idx) => {
          const isCurrentLine = line.time === parsedLyrics[activeIndex]?.time;
          return (
            <p
              key={`${line.time}-${idx}`}
              className={`font-bold transition-all duration-300 leading-snug ${
                isCurrentLine
                  ? 'text-white text-xl sm:text-2xl drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] scale-[1.01] origin-left'
                  : 'text-white/60 text-base sm:text-lg'
              }`}
            >
              {line.text}
            </p>
          );
        })}
      </div>

      {/* Bottom Action Button matching Image 1 */}
      <div>
        <button
          onClick={onOpenFullLyrics || toggleLyrics}
          className="px-4 py-2 rounded-full bg-white hover:bg-[#EDEDEF] active:scale-95 text-[#050506] font-bold text-xs shadow-lg transition-all"
        >
          Hiện lời bài hát
        </button>
      </div>
    </div>
  );
}
