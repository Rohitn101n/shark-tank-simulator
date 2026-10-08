import React from 'react';
import { SharkOffer, SharkProfile } from '../types/shark';
import { SharkAvatar } from './SharkAvatar';
import { Handshake } from 'lucide-react';

interface FinalOffersShowdownProps {
  isOpen: boolean;
  offers: SharkOffer[];
  sharks: SharkProfile[];
  onAcceptDeal: (offer: SharkOffer) => void;
  onWalkAway: () => void;
}

export const FinalOffersShowdown: React.FC<FinalOffersShowdownProps> = ({
  isOpen,
  offers,
  sharks,
  onAcceptDeal,
  onWalkAway,
}) => {
  if (!isOpen) return null;

  const getShark = (id: string) => sharks.find((s) => s.id === id);

  return (
    <div className="fixed inset-0 z-50 bg-[#05070c]/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b0e14] border border-zinc-800 rounded-xl max-w-4xl w-full p-6 md:p-8 shadow-xl relative my-6">
        {/* Header */}
        <div className="text-center pb-5 mb-5 border-b border-zinc-800">
          <div className="text-[11px] font-mono tracking-[0.2em] text-zinc-400 uppercase font-semibold">
            THE 5-MINUTE TANK CLOCK HAS CONCLUDED
          </div>
          <h2 className="text-2xl md:text-3xl font-normal tracking-[0.15em] text-zinc-100 mt-1 font-['Cinzel']">
            FINAL COMPETING SHARK DEALS
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-lg mx-auto leading-relaxed">
            The interrogation is over. The Sharks have laid their final offers on the table. Accept one deal to partner with that Shark, or walk away empty handed.
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {offers.map((offer) => {
            const shark = getShark(offer.sharkId);
            if (!shark) return null;

            return (
              <div
                key={offer.id}
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-sm relative group"
              >
                <div>
                  {/* Shark Header */}
                  <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-zinc-800">
                    <SharkAvatar sharkId={shark.id} size="sm" />
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100 font-['Cinzel']">
                        {shark.name}
                      </h3>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {shark.nickname}
                      </div>
                    </div>
                  </div>

                  {/* Financials */}
                  <div className="space-y-1">
                    <div className="text-base font-mono font-bold text-zinc-100">
                      ${offer.amount.toLocaleString()} for {offer.equity}%
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      Implied Valuation: ${Math.round(offer.amount / (offer.equity / 100)).toLocaleString()}
                    </div>

                    {offer.royalty && (
                      <div className="text-[11px] text-zinc-300 font-mono bg-zinc-900 p-2 rounded border border-zinc-800 mt-2">
                        <span className="font-semibold text-zinc-200">Royalty: </span>
                        {offer.royalty.description}
                      </div>
                    )}

                    <p className="text-xs text-zinc-400 italic pt-2 leading-relaxed">
                      "{offer.explanation}"
                    </p>
                  </div>
                </div>

                {/* Accept Deal Button */}
                <div className="pt-4 mt-3 border-t border-zinc-800">
                  <button
                    onClick={() => onAcceptDeal(offer)}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs font-mono rounded border border-zinc-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Handshake className="w-3.5 h-3.5 text-zinc-300" />
                    <span>ACCEPT {shark.name.split(' ')[0].toUpperCase()}'S DEAL</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer / Walk Away */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800 text-xs font-mono">
          <span className="text-zinc-500">
            {offers.length} competing offers on the floor
          </span>

          <button
            onClick={onWalkAway}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Decline All Offers & Walk Away (Keep 100% Equity)
          </button>
        </div>
      </div>
    </div>
  );
};
