import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Briefcase } from 'lucide-react';

export const CareersPage: React.FC = () => {
  return (
    <div className="py-12">
      <Container>
        <SectionHeading
          eyebrow="Join Our Team"
          title="Careers at Kolmeks"
          description="Build your career in advanced manufacturing, CNC programming, and industrial engineering."
        />
        <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
          <Briefcase className="w-8 h-8 text-industrial-700" />
          <p className="text-sm text-slate-600">
            We are always seeking talented CNC machinists, quality inspectors, toolmakers, and ERP software specialists.
          </p>
        </div>
      </Container>
    </div>
  );
};
