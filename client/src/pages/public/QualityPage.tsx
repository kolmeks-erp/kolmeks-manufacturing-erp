import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { ShieldCheck } from 'lucide-react';

export const QualityPage: React.FC = () => {
  return (
    <div className="py-12">
      <Container>
        <SectionHeading
          eyebrow="Zero Defect Quality"
          title="Quality Assurance & CMM Measurements"
          description="ISO 9001:2015 certified quality systems, CMM 3D coordinate inspection, and material traceabilities."
        />
        <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
          <ShieldCheck className="w-8 h-8 text-industrial-700" />
          <p className="text-sm text-slate-600">
            Every manufactured batch is measured against 3D CAD models using air-conditioned CMM cells with digital measurement reports archived in our ERP system.
          </p>
        </div>
      </Container>
    </div>
  );
};
