import React from 'react';
import { DebriefReport, PitchData, SharkProfile } from '../types/shark';
import { X, Printer, RotateCcw } from 'lucide-react';
import { SharkAvatar } from './SharkAvatar';

interface DebriefModalProps {
  report: DebriefReport | null;
  pitch: PitchData;
  sharks: SharkProfile[];
  isOpen: boolean;
  onClose: () => void;
  onRestartPitch: () => void;
}

export const DebriefModal: React.FC<DebriefModalProps> = ({
  report,
  pitch,
  sharks,
  isOpen,
  onClose,
  onRestartPitch,
}) => {
  if (!isOpen || !report) return null;

  const winningShark = sharks.find((s) => s.id === report.winningDeal?.sharkId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05070c]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b0e14] border border-zinc-800 rounded-xl max-w-2xl w-full p-6 md:p-8 shadow-xl relative my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 print:hidden cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="pb-5 mb-5 border-b border-zinc-800">
          <div className="text-[11px] font-mono tracking-[0.2em] text-zinc-400 uppercase font-semibold">
            EXECUTIVE AUDIT
          </div>
          <h2 className="text-xl md:text-2xl font-normal tracking-[0.15em] text-zinc-100 mt-1 font-['Cinzel']">
            PITCH DEBRIEF & SCORECARD
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            {pitch.businessName.toUpperCase()} · Evaluation Report
          </p>
        </div>

        {/* Status Outcome */}
        <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {report.dealClosed && winningShark && (
              <SharkAvatar sharkId={winningShark.id} size="sm" />
            )}
            <div>
              <div className="text-sm font-mono font-bold text-zinc-100">
                {report.dealClosed ? `Deal Secured with ${winningShark?.name}` : 'No Deal Closed'}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                {report.dealClosed && report.winningDeal
                  ? `$${report.winningDeal.amount.toLocaleString()} for ${report.winningDeal.equity}% equity`
                  : 'You walked away with 100% founder ownership.'}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-zinc-500 font-mono uppercase">Rating</div>
            <div className="text-xl font-mono font-bold text-zinc-200">
              {report.grade}
            </div>
          </div>
        </div>

        {/* Valuation Assessment */}
        <div className="mb-5 p-3.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-mono">
          <span className="text-zinc-500 uppercase mr-2">Valuation Audit:</span>
          {report.valuationAssessment}
        </div>

        {/* Strengths & Flaws */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 text-xs">
          <div className="p-3.5 bg-zinc-950 rounded-lg border border-zinc-800">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Strengths Demonstrated
            </div>
            <ul className="space-y-1.5 text-zinc-300">
              {report.sharkPraise.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-zinc-400 select-none font-mono">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 bg-zinc-950 rounded-lg border border-zinc-800">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Weaknesses Exposed
            </div>
            <ul className="space-y-1.5 text-zinc-300">
              {report.sharkCriticisms.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-zinc-600 select-none font-mono">/</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tactical Tips */}
        <div className="mb-6 p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Recommended Pitch Adjustments
          </div>
          <div className="space-y-2 text-xs text-zinc-300">
            {report.pitchDoctorTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-zinc-500 font-mono text-[10px]">0{idx + 1}.</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 print:hidden text-xs font-mono">
          <button
            onClick={handlePrint}
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-400" />
            <span>Print Report</span>
          </button>

          <button
            onClick={onRestartPitch}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold rounded border border-zinc-600 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Pitch New Idea</span>
          </button>
        </div>
      </div>
    </div>
  );
};
