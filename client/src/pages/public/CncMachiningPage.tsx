import React from 'react';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { PageHeader } from '../../components/public/PageHeader';
import { CTASection } from '../../components/public/CTASection';
import { Cpu, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const CncMachiningPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <SEO
        title="CNC Machining | High Precision Milling & Turning"
        description="High-precision 5-axis CNC milling, automatic turning, and tight tolerance component fabrication for industrial machinery."
      />

      <PageHeader
        eyebrow="PRECISION FABRICATION"
        title="High-Precision CNC Milling & Turning"
        description="Multi-axis CNC machining capabilities delivering sub-micron dimensional accuracy for complex industrial metal components."
        breadcrumbs={[
          { label: 'Capabilities', href: '/cnc-machining' },
          { label: 'CNC Machining' },
        ]}
      />

      <section className="py-8 bg-white">
        <Container className="max-w-4xl space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Advanced Multi-Axis CNC Machine Capabilities
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Our CNC machining center utilizes modern 5-axis milling, precision lathes, and automated turning cells to produce complex metal components engineered from cast iron, aluminum alloys, stainless steel, and specialty copper.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="text-sm font-bold text-[#0B1E36]">5-Axis Milling</div>
              <div className="text-xs text-slate-600">Complex geometry machining with reduced setups and tight tolerance repeatability.</div>
            </div>
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="text-sm font-bold text-[#0B1E36]">Automatic Turning</div>
              <div className="text-xs text-slate-600">High-speed cylindrical turning for shafts, rotors, housings, and precision fittings.</div>
            </div>
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="text-sm font-bold text-[#0B1E36]">Surface Finishing</div>
              <div className="text-xs text-slate-600">Grinding, deburring, and surface roughness compliance per technical specifications.</div>
            </div>
          </div>
        </Container>
      </section>

      <CTASection />
    </div>
  );
};
