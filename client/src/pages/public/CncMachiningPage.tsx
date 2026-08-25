import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { Cpu, Check } from 'lucide-react';

export const CncMachiningPage: React.FC = () => {
  return (
    <div className="py-12 space-y-12">
      <Container>
        <SectionHeading
          eyebrow="Precision Engineering"
          title="CNC Milling & Turning Operations"
          description="5-Axis CNC machining centers delivering extreme tolerances for critical industrial components."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card variant="industrial">
            <CardContent className="p-6 space-y-4">
              <Cpu className="w-8 h-8 text-industrial-700" />
              <h3 className="text-lg font-bold text-slate-900">CNC Machining Capabilities</h3>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Multi-axis CNC Milling (3, 4, and 5-axis)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> CNC Turning & Automatic Lathe Centers</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Cast iron, stainless steel, aluminum & brass machining</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Integrated CMM measuring cell connection</li>
              </ul>
            </CardContent>
          </Card>

          <div className="bg-industrial-950 text-white rounded-lg p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-base font-bold text-white mb-2">High Precision Tolerances</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our CNC machine hub operates under strict thermal stabilization protocols, linked directly into our Kolmeks ERP telemetry.
              </p>
            </div>
            <div className="pt-4">
              <Link to="/request-quote">
                <Button variant="primary" className="w-full">Get CNC Machining Quotation</Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
