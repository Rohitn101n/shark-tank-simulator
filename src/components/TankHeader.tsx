import React from 'react';
import { Volume2, VolumeX, Mic, MicOff, RotateCcw, Clock, Swords, FastForward } from 'lucide-react';
import { PitchData, SharkBrawl } from '../types/shark';

interface TankHeaderProps {
  pitch: PitchData | null;
  tankTimeSeconds: number | null;
  isAudioMuted: boolean;
  isVoiceEnabled: boolean;
  activeBrawl?: SharkBrawl | null;
  onToggleAudio: () => void;
  onToggleVoice: () => void;
  onNewPitch: () => void;
  onConcludePitch: () => void;
  onTriggerFinalDeals: () => void;
  onSkipBrawl?: () => void;
}

export const TankHeader: React.FC<TankHeaderProps> = ({
  pitch,
  tankTimeSeconds,
  isAudioMuted,
  isVoiceEnabled,
  activeBrawl,
  onToggleAudio,
  onToggleVoice,
  onNewPitch,
  onTriggerFinalDeals,
  onSkipBrawl,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="w-full border-b border-zinc-800 bg-[#0a0d14]/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNewPitch}
            className="group flex items-center gap-2.5 focus:outline-none cursor-pointer"
            title="Shark Tank Interactive Studio"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:border-zinc-600 transition-colors">
              <svg viewBox="0 0 32 32" className="w-4 h-4 text-zinc-300" fill="currentColor">
                <path d="M7 25 C11 25, 14 24, 16 20 C18 16, 20 8, 26 5 C22 13, 22 18, 25 25 Z" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm md:text-base font-bold tracking-[0.2em] text-zinc-100 group-hover:text-zinc-300 transition-colors font-['Cinzel'] leading-tight">
                SHARK TANK
              </span>
              <span className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase hidden sm:block">
                LIVE TANK NEGOTIATOR
              </span>
            </div>
          </button>
        </div>

        {/* Center: Company Name & Pitch Key Metrics & Timer */}
        {pitch ? (
          <div className="flex items-center gap-2 md:gap-3 text-xs font-mono">
            {/* Pitch Tag */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
              <span className="font-semibold text-zinc-200">{pitch.businessName}</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">${(pitch.askAmount / 1000).toFixed(0)}k for {pitch.askEquity}%</span>
            </div>

            {/* Active Brawl Quick Badge with Skip Button in Navbar */}
            {activeBrawl && (
              <div className="flex items-center gap-1.5 bg-zinc-850 border border-zinc-700 px-2.5 py-0.5 rounded text-zinc-300 font-mono text-[11px]">
                <Swords className="w-3 h-3 text-zinc-400" />
                <span className="font-medium hidden sm:inline">BRAWL IN PROGRESS</span>
                {onSkipBrawl && (
                  <button
                    onClick={onSkipBrawl}
                    className="ml-1 px-1.5 py-0.5 rounded bg-zinc-750 hover:bg-zinc-700 text-zinc-200 font-mono text-[10px] font-semibold transition-all flex items-center gap-0.5 cursor-pointer"
                    title="Skip Brawl & Silence Audio"
                  >
                    <FastForward className="w-2.5 h-2.5" />
                    <span>Skip</span>
                  </button>
                )}
              </div>
            )}

            {/* 5-Minute Session Clock */}
            {tankTimeSeconds !== null && (
              <button
                onClick={onTriggerFinalDeals}
                className="flex items-center gap-1.5 text-zinc-300 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded cursor-pointer transition-all shadow-sm"
                title="5-minute pitch deliberation limit. Click to trigger final deals now."
              >
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span className="tabular-nums font-semibold text-xs tracking-wider">
                  {formatTime(tankTimeSeconds)}
                </span>
                <span className="text-[10px] text-zinc-400 hidden sm:inline font-sans font-medium uppercase tracking-wider">Limit</span>
              </button>
            )}
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>Enter the Tank to pitch the investors</span>
          </div>
        )}

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2 md:gap-3 text-xs">
          {/* Voice Output */}
          <button
            onClick={onToggleVoice}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all font-mono text-[11px] cursor-pointer ${
              isVoiceEnabled
                ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle Voice Read-Aloud"
          >
            {isVoiceEnabled ? <Mic className="w-3 h-3 text-zinc-300" /> : <MicOff className="w-3 h-3 text-zinc-500" />}
            <span className="hidden sm:inline">
              {isVoiceEnabled ? 'Voice On' : 'Voice Off'}
            </span>
          </button>

          {/* Audio FX */}
          <button
            onClick={onToggleAudio}
            className={`p-1.5 rounded border transition-all cursor-pointer ${
              !isAudioMuted
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                : 'bg-zinc-950 border-zinc-900 text-zinc-600 hover:text-zinc-400'
            }`}
            title={isAudioMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Final Deals Quick Trigger */}
          {pitch && (
            <button
              onClick={onTriggerFinalDeals}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded font-mono text-[11px] font-medium transition-all cursor-pointer"
              title="Demand final offers immediately"
            >
              Final Deals
            </button>
          )}

          {/* Reset Pitch Button */}
          <button
            onClick={onNewPitch}
            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded transition-colors flex items-center gap-1 font-mono text-[11px] cursor-pointer"
            title="Start New Pitch Session"
          >
            <RotateCcw className="w-3 h-3 text-zinc-400" />
            <span className="hidden sm:inline">New Pitch</span>
          </button>
        </div>
      </div>
    </header>
  );
};
