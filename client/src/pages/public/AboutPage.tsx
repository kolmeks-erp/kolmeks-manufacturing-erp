import React from 'react';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { PageHeader } from '../../components/public/PageHeader';
import { CTASection } from '../../components/public/CTASection';
import { Factory, ShieldCheck, Cpu, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <SEO
        title="About Kolmeks | Manufacturing & Engineering Excellence"
        description="Learn about Kolmeks contract manufacturing, precision engineering values, ISO quality standards, and OEM component partnerships."
      />

      <PageHeader
        eyebrow="ABOUT KOLMEKS"
        title="Engineering Excellence & Manufacturing Reliability"
        description="A trusted international contract manufacturing partner specializing in precision CNC component fabrication, sub-assemblies, and motor components."
        breadcrumbs={[{ label: 'About Us' }]}
      />

      <section className="py-8 bg-white">
        <Container className="max-w-4xl space-y-12">
          {/* Mission & Overview */}
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Our Manufacturing Commitment
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Kolmeks is dedicated to delivering engineering precision and contract manufacturing excellence. We partner closely with original equipment manufacturers (OEMs) across Europe and international markets to provide component machining, electro-mechanical sub-assemblies, and specialized motor parts.
            </p>
          </div>

          {/* Core Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="w-10 h-10 rounded bg-[#0B1E36] text-white flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Engineering Rigor</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Applying rigorous Design for Manufacturability (DFM) principles to optimize production efficiency and component durability.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="w-10 h-10 rounded bg-[#0B1E36] text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Quality Consistency</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Adhering to ISO-certified quality management protocols, CMM coordinate measuring, and complete raw material traceability.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="w-10 h-10 rounded bg-[#0B1E36] text-white flex items-center justify-center">
                <Factory className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Turnkey Capacity</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Single-source responsibility from material procurement to CNC machining, testing, sub-assembly, and packaging.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="w-10 h-10 rounded bg-[#0B1E36] text-white flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Customer Collaboration</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Transparent communication, dedicated technical account management, and synchronized ERP order tracking.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <CTASection />
    </div>
  );
};
