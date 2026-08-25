import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Card, CardContent } from '../../components/ui/Card';
import { Boxes } from 'lucide-react';

export const AssemblyPage: React.FC = () => {
  return (
    <div className="py-12 space-y-12">
      <Container>
        <SectionHeading
          eyebrow="Integration"
          title="Component & Sub-Assembly Services"
          description="Modular assembly lines, leak testing, electrical wiring, and final packaging."
        />
        <Card variant="default">
          <CardContent className="p-6 space-y-4">
            <Boxes className="w-8 h-8 text-industrial-700" />
            <p className="text-sm text-slate-600">
              Kolmeks provides comprehensive assembly services allowing industrial customers to streamline their supply chain by receiving pre-tested complete assemblies.
            </p>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};
