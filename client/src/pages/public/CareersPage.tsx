import React from 'react';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { PageHeader } from '../../components/public/PageHeader';
import { CTASection } from '../../components/public/CTASection';

export const CareersPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <SEO
        title="Careers | Join Kolmeks Manufacturing Team"
        description="Explore engineering, CNC programming, quality control, and manufacturing management career opportunities at Kolmeks."
      />

      <PageHeader
        eyebrow="JOIN OUR TEAM"
        title="Careers at Kolmeks Manufacturing"
        description="Build a career in precision engineering, CNC machining technology, and industrial operations."
        breadcrumbs={[{ label: 'Careers' }]}
      />

      <section className="py-8 bg-white">
        <Container className="max-w-4xl space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Engineering & Operations Opportunities</h2>
          <p className="text-base text-slate-600 leading-relaxed">
            We are always seeking talented CNC programmers, mechanical engineers, quality assurance specialists, and production managers to join our manufacturing teams.
          </p>
        </Container>
      </section>

      <CTASection />
    </div>
  );
};
