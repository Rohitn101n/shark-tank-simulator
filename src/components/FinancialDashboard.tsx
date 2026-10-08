import React from 'react';
import { PitchData, ViabilityMetrics } from '../types/shark';

interface FinancialDashboardProps {
  pitch: PitchData;
  viability: ViabilityMetrics | null;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ pitch, viability }) => {
  const impliedValuation = pitch.askEquity > 0
    ? Math.round(pitch.askAmount / (pitch.askEquity / 100))
    : 0;

  const grossMargin = pitch.retailPrice > 0
    ? Math.round(((pitch.retailPrice - pitch.cogs) / pitch.retailPrice) * 100)
    : 0;

  const unitProfit = (pitch.retailPrice - pitch.cogs).toFixed(2);
  const multiple = pitch.annualSales > 0 ? (impliedValuation / pitch.annualSales).toFixed(1) : 'Pre-Rev';

  return (
    <div className="bg-[#0b0e14] border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
            FINANCIAL APPRAISAL & UNIT ECONOMICS
          </h2>
          {viability && (
            <div className="text-xs font-mono tabular-nums text-zinc-400">
              Viability: <span className="text-zinc-200 font-bold">{viability.overallScore}</span>/100
            </div>
          )}
        </div>

        {/* 4 Primary Figures in Clean Columns */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b border-zinc-800">
          <div>
            <div className="text-[11px] text-zinc-500 font-mono">Implied Valuation</div>
            <div className="text-lg font-mono font-bold text-zinc-100 tabular-nums mt-0.5">
              ${impliedValuation.toLocaleString()}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
              ${pitch.askAmount.toLocaleString()} for {pitch.askEquity}%
            </div>
          </div>

          <div>
            <div className="text-[11px] text-zinc-500 font-mono">Revenue Multiple</div>
            <div className="text-lg font-mono font-bold text-zinc-100 tabular-nums mt-0.5">
              {multiple}x
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
              ${pitch.annualSales.toLocaleString()} sales
            </div>
          </div>

          <div>
            <div className="text-[11px] text-zinc-500 font-mono">Gross Margin</div>
            <div className="text-lg font-mono font-bold text-zinc-100 tabular-nums mt-0.5">
              {grossMargin}%
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
              ${unitProfit} profit / unit
            </div>
          </div>

          <div>
            <div className="text-[11px] text-zinc-500 font-mono">Unit Economics</div>
            <div className="text-lg font-mono font-bold text-zinc-100 tabular-nums mt-0.5">
              ${pitch.retailPrice}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
              Cost: ${pitch.cogs} / unit
            </div>
          </div>
        </div>

        {/* Red Flags & Strengths */}
        {viability && (
          <div className="pt-4 space-y-3">
            {/* Red Flags */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
                Vulnerabilities Identified
              </div>
              <ul className="space-y-1">
                {viability.redFlags.map((flag, idx) => (
                  <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed">
                    <span className="text-zinc-600 font-mono select-none">/</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strengths */}
            <div className="pt-2 border-t border-zinc-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
                Key Value Drivers
              </div>
              <ul className="space-y-1">
                {viability.greenFlags.map((flag, idx) => (
                  <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed">
                    <span className="text-zinc-400 font-mono select-none">+</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Tank Verdict */}
      {viability?.tankVerdict && (
        <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 italic">
          <span className="text-zinc-300 not-italic font-mono uppercase mr-1">Summary:</span>
          {viability.tankVerdict}
        </div>
      )}
    </div>
  );
};
