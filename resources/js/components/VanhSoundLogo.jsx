import React from 'react';
import { useAudioStore } from '../store/useAudioStore';

export default function VanhSoundLogo({ size = 'default', showTagline = true }) {
  const { isPlaying } = useAudioStore();

  const iconSizes = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-13 h-13',
  };

  return (
    <div className="flex items-center gap-3 group select-none cursor-pointer">
      {/* Monogram Geometric V + Equalizer Spectrum Icon */}
      <div className={`relative ${iconSizes[size] || iconSizes.default} rounded-2xl bg-gradient-to-tr from-[#5E6AD2] via-[#8B5CF6] to-[#EC4899] p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(94,106,210,0.45)] group-hover:scale-105 transition-transform duration-300`}>
        <div className="w-full h-full bg-[#07070a]/90 rounded-[14px] flex items-center justify-center p-1.5 overflow-hidden relative">
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#5E6AD2]/20 to-[#EC4899]/20" />

          {/* SVG Monogram "V" with Soundwave Bars */}
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full relative z-10"
          >
            <defs>
              <linearGradient id="vanhGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5E6AD2" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>

            {/* Left Diagonal of V */}
            <path
              d="M 6 8 L 18 34 C 18.8 35.8 21.2 35.8 22 34"
              stroke="url(#vanhGradient)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Right Side 4 Dynamic Soundwave Equalizer Bars */}
            <line
              x1="22" y1={isPlaying ? "18" : "22"}
              x2="22" y2="34"
              stroke="url(#vanhGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              className={isPlaying ? "visualizer-bar-1" : ""}
            />
            <line
              x1="27" y1={isPlaying ? "10" : "16"}
              x2="27" y2="34"
              stroke="url(#vanhGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              className={isPlaying ? "visualizer-bar-2" : ""}
            />
            <line
              x1="32" y1={isPlaying ? "6" : "11"}
              x2="32" y2="34"
              stroke="url(#vanhGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              className={isPlaying ? "visualizer-bar-3" : ""}
            />
            <line
              x1="37" y1={isPlaying ? "14" : "8"}
              x2="37" y2="34"
              stroke="url(#vanhGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              className={isPlaying ? "visualizer-bar-4" : ""}
            />
          </svg>
        </div>
      </div>

      {/* Brand Text */}
      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold tracking-tight text-white text-lg bg-gradient-to-r from-white via-white/95 to-white/80 bg-clip-text">
            Vanh<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5E6AD2] to-[#EC4899]">Sound</span>
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#EC4899] shadow-[0_0_8px_#EC4899]"></span>
        </div>
        {showTagline && (
          <p className="text-[10px] font-mono tracking-widest text-[#8A8F98] uppercase">
            Open Audio Universe
          </p>
        )}
      </div>
    </div>
  );
}
