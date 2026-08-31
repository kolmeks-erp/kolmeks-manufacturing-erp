import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import { VisualPlaceholder } from './VisualPlaceholder';
import { QUALITY_HIGHLIGHTS_DATA } from '../../data/homeContent';

export const QualitySection: React.FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-[#071220] border-b border-slate-200 dark:border-slate-800 transition-colors">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text & Highlights */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-xs font-bold font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> QUALITY
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Precision You Can Measure.
            </h2>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Quality control and consistency are integrated into every stage of component fabrication. From incoming raw material verification to coordinate measuring machine (CMM) dimensional audits, manufacturing precision is prioritized.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {QUALITY_HIGHLIGHTS_DATA.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-[#0F2647] border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link to="/quality">
                <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Quality
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Technical Quality Graphic */}
          <div className="lg:col-span-6">
            <VisualPlaceholder
              title="QUALITY INSPECTION & MEASUREMENT"
              subtitle="CMM 3D Coordinate & Surface Profiling"
              badge="INSPECTION VISUAL PLACEHOLDER"
            />
          </div>
        </div>
      </Container>
    </section>
  );
};
