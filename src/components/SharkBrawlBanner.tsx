import React, { useState } from 'react';
import { SharkBrawl, SharkProfile } from '../types/shark';
import { SharkAvatar } from './SharkAvatar';
import { Swords, Volume2, X, AlertTriangle, FastForward, Maximize2, Minimize2 } from 'lucide-react';
import { sharkVoice } from '../utils/speechSynthesis';

interface SharkBrawlBannerProps {
  brawl: SharkBrawl;
  sharks: SharkProfile[];
  onSharkSpeak: (sharkId: string, text: string) => void;
  onDismiss?: () => void;
  onSkip?: () => void;
}

export const SharkBrawlBanner: React.FC<SharkBrawlBannerProps> = ({
  brawl,
  sharks,
  onSharkSpeak,
  onDismiss,
  onSkip,
}) => {
  const [isSpotlightExpanded, setIsSpotlightExpanded] = useState<boolean>(false);

  const shark1 = sharks.find((s) => s.id === brawl.shark1);
  const shark2 = sharks.find((s) => s.id === brawl.shark2);

  // Robust multi-format dialogue parser
  let quote1 = '';
  let quote2 = '';

  if (brawl.dialogue.includes('|')) {
    const parts = brawl.dialogue.split('|').map((p) => p.trim());
    quote1 = parts[0]?.replace(/^[^:]*:\s*/, '').replace(/^"|"$/g, '').trim() || '';
    quote2 = parts[1]?.replace(/^[^:]*:\s*/, '').replace(/^"|"$/g, '').trim() || '';
  } else {
    const s2Name = shark2?.name.split(' ')[0] || brawl.shark2;
    const secondSpeakerPattern = new RegExp(`(?:^|(?<=[.!?"]\\s*))(?:${s2Name}|${brawl.shark2})\\s*:\\s*`, 'i');

    if (secondSpeakerPattern.test(brawl.dialogue)) {
      const parts = brawl.dialogue.split(secondSpeakerPattern);
      quote1 = parts[0]?.replace(/^[^:]*:\s*/, '').replace(/^"|"$/g, '').trim() || '';
      quote2 = parts[1]?.replace(/^[^:]*:\s*/, '').replace(/^"|"$/g, '').trim() || '';
    } else {
      quote1 = brawl.dialogue.replace(/^[^:]*:\s*/, '').replace(/^"|"$/g, '').trim();
    }
  }

  if (!quote2) {
    quote2 = `Holding firm against ${shark1?.name || 'the other shark'}. This deal structure doesn't hold water!`;
  }

  const tensionLevel = brawl.tensionLevel || 'HIGH';
  const tensionScore = tensionLevel === 'CUTTHROAT' ? 98 : tensionLevel === 'EXPLOSIVE' ? 94 : 88;

  const handleHearFullClash = () => {
    if (quote1 && shark1) {
      onSharkSpeak(shark1.id, quote1);
      if (quote2 && shark2) {
        setTimeout(() => {
          onSharkSpeak(shark2.id, quote2);
        }, 3400);
      }
    } else if (shark1) {
      onSharkSpeak(shark1.id, brawl.dialogue);
    }
  };

  const handleSkipClash = () => {
    sharkVoice.stop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (onSkip) {
      onSkip();
    } else if (onDismiss) {
      onDismiss();
    }
  };

  const content = (
    <div className="relative rounded-xl border border-zinc-700 bg-zinc-900/95 shadow-xl transition-all duration-300">
      {/* Top Alarm Bar - Muted Slate/Charcoal */}
      <div className="rounded-t-[11px] bg-zinc-800 border-b border-zinc-700 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between text-zinc-200 font-mono text-xs sm:text-sm font-semibold tracking-wider">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 text-zinc-400 shrink-0">
            <Swords className="w-4 h-4 text-zinc-400" />
          </div>
          <span className="truncate font-semibold text-zinc-100">
            SHARK CLASH · INVESTOR SHOWDOWN
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="hidden lg:inline bg-zinc-900 text-zinc-300 px-2.5 py-0.5 rounded text-[11px] font-mono border border-zinc-700">
            {brawl.topic || 'Showdown'}
          </span>

          {/* Spotlight Expand / Minimize Button */}
          <button
            type="button"
            onClick={() => setIsSpotlightExpanded(!isSpotlightExpanded)}
            className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
            title={isSpotlightExpanded ? 'Exit Spotlight Mode' : 'Spotlight Full-Screen'}
          >
            {isSpotlightExpanded ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Skip Button in Header - Muted Styling */}
          <button
            type="button"
            onClick={handleSkipClash}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-mono text-xs font-semibold border border-zinc-500 shadow-sm transition-transform active:scale-95 cursor-pointer"
            title="Skip Brawl & Silence Audio"
          >
            <FastForward className="w-3.5 h-3.5 text-zinc-300" />
            <span>SKIP CLASH</span>
          </button>

          {(onDismiss || onSkip) && (
            <button
              type="button"
              onClick={handleSkipClash}
              className="p-1.5 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-zinc-200 cursor-pointer"
              title="Close Brawl"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Clash Stage: Muted Colors */}
      <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
        {/* Tension Gauge Meter & Action Controls */}
        <div className="bg-zinc-950/60 border border-zinc-800 rounded-lg p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-mono">
          <div className="flex items-center gap-2 text-zinc-300 shrink-0">
            <AlertTriangle className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="font-semibold tracking-wider text-xs sm:text-sm text-zinc-300 uppercase">
              Tension: {tensionScore}% [{tensionLevel}]
            </span>
          </div>

          <div className="w-full sm:flex-1 max-w-sm bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800 p-0.5">
            <div
              className="h-full bg-zinc-400 rounded-full"
              style={{ width: `${tensionScore}%` }}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleHearFullClash}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-xs text-zinc-200 flex items-center gap-1.5 font-mono font-medium transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Hear Clash</span>
            </button>

            <button
              type="button"
              onClick={handleSkipClash}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-xs text-zinc-200 flex items-center gap-1.5 font-mono font-medium transition-all cursor-pointer active:scale-95"
            >
              <FastForward className="w-3.5 h-3.5 text-zinc-400" />
              <span>Skip ⏩</span>
            </button>
          </div>
        </div>

        {/* Dual Face-Off Fighters: Muted Cards & Frames */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 relative">
          {/* Shark 1 Fighter Card */}
          <div className="bg-zinc-950/80 border border-zinc-700 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 relative transition-all">
            {/* Fighter Identity Bar */}
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
              <div className="flex items-center gap-3 min-w-0">
                <SharkAvatar
                  sharkId={shark1?.id || brawl.shark1}
                  size="md"
                  status="FIGHTING"
                  isSpeaking={true}
                  circular={true}
                />
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-bold text-zinc-100 font-['Cinzel'] tracking-wide truncate">
                    {shark1?.name || brawl.shark1}
                  </h4>
                  <span className="text-[11px] font-mono text-zinc-400 font-medium uppercase tracking-wider block truncate">
                    {shark1?.nickname || 'Shark Investor'}
                  </span>
                </div>
              </div>

              {quote1 && shark1 && (
                <button
                  type="button"
                  onClick={() => onSharkSpeak(shark1.id, quote1)}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                  title={`Hear ${shark1.name}'s line`}
                >
                  <Volume2 className="w-3 h-3 text-zinc-400" />
                  <span>Hear</span>
                </button>
              )}
            </div>

            {/* Quote Bubble - Muted Charcoal */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3.5 sm:p-4 text-xs sm:text-sm text-zinc-200 leading-relaxed italic relative min-h-[76px] flex items-center">
              <div className="break-words w-full">
                <span className="text-zinc-500 font-serif text-lg mr-1 select-none font-bold">
                  “
                </span>
                <span className="text-zinc-200">{quote1}</span>
                <span className="text-zinc-500 font-serif text-lg ml-1 select-none font-bold">
                  ”
                </span>
              </div>
            </div>
          </div>

          {/* Central VS Badge (Floating between columns on desktop) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-zinc-800 items-center justify-center font-bold font-['Cinzel'] text-xs text-zinc-200 border border-zinc-600 shadow select-none">
            VS
          </div>

          {/* Mobile VS Badge */}
          <div className="md:hidden flex items-center justify-center my-0.5">
            <span className="px-3 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold font-['Cinzel'] text-xs border border-zinc-700">
              VS
            </span>
          </div>

          {/* Shark 2 Fighter Card */}
          <div className="bg-zinc-950/80 border border-zinc-700 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 relative transition-all">
            {/* Fighter Identity Bar */}
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
              <div className="flex items-center gap-3 min-w-0">
                <SharkAvatar
                  sharkId={shark2?.id || brawl.shark2}
                  size="md"
                  status="FIGHTING"
                  isSpeaking={true}
                  circular={true}
                />
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-bold text-zinc-100 font-['Cinzel'] tracking-wide truncate">
                    {shark2?.name || brawl.shark2}
                  </h4>
                  <span className="text-[11px] font-mono text-zinc-400 font-medium uppercase tracking-wider block truncate">
                    {shark2?.nickname || 'Shark Investor'}
                  </span>
                </div>
              </div>

              {quote2 && shark2 && (
                <button
                  type="button"
                  onClick={() => onSharkSpeak(shark2.id, quote2)}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                  title={`Hear ${shark2.name}'s line`}
                >
                  <Volume2 className="w-3 h-3 text-zinc-400" />
                  <span>Hear</span>
                </button>
              )}
            </div>

            {/* Quote Bubble - Muted Charcoal */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3.5 sm:p-4 text-xs sm:text-sm text-zinc-200 leading-relaxed italic relative min-h-[76px] flex items-center">
              <div className="break-words w-full">
                <span className="text-zinc-500 font-serif text-lg mr-1 select-none font-bold">
                  “
                </span>
                <span className="text-zinc-200">{quote2}</span>
                <span className="text-zinc-500 font-serif text-lg ml-1 select-none font-bold">
                  ”
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Founder Advice Strip & Always Visible Action Bar */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm font-mono text-zinc-400 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-400 min-w-0">
            <Swords className="w-4 h-4 shrink-0 text-zinc-500" />
            <span className="text-xs text-zinc-400 leading-normal">
              Sharks are debating your valuation and deal terms.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSkipClash}
              className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs font-semibold border border-zinc-700 flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
            >
              <FastForward className="w-3.5 h-3.5 text-zinc-400" />
              <span>SKIP CLASH & RESUME &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isSpotlightExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="max-w-4xl w-full">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
