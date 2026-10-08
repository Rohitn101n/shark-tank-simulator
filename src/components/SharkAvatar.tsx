import React from 'react';

interface SharkAvatarProps {
  sharkId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: string;
  isSpeaking?: boolean;
  isQuestioning?: boolean;
  circular?: boolean;
}

export const SharkAvatar: React.FC<SharkAvatarProps> = ({
  sharkId,
  size = 'md',
  status,
  isSpeaking = false,
  isQuestioning = false,
  circular = true,
}) => {
  const sizeMap = {
    sm: 'w-11 h-11',
    md: 'w-16 h-16',
    lg: 'w-20 h-20 sm:w-24 sm:h-24',
    xl: 'w-28 h-28',
    '2xl': 'w-32 h-32',
  };

  const getSharkGlow = (id: string) => {
    switch (id) {
      case 'mark':
        return {
          ring: 'border-slate-700/80 shadow-sm',
          bg: 'from-slate-900/60 via-zinc-900/40 to-[#0c0e14]',
        };
      case 'kevin':
        return {
          ring: 'border-zinc-700/80 shadow-sm',
          bg: 'from-zinc-900/60 via-zinc-950/40 to-[#0e0c0d]',
        };
      case 'lori':
        return {
          ring: 'border-stone-700/80 shadow-sm',
          bg: 'from-stone-900/60 via-zinc-900/40 to-[#0e0d0c]',
        };
      case 'daymond':
        return {
          ring: 'border-zinc-700/80 shadow-sm',
          bg: 'from-zinc-900/60 via-zinc-950/40 to-[#0d0d0f]',
        };
      case 'barbara':
        return {
          ring: 'border-slate-700/80 shadow-sm',
          bg: 'from-slate-900/60 via-zinc-900/40 to-[#0c0f12]',
        };
      default:
        return {
          ring: 'border-zinc-800 shadow-none',
          bg: 'from-zinc-900 to-zinc-950',
        };
    }
  };

  const isOut = status === 'OUT';
  const glow = getSharkGlow(sharkId);

  const renderCharacter = () => {
    switch (sharkId) {
      case 'mark':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="markSuit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            {/* Executive Leather High-Back Chair */}
            <path d="M 22 15 C 22 10, 78 10, 78 15 L 82 85 C 82 92, 18 92, 18 85 Z" fill="#090d16" stroke="#1e293b" strokeWidth="1.5" />
            <line x1="28" y1="20" x2="28" y2="80" stroke="#1e293b" strokeWidth="1" opacity="0.6" />
            <line x1="72" y1="20" x2="72" y2="80" stroke="#1e293b" strokeWidth="1" opacity="0.6" />
            {/* Mark Character Body */}
            <path d="M 28 85 C 30 60, 42 55, 50 56 C 58 55, 70 60, 72 85 Z" fill="url(#markSuit)" />
            <path d="M 44 56 L 50 68 L 56 56 Z" fill="#ffffff" />
            <rect x="45" y="44" width="10" height="12" rx="2" fill="#fed7aa" />
            <circle cx="50" cy="38" r="14" fill="#fed7aa" />
            {/* Brown Hair */}
            <path d="M 36 34 C 36 22, 64 22, 64 34 C 62 27, 56 25, 50 25 C 44 25, 38 27, 36 34 Z" fill="#451a03" />
            {/* Confident Smirk & Eyes */}
            <circle cx="45" cy="37" r="1.5" fill="#1e293b" />
            <circle cx="55" cy="37" r="1.5" fill="#1e293b" />
            <path d="M 46 45 Q 50 48 55 46" stroke="#9a3412" strokeWidth="1.5" fill="none" />
            {/* Black Shark Tank Notebook in hands */}
            <rect x="36" y="70" width="28" height="18" rx="2" fill="#050811" stroke="#71717a" strokeWidth="1.2" />
            <line x1="50" y1="70" x2="50" y2="88" stroke="#71717a" strokeWidth="0.8" opacity="0.7" />
            <circle cx="43" cy="79" r="1" fill="#a1a1aa" />
          </svg>
        );

      case 'kevin':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Executive Leather Chair */}
            <path d="M 22 15 C 22 10, 78 10, 78 15 L 82 85 C 82 92, 18 92, 18 85 Z" fill="#090d16" stroke="#1e293b" strokeWidth="1.5" />
            {/* Dark Luxury Suit & Steel Tie */}
            <path d="M 28 85 C 30 60, 42 55, 50 56 C 58 55, 70 60, 72 85 Z" fill="#050505" />
            <path d="M 44 56 L 50 68 L 56 56 Z" fill="#ffffff" />
            <polygon points="48,60 52,60 51,78 49,78" fill="#475569" />
            {/* Bald Head */}
            <rect x="45" y="44" width="10" height="12" rx="2" fill="#fecdd3" />
            <circle cx="50" cy="37" r="14" fill="#fecdd3" />
            {/* Glasses */}
            <rect x="40" y="34" width="8" height="6" rx="1.5" fill="none" stroke="#64748b" strokeWidth="1" />
            <rect x="52" y="34" width="8" height="6" rx="1.5" fill="none" stroke="#64748b" strokeWidth="1" />
            <line x1="48" y1="37" x2="52" y2="37" stroke="#64748b" strokeWidth="1" />
            <circle cx="44" cy="37" r="1" fill="#09090b" />
            <circle cx="56" cy="37" r="1" fill="#09090b" />
            <path d="M 46 45 Q 50 43 54 45" stroke="#52525b" strokeWidth="1.2" fill="none" />
            {/* Black Muted Royalty Notebook */}
            <rect x="36" y="70" width="28" height="18" rx="2" fill="#09090b" stroke="#64748b" strokeWidth="1.2" />
            <line x1="50" y1="70" x2="50" y2="88" stroke="#64748b" strokeWidth="0.8" opacity="0.6" />
            <circle cx="43" cy="79" r="1.5" fill="#a1a1aa" />
          </svg>
        );

      case 'lori':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Executive Leather Chair */}
            <path d="M 22 15 C 22 10, 78 10, 78 15 L 82 85 C 82 92, 18 92, 18 85 Z" fill="#090d16" stroke="#1e293b" strokeWidth="1.5" />
            {/* Muted Charcoal Tailored Blazer */}
            <path d="M 28 85 C 30 60, 42 55, 50 56 C 58 55, 70 60, 72 85 Z" fill="#3f3f46" />
            <path d="M 44 56 L 50 68 L 56 56 Z" fill="#ffffff" />
            {/* Neck & Face */}
            <rect x="45" y="44" width="10" height="12" rx="2" fill="#fed7aa" />
            <circle cx="50" cy="38" r="13" fill="#fed7aa" />
            {/* Ash Blonde Hair */}
            <path d="M 34 38 C 34 20, 66 20, 66 38 C 68 50, 65 62, 62 68 C 60 56, 58 48, 56 38 C 54 28, 46 28, 44 38 C 42 48, 40 56, 38 68 C 35 62, 32 50, 34 38 Z" fill="#a8a29e" />
            {/* Eyes & Smile */}
            <circle cx="45" cy="37" r="1.5" fill="#64748b" />
            <circle cx="55" cy="37" r="1.5" fill="#64748b" />
            <path d="M 46 45 Q 50 49 54 45" stroke="#71717a" strokeWidth="1.8" fill="none" />
            {/* Retail Patent Notebook in hands */}
            <rect x="36" y="70" width="28" height="18" rx="2" fill="#050811" stroke="#52525b" strokeWidth="1.2" />
            <line x1="50" y1="70" x2="50" y2="88" stroke="#52525b" strokeWidth="0.8" opacity="0.6" />
            <circle cx="43" cy="79" r="1.2" fill="#a1a1aa" />
          </svg>
        );

      case 'daymond':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Executive Leather Chair */}
            <path d="M 22 15 C 22 10, 78 10, 78 15 L 82 85 C 82 92, 18 92, 18 85 Z" fill="#090d16" stroke="#1e293b" strokeWidth="1.5" />
            {/* Sharp Charcoal Suit */}
            <path d="M 28 85 C 30 60, 42 55, 50 56 C 58 55, 70 60, 72 85 Z" fill="#18181b" />
            <path d="M 44 56 L 50 68 L 56 56 Z" fill="#ffffff" />
            {/* Shaved Head & Warm Complexion */}
            <rect x="45" y="44" width="10" height="12" rx="2" fill="#9a3412" />
            <circle cx="50" cy="37" r="13.5" fill="#9a3412" />
            {/* Goatee */}
            <path d="M 46 44 Q 50 46 54 44 Q 50 50 46 44 Z" fill="#1c1917" />
            <circle cx="45" cy="37" r="1.5" fill="#09090b" />
            <circle cx="55" cy="37" r="1.5" fill="#09090b" />
            {/* Branding/Licensing Notebook in hands */}
            <rect x="36" y="70" width="28" height="18" rx="2" fill="#050811" stroke="#52525b" strokeWidth="1.2" />
            <line x1="50" y1="70" x2="50" y2="88" stroke="#52525b" strokeWidth="0.8" opacity="0.6" />
            <circle cx="43" cy="79" r="1" fill="#a1a1aa" />
          </svg>
        );

      case 'barbara':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Executive Leather Chair */}
            <path d="M 22 15 C 22 10, 78 10, 78 15 L 82 85 C 82 92, 18 92, 18 85 Z" fill="#090d16" stroke="#1e293b" strokeWidth="1.5" />
            {/* Muted Deep Slate Blazer */}
            <path d="M 28 85 C 30 60, 42 55, 50 56 C 58 55, 70 60, 72 85 Z" fill="#334155" />
            <path d="M 44 56 L 50 68 L 56 56 Z" fill="#ffffff" />
            {/* Face */}
            <rect x="45" y="44" width="10" height="12" rx="2" fill="#fed7aa" />
            <circle cx="50" cy="38" r="13" fill="#fed7aa" />
            {/* Soft Blonde Pixie Cut */}
            <path d="M 37 36 C 35 24, 65 24, 63 36 C 60 30, 54 26, 48 26 C 42 26, 38 30, 37 36 Z" fill="#a8a29e" />
            <circle cx="45" cy="37" r="1.5" fill="#64748b" />
            <circle cx="55" cy="37" r="1.5" fill="#64748b" />
            <path d="M 46 45 Q 50 48 54 45" stroke="#71717a" strokeWidth="1.6" fill="none" />
            {/* Instinct Notebook in hands */}
            <rect x="36" y="70" width="28" height="18" rx="2" fill="#050811" stroke="#52525b" strokeWidth="1.2" />
            <line x1="50" y1="70" x2="50" y2="88" stroke="#52525b" strokeWidth="0.8" opacity="0.6" />
            <circle cx="43" cy="79" r="1" fill="#a1a1aa" />
          </svg>
        );

      default:
        return (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-300 font-bold">
            {sharkId.slice(0, 2).toUpperCase()}
          </div>
        );
    }
  };

  return (
    <div className={`relative ${sizeMap[size]} shrink-0 transition-all duration-300`}>
      <div
        className={`w-full h-full overflow-hidden border-2 bg-gradient-to-b ${glow.bg} transition-all duration-300 ${
          circular ? 'rounded-full' : 'rounded-xl'
        } ${
          isSpeaking
            ? 'ring-2 ring-zinc-400 border-zinc-400 scale-105 shadow-md'
            : isQuestioning
            ? 'ring-2 ring-slate-400 border-slate-400 scale-105 shadow-md'
            : isOut
            ? 'grayscale opacity-30 border-zinc-900 shadow-none'
            : `${glow.ring} hover:scale-105`
        }`}
      >
        {renderCharacter()}
      </div>

      {/* Out Stamp */}
      {isOut && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-zinc-900 text-zinc-400 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-zinc-700 transform -rotate-12 shadow-sm tracking-wider">
            OUT
          </div>
        </div>
      )}

      {/* Questioning indicator: Looking up from book */}
      {isQuestioning && !isOut && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4">
          <span className="relative inline-flex rounded-full h-4 w-4 bg-zinc-700 items-center justify-center text-[8px] text-zinc-200 font-bold border border-zinc-500">
            ✍️
          </span>
        </span>
      )}
    </div>
  );
};
