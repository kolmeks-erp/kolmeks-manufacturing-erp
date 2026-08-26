import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Award, ArrowRight } from 'lucide-react';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';

export const QualitySection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> QUALITY ASSURANCE
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Precision You Can Measure. Quality You Can Trust.
            </h2>

            <p className="text-base text-slate-600 leading-relaxed">
              Quality is embedded into every stage of our production environment. From incoming raw material verification to coordinate measuring machine (CMM) inspection, Kolmeks adheres to rigorous engineering standards.
            </p>

            <div className="space-y-3 font-semibold text-sm text-slate-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Zero-Defect Quality Philosophy with strict Process Quality Control (PQC).</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Complete Material Certification & Traceability for high-reliability components.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>3D Coordinate Measuring Machines (CMM) & optical surface profiling.</span>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/quality">
                <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Quality Standards
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column Quality Graphic */}
          <div className="lg:col-span-6">
            <div className="bg-[#0B1E36] text-white p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#0F2C59] flex items-center justify-center text-emerald-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Quality Inspection Protocol</h3>
                    <p className="text-xs text-slate-400 font-mono">Standard Operating Procedure</p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/40">
                  VERIFIED
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-[#0F2C59]/60 rounded border border-slate-700/60 flex justify-between items-center">
                  <span>Raw Material Spectrometry</span>
                  <span className="text-emerald-400">Pass (100%)</span>
                </div>
                <div className="p-3 bg-[#0F2C59]/60 rounded border border-slate-700/60 flex justify-between items-center">
                  <span>CNC Dimension Tolerance</span>
                  <span className="text-emerald-400">±0.005mm</span>
                </div>
                <div className="p-3 bg-[#0F2C59]/60 rounded border border-slate-700/60 flex justify-between items-center">
                  <span>CMM Surface Scan</span>
                  <span className="text-emerald-400">Approved</span>
                </div>
                <div className="p-3 bg-[#0F2C59]/60 rounded border border-slate-700/60 flex justify-between items-center">
                  <span>Pressure & Leak Test</span>
                  <span className="text-emerald-400">Tested</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center font-mono">
                System Integrated with Internal ERP Quality Modules
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
