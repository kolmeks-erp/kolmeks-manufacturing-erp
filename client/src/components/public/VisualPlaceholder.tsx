import React from 'react';
import { Factory, Cpu, Layers } from 'lucide-react';

interface VisualPlaceholderProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  imageUrl?: string;
  aspectRatio?: 'video' | 'square' | 'auto';
  className?: string;
}

export const VisualPlaceholder: React.FC<VisualPlaceholderProps> = ({
  title = 'INDUSTRIAL MANUFACTURING VISUAL',
  subtitle = 'Precision Engineering & Component Assembly',
  badge = 'VISUAL PLACEHOLDER — MEDIA INTEGRATION STAGE',
  imageUrl,
  aspectRatio = 'auto',
  className = '',
}) => {
  if (imageUrl) {
    return (
      <div className={`relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg ${className}`}>
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      </div>
    );
  }

  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : 'min-h-[280px] sm:min-h-[360px]';

  return (
    <div
      className={`relative rounded-2xl bg-[#0B1E36] border border-slate-800 text-white p-8 overflow-hidden shadow-xl flex flex-col justify-between ${aspectClass} ${className}`}
    >
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 industrial-grid-dark opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#0F2C59] opacity-40 blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#0F2C59] flex items-center justify-center text-emerald-400 border border-slate-700">
            <Factory className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            KOLMEKS ENGINE
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
          TECHNICAL GRAPHIC
        </span>
      </div>

      {/* Center Visual Content */}
      <div className="relative z-10 my-6 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[#0F2C59]/80 border border-slate-700 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <Cpu className="w-7 h-7" />
        </div>
        <div>
          <h4 className="text-base sm:text-lg font-bold text-white tracking-wide">
            {title}
          </h4>
          <p className="text-xs text-slate-400 font-mono mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Footer Visual Indicator */}
      <div className="relative z-10 border-t border-slate-800/80 pt-3 text-center">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
          * {badge}
        </span>
      </div>
    </div>
  );
};
