import React from 'react';
import { Container } from '../ui/Container';
import { POSITIONING_STRIP_ITEMS } from '../../data/homeContent';

export const PositioningStrip: React.FC = () => {
  return (
    <div className="bg-[#071220] border-b border-slate-800 text-slate-300 py-4 shadow-sm">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4 md:gap-8">
          {POSITIONING_STRIP_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-2.5 font-mono text-xs sm:text-sm font-semibold text-slate-200">
                <div className="w-6 h-6 rounded bg-[#0F2C59] text-emerald-400 flex items-center justify-center border border-slate-700 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
};
