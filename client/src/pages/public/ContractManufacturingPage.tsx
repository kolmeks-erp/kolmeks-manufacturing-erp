import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { Factory, CheckCircle2, ArrowRight } from 'lucide-react';

export const ContractManufacturingPage: React.FC = () => {
  return (
    <div className="py-12 space-y-12">
      <Container>
        <SectionHeading
          eyebrow="Capability"
          title="Contract Manufacturing Services"
          description="Turnkey component manufacturing, sub-assemblies, and dedicated production lines."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default">
            <CardContent className="p-6 space-y-3">
              <Factory className="w-8 h-8 text-industrial-700" />
              <h3 className="text-base font-bold text-slate-900">Custom Metal Fabrication</h3>
              <p className="text-xs text-slate-600">High-capacity production tailored to exact OEM drawings and specifications.</p>
            </CardContent>
          </Card>
          <Card variant="default">
            <CardContent className="p-6 space-y-3">
              <CheckCircle2 className="w-8 h-8 text-industrial-700" />
              <h3 className="text-base font-bold text-slate-900">Full Testing & Inspection</h3>
              <p className="text-xs text-slate-600">End-of-line testing, pressure verification, and CMM dimension reports.</p>
            </CardContent>
          </Card>
          <Card variant="default">
            <CardContent className="p-6 space-y-3">
              <ArrowRight className="w-8 h-8 text-industrial-700" />
              <h3 className="text-base font-bold text-slate-900">Scalable Production Lines</h3>
              <p className="text-xs text-slate-600">Flexible batch sizes from prototypes to high-volume recurring orders.</p>
            </CardContent>
          </Card>
        </div>

        <div className="pt-6 flex justify-center">
          <Link to="/request-quote">
            <Button variant="primary" size="lg">Request Contract Manufacturing Quote</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
};
