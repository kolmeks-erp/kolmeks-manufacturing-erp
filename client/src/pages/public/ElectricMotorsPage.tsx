import React from 'react';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { PageHeader } from '../../components/public/PageHeader';
import { CTASection } from '../../components/public/CTASection';

export const ElectricMotorsPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <SEO
        title="Electric Motor Components | Stators, Rotors & Windings"
        description="Specialized electric motor component manufacturing, stator laminations, copper coil winding, and electrical testing."
      />

      <PageHeader
        eyebrow="CAPABILITIES"
        title="Electric Motor Components & Windings"
        description="Specialized component production for electric motors, stators, rotors, precision copper windings, and electrical testing."
        breadcrumbs={[
          { label: 'Capabilities', href: '/electric-motors' },
          { label: 'Electric Motors' },
        ]}
      />

      <section className="py-8 bg-white">
        <Container className="max-w-4xl space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Precision Motor Components & Electrical Engineering
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            With decades of domain expertise in electric motor engineering, Kolmeks manufactures stator and rotor stacks, copper windings, motor housings, and shaft assemblies engineered for optimal efficiency and thermal performance.
          </p>
        </Container>
      </section>

      <CTASection />
    </div>
  );
};
