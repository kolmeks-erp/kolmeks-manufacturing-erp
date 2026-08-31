import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import { VisualPlaceholder } from './VisualPlaceholder';
import aboutHeroImg from '../../assets/images/kolmeks-about-hero.webp';

export const AboutSection: React.FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-[#071220] border-b border-slate-200 dark:border-slate-800 transition-colors">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual Side */}
          <div className="lg:col-span-6 relative">
            <VisualPlaceholder
              title="KOLMEKS ENGINEERING TEAM"
              subtitle="Precision Machining & Technical Blueprint Review"
              badge="ENGINEERING OPERATIONS"
              imageUrl={aboutHeroImg}
            />
            {/* Technical Blueprint Accent Lines */}
            <div className="hidden sm:block absolute -bottom-4 -right-4 bg-slate-900 dark:bg-[#0F2647] text-white p-3 rounded-lg border border-slate-700 dark:border-slate-800 shadow-lg font-mono text-[11px]">
              <span className="text-emerald-400 font-bold">SPEC:</span> ISO Compliant Component Assembly
            </div>
          </div>

          {/* Text Content Side */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-bold font-mono border border-blue-200 dark:border-blue-800/60">
              ABOUT KOLMEKS
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Engineering Precision Into Every Component.
            </h2>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Kolmeks is an international contract manufacturing partner dedicated to precision component fabrication, high-speed CNC machining, electro-mechanical sub-assemblies, and electric motor solutions.
            </p>

            <div className="space-y-3 text-sm text-slate-800 dark:text-slate-200 font-semibold pt-1">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>Dedicated DFM engineering & prototyping support for OEM partners.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>High-precision multi-axis CNC milling, turning, and automatic lathe machining.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>ISO-aligned Quality Control & 3D CMM dimensional inspection protocols.</span>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/about">
                <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Discover Kolmeks
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
