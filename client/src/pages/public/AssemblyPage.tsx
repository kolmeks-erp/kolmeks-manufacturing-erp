import React from 'react';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { PageHeader } from '../../components/public/PageHeader';
import { CTASection } from '../../components/public/CTASection';

export const AssemblyPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <SEO
        title="Component Assembly | Electro-Mechanical Sub-Assemblies"
        description="Full electro-mechanical component sub-assemblies, pressure testing, and final quality validation."
      />

      <PageHeader
        eyebrow="CAPABILITIES"
        title="Component & Electro-Mechanical Sub-Assembly"
        description="Comprehensive sub-assembly services, pressure testing, and functional component testing."
        breadcrumbs={[
          { label: 'Capabilities', href: '/assembly' },
          { label: 'Component Assembly' },
        ]}
      />

      <section className="py-8 bg-white">
        <Container className="max-w-4xl space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Integrated Assembly & Testing Protocols
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Kolmeks provides sub-assembly services for complex mechanical, hydraulic, and electrical components. Our assembly team integrates precision machined parts, bearings, seals, stators, and fasteners under strict standard operating procedures (SOPs).
          </p>
        </Container>
      </section>

      <CTASection />
    </div>
  );
};
