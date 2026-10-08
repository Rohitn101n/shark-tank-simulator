import React, { useEffect, useState } from 'react';
import { PitchData, SharkProfile } from '../types/shark';
import { tankAudio } from '../utils/tankAudio';
import { ArrowRight, Volume2 } from 'lucide-react';

interface PitcherEntranceAnimationProps {
  pitch: PitchData;
  sharks: SharkProfile[];
  onEntranceComplete: () => void;
}

export const PitcherEntranceAnimation: React.FC<PitcherEntranceAnimationProps> = ({
  pitch,
  sharks,
  onEntranceComplete,
}) => {
  const [phase, setPhase] = useState<'doors' | 'walking' | 'spotlight' | 'ready'>('doors');
  const [distanceProgress, setDistanceProgress] = useState<number>(0);

  const impliedValuation = Math.round(pitch.askAmount / (pitch.askEquity / 100));

  useEffect(() => {
    // Phase 1: Doors slide open
    tankAudio.playDoorSlide();

    const t1 = setTimeout(() => {
      setPhase('walking');
      tankAudio.playFootsteps(4);
    }, 1100);

    // Progress animation for walking down the carpet
    const interval = setInterval(() => {
      setDistanceProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 2.5;
      });
    }, 50);

    const t2 = setTimeout(() => {
      setPhase('spotlight');
      tankAudio.playStinger();
    }, 2800);

    const t3 = setTimeout(() => {
      setPhase('ready');
      onEntranceComplete();
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, [onEntranceComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#05070d] overflow-hidden flex flex-col justify-between select-none">
      {/* Skip Button */}
      <div className="absolute top-5 right-6 z-40">
        <button
          onClick={onEntranceComplete}
          className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 backdrop-blur-md transition-colors"
        >
          <span>Skip Entrance</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Broadcast Subtitle Header */}
      <div className="pt-8 text-center z-30">
        <div className="text-[11px] font-mono tracking-[0.25em] text-zinc-400 uppercase font-semibold">
          BROADCAST STAGE • LIVE RECORDING
        </div>
        <h2 className="text-xl md:text-2xl font-light tracking-[0.2em] text-zinc-200 mt-1 font-['Cinzel']">
          ENTERING THE TANK
        </h2>
      </div>

      {/* 3D Perspective Studio Hallway & Shark Stage */}
      <div className="relative w-full h-[65vh] flex items-center justify-center overflow-hidden">
        {/* Deep Perspective Studio Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#03050a] via-[#070b14] to-[#04060b]">
          {/* Overhead Ambient Studio Lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-zinc-800/10 via-zinc-900/10 to-transparent blur-3xl" />

          {/* Perspective Studio Grid Ceiling and Walls */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

          {/* Wooden Flooring on Left and Right */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-zinc-950 to-transparent opacity-60" />

          {/* Central Runner stretching into the distance */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 md:w-64 h-full bg-gradient-to-t from-zinc-900/90 via-zinc-900/40 to-transparent border-x border-zinc-700/30 origin-bottom transition-all duration-1000"
            style={{
              clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
            }}
          >
            {/* Subtle Border Line */}
            <div className="w-full h-full opacity-20 bg-[repeating-linear-gradient(45deg,#71717a,#71717a_2px,transparent_2px,transparent_8px)]" />
          </div>

          {/* The 5 Shark Chairs in the distance */}
          <div
            className={`absolute top-1/4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 md:gap-8 transition-all duration-1000 ${
              phase === 'spotlight' ? 'scale-110 opacity-100' : 'opacity-70 scale-95'
            }`}
          >
            {sharks.map((shark) => (
              <div key={shark.id} className="flex flex-col items-center">
                {/* Leather Chair Silhouette */}
                <div className="w-10 h-14 md:w-14 md:h-20 bg-gradient-to-b from-slate-900 to-black rounded-t-xl border border-slate-800/80 shadow-2xl relative flex items-center justify-center">
                  {/* Subtle Shark Silhouette */}
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-800/80 border border-slate-700/60 shadow-inner" />
                </div>
                {/* Nameplate */}
                <div className="mt-1 text-[9px] font-mono tracking-wider text-zinc-400 uppercase">
                  {shark.name.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>

          {/* Stage Center Floor Marker (Where the founder stands) */}
          <div
            className={`absolute bottom-16 left-1/2 -translate-x-1/2 w-28 h-10 rounded-full border border-zinc-500/50 flex items-center justify-center transition-all duration-700 ${
              phase === 'spotlight' ? 'scale-110 ring-2 ring-zinc-500/30 shadow-none' : 'opacity-40'
            }`}
          >
            <div className="w-20 h-6 rounded-full bg-zinc-800/40 border border-zinc-600/40" />
          </div>

          {/* Walking Silhouette of the Entrepreneur */}
          <div
            className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
            style={{
              transform: `translateX(-50%) translateY(${-distanceProgress * 0.4}px) scale(${
                0.85 + (distanceProgress / 100) * 0.35
              })`,
              opacity: phase === 'doors' ? 0.3 : 1,
            }}
          >
            {/* Founder Figure Silhouette */}
            <div className="w-12 h-28 relative flex flex-col items-center">
              {/* Head */}
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 shadow-md" />
              {/* Torso / Blazer */}
              <div className="w-10 h-12 bg-slate-900 border-x border-slate-700/80 rounded-t-md mt-0.5" />
              {/* Legs */}
              <div className="flex gap-2 w-8 h-10">
                <div className="w-3 h-full bg-slate-950 rounded-b-sm" />
                <div className="w-3 h-full bg-slate-950 rounded-b-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Sliding Studio Double Doors */}
        {/* Left Door */}
        <div
          className={`absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-black via-zinc-950 to-zinc-900 border-r-2 border-zinc-700/50 shadow-2xl transition-transform duration-1000 ease-in-out z-20 ${
            phase !== 'doors' ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          <div className="w-full h-full flex items-center justify-end pr-6">
            <div className="w-2 h-40 bg-zinc-700/30 rounded-full" />
          </div>
        </div>

        {/* Right Door */}
        <div
          className={`absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-black via-zinc-950 to-zinc-900 border-l-2 border-zinc-700/50 shadow-2xl transition-transform duration-1000 ease-in-out z-20 ${
            phase !== 'doors' ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          <div className="w-full h-full flex items-center justify-start pl-6">
            <div className="w-2 h-40 bg-zinc-700/30 rounded-full" />
          </div>
        </div>
      </div>

      {/* Broadcast Lower-Third Graphic Banner */}
      <div className="pb-8 px-6 max-w-2xl mx-auto w-full z-30">
        <div className="bg-[#0b101d]/90 border border-zinc-800 rounded-xl p-4 shadow-xl backdrop-blur-md transition-all duration-700">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
            <span className="text-xs font-mono tracking-widest text-zinc-400 font-medium uppercase">
              ENTREPRENEUR PRESENTATION
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              VALUATION: ${impliedValuation.toLocaleString()}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <h1 className="text-lg md:text-xl font-bold text-zinc-100 font-['Cinzel'] tracking-wide">
              {pitch.businessName}
            </h1>
            <div className="text-sm font-mono font-bold text-zinc-200">
              ${pitch.askAmount.toLocaleString()} FOR {pitch.askEquity}%
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-1 italic truncate">
            "{pitch.tagline}"
          </p>
        </div>
      </div>
    </div>
  );
};
