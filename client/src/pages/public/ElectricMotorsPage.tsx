import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Card, CardContent } from '../../components/ui/Card';
import { Zap } from 'lucide-react';

export const ElectricMotorsPage: React.FC = () => {
  return (
    <div className="py-12 space-y-12">
      <Container>
        <SectionHeading
          eyebrow="Motor Engineering"
          title="Electric Motors & Component Manufacturing"
          description="High-efficiency motor stators, rotors, precision windings, and housing assemblies."
        />
        <Card variant="industrial">
          <CardContent className="p-6 space-y-4">
            <Zap className="w-8 h-8 text-industrial-700" />
            <p className="text-sm text-slate-600">
              Specialized electrical engineering production lines for stators, rotors, copper winding insertion, insulation, and high-voltage testing.
            </p>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};
