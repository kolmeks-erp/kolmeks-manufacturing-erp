import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Cpu, Layers } from 'lucide-react';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { VisualPlaceholder } from './VisualPlaceholder';

interface HeroSectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  eyebrow = 'PRECISION MANUFACTURING',
  title = 'Precision Manufacturing. Engineered for Performance.',
  description = 'Kolmeks delivers custom contract manufacturing, high-precision CNC machining, sub-assemblies, and electric motor components engineered for international B2B requirements.',
  primaryCtaText = 'Request a Quote',
  primaryCtaLink = '/request-quote',
  secondaryCtaText = 'Explore Capabilities',
  secondaryCtaLink = '/cnc-machining',
}) => {
  return (
    <section className="relative bg-[#0B1E36] text-white py-16 sm:py-24 lg:py-28 overflow-hidden border-b border-slate-800">
      {/* Industrial Grid Pattern & Ambient Lighting */}
      <div className="absolute inset-0 industrial-grid-dark opacity-15 pointer-events-none" />
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#0F2C59] opacity-30 blur-3xl" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text & CTAs */}
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

            <div className="flex flex-wrap items-center gap-4 pt-2">
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

            {/* Positioning Micro Information Keywords */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-6 border-t border-slate-800/80 text-slate-400 font-mono text-xs">
              <div className="space-y-1">
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Precision Manufacturing
                </div>
                <div className="text-[11px] text-slate-400">Engineering Rigor</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-400" /> CNC Machining
                </div>
                <div className="text-[11px] text-slate-400">Tolerance Control</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" /> Global Supply
                </div>
                <div className="text-[11px] text-slate-400">Component Assembly</div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Blueprint Area */}
          <div className="lg:col-span-5">
            <VisualPlaceholder
              title="PRECISION MACHINING & ASSEMBLY"
              subtitle="Contract Manufacturing Operations"
              badge="STRUCTURAL VISUAL PLACEHOLDER"
            />
          </div>
        </div>
      </Container>
    </section>
  );
};
