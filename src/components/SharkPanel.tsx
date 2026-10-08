import React from 'react';
import { SharkProfile, SharkStatus, SharkOffer } from '../types/shark';
import { SharkAvatar } from './SharkAvatar';
import { Volume2, BookOpen, DollarSign, Smile, Meh, Frown, MinusCircle } from 'lucide-react';

interface SharkPanelProps {
  sharks: SharkProfile[];
  statuses: Record<string, SharkStatus>;
  interestScores: Record<string, number>;
  latestQuotes: Record<string, string>;
  activeOffers: SharkOffer[];
  speakingSharkId: string | null;
  currentQuestioningSharkId?: string | null;
  onSharkSpeak: (sharkId: string, quote: string) => void;
  onOpenOffer: (offer: SharkOffer) => void;
  selectedSharkId?: string | null;
  onSelectShark?: (sharkId: string) => void;
}

export const SharkPanel: React.FC<SharkPanelProps> = ({
  sharks,
  statuses,
  interestScores,
  latestQuotes,
  activeOffers,
  speakingSharkId,
  currentQuestioningSharkId,
  onSharkSpeak,
  onOpenOffer,
  selectedSharkId,
  onSelectShark,
}) => {
  const getStatusLabel = (sharkId: string, status: SharkStatus, hasOffer: boolean) => {
    if (status === 'OUT') {
      return (
        <span className="text-zinc-500 font-mono text-[10px] tracking-wider uppercase font-medium">
          Closed Book · Out
        </span>
      );
    }
    if (hasOffer) {
      return (
        <span className="text-zinc-200 font-mono text-[10px] tracking-wider uppercase font-semibold flex items-center gap-1 justify-center">
          <DollarSign className="w-3 h-3 text-zinc-300" />
          Offer on Table
        </span>
      );
    }
    if (sharkId === currentQuestioningSharkId) {
      return (
        <span className="text-zinc-200 font-mono text-[10px] tracking-wider uppercase font-semibold flex items-center gap-1.5 justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          Questioning You
        </span>
      );
    }
    if (status === 'FIGHTING') {
      return (
        <span className="text-zinc-300 font-mono text-[10px] tracking-wider uppercase font-semibold">
          Clashing
        </span>
      );
    }
    return (
      <span className="text-zinc-400 font-mono text-[10px] tracking-wider uppercase flex items-center gap-1 justify-center">
        <BookOpen className="w-3 h-3 text-zinc-500" />
        Taking Notes
      </span>
    );
  };

  /**
   * Subtle sentiment indicator icon & description dynamically computed from current interestScore
   * Neutral (45-69%), Skeptical (<45%), Impressed (>=70%), or Closed Book / Out
   */
  const getSentimentIndicator = (
    score: number,
    isOut: boolean,
    hasOffer: boolean
  ) => {
    if (isOut) {
      return {
        label: 'Out',
        tooltip: 'Out of deal negotiations',
        icon: <MinusCircle className="w-3.5 h-3.5 text-zinc-600 shrink-0" />,
        textClass: 'text-zinc-600',
      };
    }
    if (hasOffer || score >= 70) {
      return {
        label: hasOffer ? 'Offer on Table' : 'Impressed',
        tooltip: hasOffer
          ? `Impressed · Deal offered on table (${score}% interest)`
          : `Impressed · Highly receptive (${score}% interest)`,
        icon: <Smile className="w-3.5 h-3.5 text-zinc-300 shrink-0" />,
        textClass: 'text-zinc-300',
      };
    }
    if (score >= 45) {
      return {
        label: 'Neutral',
        tooltip: `Neutral · Deliberating numbers (${score}% interest)`,
        icon: <Meh className="w-3.5 h-3.5 text-zinc-400 shrink-0" />,
        textClass: 'text-zinc-400',
      };
    }
    return {
      label: 'Skeptical',
      tooltip: `Skeptical · Scrutinizing pitch (${score}% interest)`,
      icon: <Frown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />,
      textClass: 'text-zinc-500',
    };
  };

  /**
   * Muted mood indicator based on current interestScore
   * Uses only understated neutral, charcoal, slate, and stone tones
   */
  const getMoodIndicator = (
    score: number,
    isOut: boolean,
    hasOffer: boolean,
    isQuestioning: boolean,
    isSpeaking: boolean,
  ) => {
    if (isOut) {
      return {
        cardBorder: 'border-zinc-800/60 bg-zinc-950/40 opacity-40 shadow-none',
        moodLabel: 'Out',
        moodBadgeColor: 'text-zinc-600',
        dotClass: 'bg-zinc-700',
        barColor: 'bg-zinc-800',
      };
    }

    if (hasOffer) {
      return {
        cardBorder:
          'border-zinc-500 bg-zinc-900/90 shadow-md ring-1 ring-zinc-500/40',
        moodLabel: 'Deal Offered',
        moodBadgeColor: 'text-zinc-200 font-semibold',
        dotClass: 'bg-zinc-300',
        barColor: 'bg-zinc-300',
      };
    }

    // Positive mood (interestScore >= 70): Muted light slate / zinc tone
    if (score >= 70) {
      return {
        cardBorder: isQuestioning
          ? 'border-zinc-500 bg-zinc-900/90 shadow-md ring-1 ring-zinc-500/50'
          : isSpeaking
          ? 'border-zinc-500/80 bg-zinc-900/80 shadow-sm'
          : 'border-zinc-600/70 bg-zinc-900/60 hover:border-zinc-500 shadow-sm',
        moodLabel: 'Positive',
        moodBadgeColor: 'text-zinc-200 font-semibold',
        dotClass: 'bg-zinc-300',
        barColor: 'bg-zinc-300',
      };
    }

    // Neutral / Cautious mood (45 <= interestScore < 70): Muted mid-gray tone
    if (score >= 45) {
      return {
        cardBorder: isQuestioning
          ? 'border-zinc-600 bg-zinc-900/80 shadow-sm ring-1 ring-zinc-600/50'
          : isSpeaking
          ? 'border-zinc-600/70 bg-zinc-900/70 shadow-sm'
          : 'border-zinc-700/60 bg-zinc-900/50 hover:border-zinc-600/80',
        moodLabel: 'Cautious',
        moodBadgeColor: 'text-zinc-400 font-medium',
        dotClass: 'bg-zinc-500',
        barColor: 'bg-zinc-500',
      };
    }

    // Skeptical mood (interestScore < 45): Muted dark charcoal tone
    return {
      cardBorder: isQuestioning
        ? 'border-zinc-700 bg-zinc-950/90 shadow-sm ring-1 ring-zinc-700/50'
        : isSpeaking
        ? 'border-zinc-700/70 bg-zinc-950/80 shadow-sm'
        : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700/70',
      moodLabel: 'Skeptical',
      moodBadgeColor: 'text-zinc-500 font-medium',
      dotClass: 'bg-zinc-600',
      barColor: 'bg-zinc-600',
    };
  };

  return (
    <div className="w-full space-y-4">
      {/* "Choose Your Shark" Section Header - Muted Styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          {/* Muted Circular Shark Icon Emblem */}
          <div className="w-9 h-9 rounded-full bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 32 32"
              className="w-5 h-5 text-zinc-300"
              fill="currentColor"
            >
              <path d="M7 25 C11 25, 14 24, 16 20 C18 16, 20 8, 26 5 C22 13, 22 18, 25 25 Z" />
              <path
                d="M4 25.5 C10 24.5, 22 24.5, 28 25.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.4"
              />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 font-['Cinzel']">
                Choose Your Shark
              </h2>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
                5 INVESTORS
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-none mt-1">
              Venture titans with notebooks · Sentiment, cross-examination & deals
            </p>
          </div>
        </div>

        {/* Legend / Sentiment Feedback - Muted Palette */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-1.5" title="Interest >= 70% or Deal Offered">
            <Smile className="w-3.5 h-3.5 text-zinc-300" />
            <span className="text-zinc-300">Impressed</span>
          </div>
          <div className="flex items-center gap-1.5" title="Interest 45% – 69%">
            <Meh className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400">Neutral</span>
          </div>
          <div className="flex items-center gap-1.5" title="Interest < 45%">
            <Frown className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-zinc-500">Skeptical</span>
          </div>
        </div>
      </div>

      {/* 5 Shark Cards Grid - Muted Monochromatic Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {sharks.map((shark) => {
          const status = statuses[shark.id] || 'LISTENING';
          const isOut = status === 'OUT';
          const score = interestScores[shark.id] ?? 50;
          const quote = latestQuotes[shark.id] || shark.famousQuote;
          const isSpeaking = speakingSharkId === shark.id;
          const isQuestioning = currentQuestioningSharkId === shark.id;
          const offer = activeOffers.find((o) => o.sharkId === shark.id);
          const isSelected = selectedSharkId === shark.id;

          const mood = getMoodIndicator(score, isOut, !!offer, isQuestioning, isSpeaking);
          const sentiment = getSentimentIndicator(score, isOut, !!offer);

          return (
            <div
              key={shark.id}
              onClick={() => onSelectShark && onSelectShark(shark.id)}
              className={`relative rounded-xl p-4 flex flex-col justify-between transition-all duration-300 border ${
                mood.cardBorder
              } ${isSelected ? 'ring-1 ring-zinc-400' : ''} ${
                !isOut ? 'hover:border-zinc-500 cursor-pointer' : ''
              }`}
            >
              {/* Card Main Body */}
              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Circular Portrait */}
                <div className="relative mb-3 group/avatar">
                  <SharkAvatar
                    sharkId={shark.id}
                    size="lg"
                    status={status}
                    isSpeaking={isSpeaking}
                    isQuestioning={isQuestioning}
                    circular={true}
                  />

                  {/* Sitting with Book icon pill on avatar */}
                  {!isOut && (
                    <div
                      className="absolute -bottom-1 -left-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium flex items-center gap-1 border bg-zinc-900 text-zinc-300 border-zinc-700 shadow-sm"
                      title={`${shark.name} taking notes in their tank notebook`}
                    >
                      <BookOpen className="w-2.5 h-2.5 text-zinc-400" />
                      <span>Book</span>
                    </div>
                  )}
                </div>

                {/* Shark Name with Dynamic Sentiment Indicator Icon */}
                <div className="flex items-center justify-center gap-1.5 w-full">
                  <h3 className="text-base font-bold text-zinc-100 tracking-tight truncate font-['Cinzel']">
                    {shark.name}
                  </h3>
                  <span
                    className="inline-flex items-center justify-center transition-all duration-300 shrink-0"
                    title={`Sentiment: ${sentiment.label} · ${sentiment.tooltip}`}
                    aria-label={`${shark.name} sentiment: ${sentiment.label}`}
                  >
                    {sentiment.icon}
                  </span>
                </div>

                {/* Subtitle / Role */}
                <p className="text-xs text-zinc-400 font-medium leading-tight mt-0.5 truncate w-full">
                  {shark.role}
                </p>

                {/* Net Worth */}
                <p className="text-[11px] font-mono text-zinc-400 font-medium mt-1">
                  {shark.netWorth}
                </p>

                {/* Primary Expertise Tag Centered */}
                <div className="mt-2 flex flex-wrap justify-center gap-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/70 inline-flex items-center gap-1">
                    {shark.specialty[0]}
                  </span>
                </div>

                {/* Description / Quote Snippet */}
                <p className="text-xs text-zinc-400 italic leading-relaxed mt-2.5 line-clamp-2 min-h-[32px] px-1">
                  "{quote}"
                </p>

                {/* Live Status Indicator */}
                <div className="mt-3 w-full pt-2 border-t border-zinc-800/80">
                  {getStatusLabel(shark.id, status, !!offer)}

                  {/* Interest Score & Mood Bar */}
                  {!isOut && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${mood.dotClass}`} />
                          <span className={mood.moodBadgeColor}>{sentiment.label}</span>
                        </span>
                        <span className="text-zinc-300 font-semibold tabular-nums">
                          {score}% Interest
                        </span>
                      </div>

                      {/* Interest Meter Gauge */}
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${mood.barColor}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Controls */}
              <div className="relative z-10 mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSharkSpeak(shark.id, quote);
                  }}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1 font-mono px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 cursor-pointer"
                  title={`Listen to ${shark.name}`}
                >
                  <Volume2 className="w-3 h-3 text-zinc-400" />
                  <span>Hear</span>
                </button>

                {offer ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenOffer(offer);
                    }}
                    className="px-2.5 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-mono font-semibold text-[10px] border border-zinc-500 transition-all cursor-pointer"
                  >
                    View Deal
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-500">
                    {shark.nickname}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
