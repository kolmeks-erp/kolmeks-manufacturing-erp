import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Factory, ShieldCheck, Cpu, Layers } from 'lucide-react';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface HeroSectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  eyebrow = 'PRECISION MANUFACTURING',
  title = 'Precision Manufacturing. Engineered for Performance.',
  description = 'Kolmeks delivers custom contract manufacturing, high-precision CNC machining, sub-assemblies, and electric motor components backed by ISO-certified quality processes.',
  primaryCtaText = 'Request a Quote',
  primaryCtaLink = '/request-quote',
  secondaryCtaText = 'Explore Capabilities',
  secondaryCtaLink = '/cnc-machining',
}) => {
  return (
    <section className="relative bg-[#0B1E36] text-white py-20 lg:py-28 overflow-hidden border-b border-slate-800">
      {/* Industrial Grid Pattern & Ambient Lighting */}
      <div className="absolute inset-0 industrial-grid-dark opacity-15 pointer-events-none" />
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#0F2C59] opacity-30 blur-3xl" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Text Content */}
          <div className="lg:col-span-7 space-y-6">
            {eyebrow && (
              <Badge variant="industrial" className="bg-[#0F2C59] border-slate-700 text-emerald-400 font-mono">
                ★ {eyebrow}
              </Badge>
            )}

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              {title}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              {description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              {primaryCtaText && primaryCtaLink && (
                <Link to={primaryCtaLink}>
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    {primaryCtaText}
                  </Button>
                </Link>
              )}
              {secondaryCtaText && secondaryCtaLink && (
                <Link to={secondaryCtaLink}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-slate-700 bg-[#0F2C59] text-slate-200 hover:bg-slate-800 hover:text-white"
                  >
                    {secondaryCtaText}
                  </Button>
                </Link>
              )}
            </div>

            {/* Quality Standard Highlights */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-6 border-t border-slate-800/80 text-slate-400 font-mono text-xs">
              <div className="space-y-1">
                <div className="text-lg font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> ISO Certified
                </div>
                <div className="text-[11px]">Quality Management</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-white flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-400" /> Micron Tolerances
                </div>
                <div className="text-[11px]">CMM Verified</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" /> Turnkey Production
                </div>
                <div className="text-[11px]">Component Assembly</div>
              </div>
            </div>
          </div>

          {/* Right Column Industrial Graphic Panel */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-[#0F2C59]/60 border border-slate-700/80 p-8 shadow-2xl overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded bg-[#0B1E36] flex items-center justify-center text-emerald-400 border border-slate-700">
                      <Factory className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Industrial Operations</div>
                      <div className="text-xs text-slate-400 font-mono">Contract Engineering</div>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>

                <div className="space-y-3 font-mono text-xs text-slate-300">
                  <div className="p-3 bg-[#0B1E36]/90 rounded border border-slate-700/60 flex items-center justify-between">
                    <span>CNC Precision Milling</span>
                    <span className="text-emerald-400 font-bold">±0.005mm</span>
                  </div>
                  <div className="p-3 bg-[#0B1E36]/90 rounded border border-slate-700/60 flex items-center justify-between">
                    <span>Stator & Rotor Winding</span>
                    <span className="text-emerald-400 font-bold">ISO 14001</span>
                  </div>
                  <div className="p-3 bg-[#0B1E36]/90 rounded border border-slate-700/60 flex items-center justify-between">
                    <span>Component Assembly</span>
                    <span className="text-emerald-400 font-bold">100% Tested</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 text-center border-t border-slate-700/60">
                  Global Contract Manufacturing & Component Solutions
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
