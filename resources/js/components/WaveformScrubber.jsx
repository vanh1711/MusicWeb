import React, { useRef, useState, useEffect } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';
import axios from 'axios';

export default function WaveformScrubber({ track, height = 48, showComments = true }) {
  const { currentTime, duration, seek } = useAudioStore();
  const [comments, setComments] = useState([]);
  const [hoverTime, setHoverTime] = useState(null);
  const [activeComment, setActiveComment] = useState(null);
  const containerRef = useRef(null);

  // Fallback 75-point waveform if not provided
  const waveform = track?.waveform_data || Array.from({ length: 75 }, (_, i) => 
    0.2 + 0.6 * Math.abs(Math.sin(i / 5))
  );

  // Fetch timed comments for this track
  useEffect(() => {
    if (track?.id && showComments) {
      axios.get(`/api/tracks/${track.id}/comments`)
        .then((res) => setComments(res.data || []))
        .catch(() => {});
    }
  }, [track?.id, showComments]);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !duration) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(pos * duration);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  const handleClick = (e) => {
    if (!containerRef.current || !duration) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(pos * duration);
  };

  const progressRatio = duration > 0 ? currentTime / duration : 0;

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative w-full select-none">
      {/* Waveform Canvas Container */}
      <div
        ref={containerRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex items-center justify-between gap-[2px] cursor-pointer group py-3"
        style={{ height: `${height}px` }}
      >
        {/* Hover Time Tooltip */}
        {hoverTime !== null && (
          <div
            className="absolute -top-6 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#0a0a0c] border border-white/20 text-[10px] font-mono text-white pointer-events-none shadow-xl z-30"
            style={{ left: `${(hoverTime / (duration || 1)) * 100}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}

        {/* Individual Waveform Peak Bars */}
        {waveform.map((peak, idx) => {
          const barRatio = idx / waveform.length;
          const isPlayed = barRatio <= progressRatio;
          const barHeight = Math.max(15, peak * 100);

          return (
            <div
              key={idx}
              className="flex-1 rounded-full transition-all duration-75"
              style={{
                height: `${barHeight}%`,
                backgroundColor: isPlayed ? '#5E6AD2' : 'rgba(255, 255, 255, 0.18)',
                boxShadow: isPlayed ? '0 0 8px rgba(94, 106, 210, 0.4)' : 'none',
              }}
            />
          );
        })}

        {/* Floating Timed Comments Avatar Pins */}
        {showComments && duration > 0 && comments.map((c) => {
          const commentRatio = Math.min(1, c.timestamp_seconds / duration);
          const isHovered = activeComment?.id === c.id;

          return (
            <div
              key={c.id}
              onClick={(e) => {
                e.stopPropagation();
                seek(c.timestamp_seconds);
              }}
              onMouseEnter={() => setActiveComment(c)}
              onMouseLeave={() => setActiveComment(null)}
              className="absolute bottom-0 -translate-x-1/2 cursor-pointer group/pin z-20"
              style={{ left: `${commentRatio * 100}%` }}
            >
              <img
                src={c.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={c.user?.name}
                className={`w-5 h-5 rounded-full object-cover border-2 transition-transform duration-200 ${
                  isHovered ? 'scale-125 border-[#EC4899] z-30' : 'border-white/[0.2] group-hover/pin:scale-110'
                }`}
              />

              {/* Comment Popover Bubble on Hover */}
              {isHovered && (
                <div className="absolute bottom-7 left-1/2 -translate-x-1/2 w-48 glass-dropdown rounded-xl p-2 text-left z-40 shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8A8F98] mb-0.5">
                    <span className="font-bold text-white truncate max-w-[100px]">{c.user?.name}</span>
                    <span className="text-[#5E6AD2]">{c.timestamp_formatted}</span>
                  </div>
                  <p className="text-xs text-[#EDEDEF] line-clamp-2 leading-tight">
                    {c.content}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
