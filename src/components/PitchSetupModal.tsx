import React, { useState, useEffect } from 'react';
import { PitchData } from '../types/shark';
import { PRESET_PITCHES } from '../data/sharks';
import { Mic, Radio, ArrowRight, X } from 'lucide-react';
import { tankSpeech, SpeechRecognitionStatus } from '../utils/speechRecognition';

interface PitchSetupModalProps {
  isOpen: boolean;
  onStartPitch: (pitch: PitchData) => void;
  onClose?: () => void;
}

export const PitchSetupModal: React.FC<PitchSetupModalProps> = ({
  isOpen,
  onStartPitch,
  onClose,
}) => {
  const [formData, setFormData] = useState<PitchData>({
    businessName: '',
    tagline: '',
    pitchText: '',
    askAmount: 0,
    askEquity: 0,
    annualSales: 0,
    cogs: 0,
    retailPrice: 0,
    patents: '',
    category: '',
  });

  const [speechStatus, setSpeechStatus] = useState<SpeechRecognitionStatus>(tankSpeech.getStatus());

  useEffect(() => {
    const unsubscribe = tankSpeech.subscribe((status) => {
      setSpeechStatus(status);
      if (status.isListening && (status.transcript || status.interimTranscript)) {
        const combined = (status.transcript + ' ' + status.interimTranscript).trim();
        setFormData((prev) => ({
          ...prev,
          pitchText: combined,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleToggleVoicePitch = async () => {
    if (speechStatus.isListening) {
      await tankSpeech.stopListening();
    } else {
      await tankSpeech.startListening();
    }
  };

  const loadExample = (preset: PitchData) => {
    setFormData(preset);
  };

  const impliedValuation =
    formData.askEquity > 0 && formData.askAmount > 0
      ? Math.round(formData.askAmount / (formData.askEquity / 100))
      : 0;

  const grossMargin =
    formData.retailPrice > 0 && formData.cogs > 0
      ? Math.round(((formData.retailPrice - formData.cogs) / formData.retailPrice) * 100)
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (speechStatus.isListening) {
      tankSpeech.stopListening();
    }
    if (!formData.businessName.trim()) return;
    onStartPitch(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#05070c]/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b0e14] border border-zinc-800 rounded-xl max-w-2xl w-full p-6 md:p-8 shadow-xl relative my-6">
        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-colors cursor-pointer"
            title="Close and view Sharks"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header */}
        <div className="pb-5 mb-5 border-b border-zinc-800 pr-8">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-[0.2em] text-zinc-400 uppercase font-semibold">
              EXECUTIVE REGISTRATION
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-zinc-500">Need inspiration?</span>
              <button
                type="button"
                onClick={() => loadExample(PRESET_PITCHES[0])}
                className="text-[11px] font-mono text-zinc-300 hover:text-white underline cursor-pointer"
              >
                Fill Sample Idea
              </button>
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-normal tracking-[0.15em] text-zinc-100 mt-1 font-['Cinzel']">
            ENTER YOUR COMPANY DETAILS
          </h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Fill in each field for your business. The Sharks will review your exact numbers and question you turn-by-turn.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AeroPod, Lumina, CleanSprout..."
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                One-Line Tagline *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. The 10-second cold brew press for commuters"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Pitch Text with Voice Option */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                The Pitch / Problem & Solution *
              </label>
              <button
                type="button"
                onClick={handleToggleVoicePitch}
                disabled={speechStatus.isTranscribing}
                className={`text-[11px] font-mono flex items-center gap-1 px-2.5 py-0.5 rounded transition-colors cursor-pointer ${
                  speechStatus.isListening || speechStatus.isTranscribing
                    ? 'bg-zinc-800 text-zinc-200 border border-zinc-600'
                    : 'text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {speechStatus.isListening || speechStatus.isTranscribing ? (
                  <Radio className="w-3 h-3 animate-spin" />
                ) : (
                  <Mic className="w-3 h-3 text-zinc-400" />
                )}
                <span>
                  {speechStatus.isTranscribing
                    ? 'Transcribing...'
                    : speechStatus.isListening
                    ? 'Listening...'
                    : 'Dictate with Voice'}
                </span>
              </button>
            </div>
            <textarea
              rows={3}
              required
              placeholder="Sharks, we are seeking... (Explain what your product does, why it's better than competitors, and how you sell it)"
              value={formData.pitchText}
              onChange={(e) => setFormData({ ...formData, pitchText: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600 leading-relaxed placeholder:text-zinc-600"
            />
          </div>

          {/* Financials & Investment Ask */}
          <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-zinc-800">
              <span className="text-zinc-400 uppercase tracking-wider">Financials & Investment Ask</span>
              <span className="text-zinc-300">
                Implied Valuation:{' '}
                <span className="text-zinc-100 font-bold tabular-nums">
                  {impliedValuation > 0 ? `$${impliedValuation.toLocaleString()}` : '$0'}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-zinc-500 text-[10px] font-mono mb-1">Asking Cash ($) *</label>
                <input
                  type="number"
                  required
                  min="5000"
                  step="5000"
                  placeholder="250000"
                  value={formData.askAmount || ''}
                  onChange={(e) => setFormData({ ...formData, askAmount: Number(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-mono placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-zinc-500 text-[10px] font-mono mb-1">Equity Offered (%) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  step="0.5"
                  placeholder="10"
                  value={formData.askEquity || ''}
                  onChange={(e) => setFormData({ ...formData, askEquity: Number(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-mono placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-zinc-500 text-[10px] font-mono mb-1">Annual Sales ($) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  placeholder="150000"
                  value={formData.annualSales || ''}
                  onChange={(e) => setFormData({ ...formData, annualSales: Number(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-mono placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-zinc-500 text-[10px] font-mono mb-1">Unit Cost ($) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.5"
                  placeholder="4.50"
                  value={formData.cogs || ''}
                  onChange={(e) => setFormData({ ...formData, cogs: Number(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-mono placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800 text-xs font-mono text-zinc-400">
              <div>
                <label className="block text-zinc-500 text-[10px] font-mono mb-1">Retail Selling Price ($) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.5"
                  placeholder="19.99"
                  value={formData.retailPrice || ''}
                  onChange={(e) => setFormData({ ...formData, retailPrice: Number(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-mono placeholder:text-zinc-600"
                />
                {grossMargin > 0 && (
                  <div className="text-[10px] text-zinc-400 mt-1 font-mono">
                    Calculated Gross Margin: {grossMargin}%
                  </div>
                )}
              </div>

              <div>
                <label className="block text-zinc-500 text-[10px] font-mono mb-1">Patents / Moat / Defensibility</label>
                <input
                  type="text"
                  placeholder="e.g. Utility patent granted, trade secret, provisional..."
                  value={formData.patents}
                  onChange={(e) => setFormData({ ...formData, patents: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 font-mono placeholder:text-zinc-600"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!formData.businessName || !formData.pitchText || !formData.askAmount || !formData.askEquity}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-100 font-semibold text-sm rounded border border-zinc-600 transition-all font-mono tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>SUBMIT DETAILS & ENTER THE TANK</span>
              <ArrowRight className="w-4 h-4 text-zinc-300" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
