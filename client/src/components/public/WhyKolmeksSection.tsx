import React from 'react';
import { Container } from '../ui/Container';
import { Badge } from '../ui/Badge';
import { WHY_KOLMEKS_PRINCIPLES } from '../../data/homeContent';

export const WhyKolmeksSection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
      <div className="absolute inset-0 industrial-grid-dark opacity-10 pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column Editorial Heading */}
          <div className="lg:col-span-5 space-y-6">
            <Badge variant="industrial" className="bg-[#0F2C59] border-slate-700 text-emerald-400 font-mono">
              WHY KOLMEKS
            </Badge>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              A Manufacturing Partner Built Around Precision.
            </h2>

            <p className="text-base text-slate-300 leading-relaxed">
              We focus on long-term B2B partnerships with equipment manufacturers who demand quality, engineering transparency, and reliable component supply.
            </p>

            <div className="p-6 rounded-xl bg-[#0B1E36] border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
              <div className="text-white font-bold text-sm">B2B Commitment</div>
              <p>Transparent communication, strict NDA confidentiality, and direct engineering support throughout the production lifecycle.</p>
            </div>
          </div>

          {/* Right Column Numbered Principles */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {WHY_KOLMEKS_PRINCIPLES.map((principle) => (
              <div
                key={principle.number}
                className="bg-[#0B1E36] p-6 rounded-xl border border-slate-800 space-y-3 hover:border-emerald-500/50 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      {principle.number}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                      PRINCIPLE
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {principle.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
