import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import { VisualPlaceholder } from './VisualPlaceholder';

export const AboutSection: React.FC = () => {
  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual Side */}
          <div className="lg:col-span-6 relative">
            <VisualPlaceholder
              title="KOLMEKS MANUFACTURING HUB"
              subtitle="Precision Machining & Component Assembly"
              badge="VERIFIED STRUCTURAL PLACEHOLDER"
            />
            {/* Technical Blueprint Accent Lines */}
            <div className="hidden sm:block absolute -bottom-4 -right-4 bg-slate-900 text-white p-3 rounded-lg border border-slate-700 shadow-lg font-mono text-[11px]">
              <span className="text-emerald-400 font-bold">SPEC:</span> ISO Compliant Component Assembly
            </div>
          </div>

          {/* Text Content Side */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold font-mono">
              ABOUT KOLMEKS
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Engineering Precision Into Every Component.
            </h2>

            <p className="text-base text-slate-600 leading-relaxed">
              Kolmeks is an international contract manufacturing partner dedicated to precision component fabrication, high-speed CNC machining, electro-mechanical sub-assemblies, and electric motor solutions.
            </p>

            <div className="space-y-3 text-sm text-slate-800 font-semibold pt-1">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span>Dedicated DFM engineering & prototyping support for OEM partners.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span>High-precision multi-axis CNC milling, turning, and automatic lathe machining.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
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
