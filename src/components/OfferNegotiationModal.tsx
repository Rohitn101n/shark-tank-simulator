import React, { useState } from 'react';
import { SharkOffer, SharkProfile } from '../types/shark';
import { SharkAvatar } from './SharkAvatar';
import { X, Clock } from 'lucide-react';

interface OfferNegotiationModalProps {
  offer: SharkOffer | null;
  shark: SharkProfile | undefined;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (offer: SharkOffer) => void;
  onCounter: (counterText: string, offer: SharkOffer) => void;
  onDecline: (offerId: string) => void;
}

export const OfferNegotiationModal: React.FC<OfferNegotiationModalProps> = ({
  offer,
  shark,
  isOpen,
  onClose,
  onAccept,
  onCounter,
  onDecline,
}) => {
  const [counterEquity, setCounterEquity] = useState<number>(offer?.equity || 10);
  const [counterAmount, setCounterAmount] = useState<number>(offer?.amount || 100000);
  const [counterNote, setCounterNote] = useState<string>('');

  if (!isOpen || !offer || !shark) return null;

  const handleSendCounter = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `I respect your offer, ${shark.name}, but will you do $${counterAmount.toLocaleString()} for ${counterEquity}% equity? ${
      counterNote ? `Also: ${counterNote}` : ''
    }`;
    onCounter(message, offer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05070c]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b0e14] border border-zinc-800 rounded-xl max-w-lg w-full p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Shark Header */}
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-zinc-800">
          <SharkAvatar sharkId={shark.id} size="sm" />
          <div>
            <div className="text-[10px] uppercase font-mono text-zinc-400">
              Active Shark Bid
            </div>
            <h3 className="text-base font-bold text-zinc-100 font-['Cinzel']">
              {shark.name}
            </h3>
          </div>
        </div>

        {/* Offer Details */}
        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 mb-5 space-y-2">
          <div className="text-xl font-mono font-bold text-zinc-100">
            ${offer.amount.toLocaleString()} for {offer.equity}%
          </div>

          {offer.royalty && (
            <div className="text-xs text-zinc-300 font-mono">
              <span className="font-semibold">Royalty: </span>
              {offer.royalty.description}
            </div>
          )}

          {offer.shotClockSeconds && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>Shot Clock: {offer.shotClockSeconds}s remaining</span>
            </div>
          )}

          <p className="text-xs text-zinc-400 italic pt-1">
            "{offer.explanation}"
          </p>
        </div>

        {/* Counter-Offer Builder */}
        <form onSubmit={handleSendCounter} className="mb-5 space-y-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            Propose Counter-Offer
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-zinc-500 font-mono mb-1">Counter Cash ($)</label>
              <input
                type="number"
                step="25000"
                value={counterAmount}
                onChange={(e) => setCounterAmount(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 font-mono mb-1">Counter Equity (%)</label>
              <input
                type="number"
                step="1"
                min="1"
                max="50"
                value={counterEquity}
                onChange={(e) => setCounterEquity(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-zinc-500 font-mono mb-1">Condition (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Cap royalty at $200k, or add advisory role"
              value={counterNote}
              onChange={(e) => setCounterNote(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-mono border border-zinc-700 transition-colors cursor-pointer"
          >
            Submit Counter to {shark.name}
          </button>
        </form>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          <button
            onClick={() => {
              onAccept(offer);
              onClose();
            }}
            className="py-2.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-semibold rounded border border-zinc-500 transition-colors cursor-pointer"
          >
            Accept Deal
          </button>
          <button
            onClick={() => {
              onDecline(offer.id);
              onClose();
            }}
            className="py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition-colors border border-zinc-800 cursor-pointer"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};
