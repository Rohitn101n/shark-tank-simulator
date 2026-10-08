import React, { useEffect, useState } from 'react';
import { SharkOffer, SharkProfile } from '../types/shark';
import { tankAudio } from '../utils/tankAudio';
import { SharkAvatar } from './SharkAvatar';
import { Sparkles, ArrowRight } from 'lucide-react';

interface HandshakeAnimationProps {
  acceptedOffer: SharkOffer;
  acceptedShark: SharkProfile;
  companyName: string;
  onAnimationComplete: () => void;
}

export const HandshakeAnimation: React.FC<HandshakeAnimationProps> = ({
  acceptedOffer,
  acceptedShark,
  companyName,
  onAnimationComplete,
}) => {
  const [phase, setPhase] = useState<'step_forward' | 'clasp' | 'celebrate'>('step_forward');

  useEffect(() => {
    // Step 1: Founder and Shark step forward
    tankAudio.playCashDing();

    // Step 2: Hands clasp together with golden chime
    const t1 = setTimeout(() => {
      setPhase('clasp');
      tankAudio.playDealGong();
    }, 1200);

    // Step 3: Flash and celebration
    const t2 = setTimeout(() => {
      setPhase('celebrate');
    }, 2400);

    // Step 4: Advance to term sheet
    const t3 = setTimeout(() => {
      onAnimationComplete();
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onAnimationComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#04060c] flex flex-col justify-between items-center select-none overflow-hidden">
      {/* Skip button in corner */}
      <div className="absolute top-5 right-6 z-40">
        <button
          onClick={onAnimationComplete}
          className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 backdrop-blur-md transition-colors"
        >
          <span>View Term Sheet</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top Title */}
      <div className="pt-8 text-center z-30">
        <div className="text-[11px] font-mono tracking-[0.25em] text-zinc-400 uppercase font-semibold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          BROADCAST EXCLUSIVE • HANDSHAKE CONFIRMED
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-[0.2em] text-zinc-100 mt-1 font-['Cinzel']">
          A DEAL IS STRUCK
        </h2>
      </div>

      {/* Center Stage: The Handshake Animation */}
      <div className="relative w-full max-w-4xl h-[55vh] flex items-center justify-center overflow-hidden">
        {/* Overhead Spotlight Cones */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-zinc-800/20 via-zinc-900/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(161,161,170,0.05)_0%,transparent_70%)]" />

        {/* Circular Carpet Marker on Floor */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-80 h-24 rounded-full border border-zinc-700/50 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
          <div className="w-60 h-16 rounded-full border border-zinc-700/30" />
        </div>

        {/* Figures Stepping Forward and Meeting */}
        <div className="relative w-full max-w-md h-64 flex items-center justify-between px-8 z-20">
          {/* Left: Founder Character */}
          <div
            className={`flex flex-col items-center transition-all duration-1000 ease-out ${
              phase === 'step_forward'
                ? '-translate-x-12 opacity-80'
                : 'translate-x-4 opacity-100'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-zinc-500 flex items-center justify-center text-xs font-mono font-bold text-zinc-200 shadow-md">
              YOU
            </div>
            <div className="w-14 h-24 bg-gradient-to-b from-slate-800 to-slate-900 rounded-t-lg mt-1 border-x border-slate-700 relative">
              {/* Founder Arm reaching out to the right */}
              <div
                className={`absolute top-6 right-0 h-3 bg-slate-700 rounded-full origin-left transition-all duration-700 ${
                  phase !== 'step_forward' ? 'w-16 rotate-12' : 'w-8 rotate-45'
                }`}
              />
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-2 font-medium">
              Founder
            </div>
          </div>

          {/* Center: Clasping Hands with Subtle Radiance */}
          <div
            className={`transition-all duration-700 z-30 flex flex-col items-center ${
              phase === 'step_forward'
                ? 'scale-50 opacity-0'
                : 'scale-110 opacity-100'
            }`}
          >
            {/* Clasping Handshake SVG */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Pulsing Light Burst */}
              <div className="absolute inset-0 rounded-full bg-zinc-700/20 blur-xl animate-pulse" />

              <svg viewBox="0 0 100 100" className="w-24 h-24 relative z-10 drop-shadow-sm">
                {/* Left hand (Founder sleeve & hand) */}
                <path d="M 15 50 L 38 48 C 42 48, 46 52, 48 55 L 54 58" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" fill="none" />
                <path d="M 12 50 L 32 48" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" fill="none" />

                {/* Right hand (Shark sleeve & hand) */}
                <path d="M 85 50 L 62 48 C 58 48, 54 52, 52 55 L 46 58" stroke="#d4d4d8" strokeWidth="8" strokeLinecap="round" fill="none" />
                <path d="M 88 50 L 68 48" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" fill="none" />

                {/* Interlocking Fingers Clasp */}
                <ellipse cx="50" cy="54" rx="9" ry="7" fill="#a1a1aa" stroke="#71717a" strokeWidth="1.5" />
                <line x1="47" y1="50" x2="47" y2="58" stroke="#52525b" strokeWidth="1.5" />
                <line x1="51" y1="50" x2="51" y2="58" stroke="#52525b" strokeWidth="1.5" />
                <line x1="55" y1="51" x2="55" y2="57" stroke="#52525b" strokeWidth="1.5" />

                {/* Sparkles */}
                <circle cx="50" cy="42" r="2" fill="#ffffff" />
                <circle cx="42" cy="62" r="1.5" fill="#e4e4e7" />
                <circle cx="58" cy="62" r="1.5" fill="#e4e4e7" />
              </svg>
            </div>
            <div className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase font-semibold bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
              🤝 HANDSHAKE
            </div>
          </div>

          {/* Right: Accepted Shark Character */}
          <div
            className={`flex flex-col items-center transition-all duration-1000 ease-out ${
              phase === 'step_forward'
                ? 'translate-x-12 opacity-80'
                : '-translate-x-4 opacity-100'
            }`}
          >
            <SharkAvatar sharkId={acceptedShark.id} size="sm" />
            <div className="w-14 h-24 bg-gradient-to-b from-slate-900 to-black rounded-t-lg mt-1 border-x border-slate-800 relative">
              {/* Shark Arm reaching out to the left */}
              <div
                className={`absolute top-6 left-0 h-3 bg-slate-800 rounded-full origin-right transition-all duration-700 ${
                  phase !== 'step_forward' ? 'w-16 -rotate-12' : 'w-8 -rotate-45'
                }`}
              />
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-2 font-medium font-['Cinzel']">
              {acceptedShark.name}
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Deal Graphic Banner */}
      <div className="pb-8 px-6 max-w-xl mx-auto w-full z-30">
        <div className="bg-[#0b101d]/95 border border-zinc-700 rounded-2xl p-5 shadow-xl backdrop-blur-md text-center">
          <div className="text-xs font-mono font-medium tracking-widest text-zinc-400 uppercase mb-1">
            PARTNERSHIP CONFIRMED
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-100 font-['Cinzel'] tracking-wider">
            {companyName} & {acceptedShark.name.toUpperCase()}
          </h1>

          <div className="mt-2 text-base md:text-lg font-mono font-bold text-zinc-100">
            ${acceptedOffer.amount.toLocaleString()} FOR {acceptedOffer.equity}% EQUITY
          </div>

          {acceptedOffer.royalty && (
            <div className="mt-1 text-xs text-zinc-300 font-mono">
              Royalty: {acceptedOffer.royalty.description}
            </div>
          )}

          <p className="text-xs text-zinc-400 mt-2 italic">
            "{acceptedOffer.explanation}"
          </p>
        </div>
      </div>
    </div>
  );
};
