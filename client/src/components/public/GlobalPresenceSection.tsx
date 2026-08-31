import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, MapPin } from 'lucide-react';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { LocationCard } from './LocationCard';
import { GLOBAL_REGIONS_DATA } from '../../data/homeContent';

export const GlobalPresenceSection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <Container>
        <SectionHeading
          eyebrow="GLOBAL REACH"
          title="Manufacturing Connected Across Markets"
          description="Connecting international OEM clients with reliable manufacturing delivery and supply chain coordination."
          centered
        />

        {/* World Map Visual Foundation */}
        <div className="mb-12 bg-[#0B1E36] rounded-2xl p-8 border border-slate-800 text-white relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 industrial-grid-dark opacity-15 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#0F2C59] flex items-center justify-center text-emerald-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Global Manufacturing Network</h3>
                <p className="text-xs text-slate-400 font-mono">International OEM Supply Coordination</p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 bg-slate-800 text-amber-400 rounded border border-slate-700">
              * LOCATION DATA TO BE VERIFIED
            </span>
          </div>

          {/* Abstract SVG World Map Schematic */}
          <div className="relative z-10 h-48 sm:h-64 flex items-center justify-center border border-slate-800/80 rounded-xl bg-[#071220]/60 p-4">
            <svg
              className="w-full h-full text-slate-700/40"
              fill="currentColor"
              viewBox="0 0 1000 500"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Simplified World Continents SVG Paths */}
              <path d="M150,150 Q200,100 300,140 Q350,220 250,280 Q180,260 150,150 Z" />
              <path d="M450,120 Q550,80 650,130 Q700,200 600,260 Q500,250 450,120 Z" />
              <path d="M750,180 Q850,150 900,220 Q880,320 800,300 Q740,240 750,180 Z" />
            </svg>

            {/* Pulsing Regional Indicators */}
            <div className="absolute top-1/3 left-1/4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[11px] font-mono font-bold text-white bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                Europe Hub (Placeholder)
              </span>
            </div>

            <div className="absolute bottom-1/3 right-1/3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-400 animate-ping"></span>
              <span className="text-[11px] font-mono font-bold text-white bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                Logistics Hub (Placeholder)
              </span>
            </div>
          </div>
        </div>

        {/* Regional Location Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {GLOBAL_REGIONS_DATA.map((loc, idx) => (
            <LocationCard
              key={idx}
              region={loc.region}
              capability={loc.capability}
              status={loc.status}
              isPlaceholder={loc.isPlaceholder}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};
