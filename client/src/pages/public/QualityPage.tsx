import React from 'react';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { PageHeader } from '../../components/public/PageHeader';
import { CTASection } from '../../components/public/CTASection';
import { QualitySection } from '../../components/public/QualitySection';

export const QualityPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <SEO
        title="Quality Standards | ISO Management & CMM Inspection"
        description="ISO-aligned quality management systems, 3D CMM inspection, surface roughness scanning, and zero-defect quality protocols."
      />

      <PageHeader
        eyebrow="QUALITY & COMPLIANCE"
        title="Quality Assurance & CMM Measurement"
        description="Rigorous quality management system, coordinate measuring machines (CMM), raw material certifications, and traceability."
        breadcrumbs={[{ label: 'Quality Standards' }]}
      />

      <QualitySection />

      <CTASection />
    </div>
  );
};
