import React from 'react';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { PageHeader } from '../../components/public/PageHeader';
import { CTASection } from '../../components/public/CTASection';
import { ProcessSection } from '../../components/public/ProcessSection';
import { Factory, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ContractManufacturingPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <SEO
        title="Contract Manufacturing | Kolmeks Production Solutions"
        description="Turnkey contract manufacturing solutions for OEM clients, including component machining, dedicated lines, and sub-assembly."
      />

      <PageHeader
        eyebrow="CAPABILITIES"
        title="Contract Manufacturing & OEM Production"
        description="Turnkey contract manufacturing solutions designed for high-volume component production and electro-mechanical assembly."
        breadcrumbs={[
          { label: 'Capabilities', href: '/contract-manufacturing' },
          { label: 'Contract Manufacturing' },
        ]}
      />

      <section className="py-8 bg-white">
        <Container className="max-w-4xl space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Full-Scope Component Production & Sub-Assembly
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Kolmeks offers contract manufacturing services for original equipment manufacturers seeking a reliable, quality-focused manufacturing partner. We manage the entire manufacturing lifecycle, from material sourcing to CNC machining, quality testing, and logistics delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" /> Dedicated Production Lines
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tailored manufacturing lines configured to match specific client volume and technical requirements.
              </p>
            </div>
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> Integrated Quality Controls
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                In-line measurement, Coordinate Measuring Machine (CMM) audits, and zero-defect quality protocols.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <ProcessSection />

      <CTASection />
    </div>
  );
};
