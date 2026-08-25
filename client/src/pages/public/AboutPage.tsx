import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Card, CardContent } from '../../components/ui/Card';
import { Factory, ShieldCheck, Globe, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-12 space-y-12">
      <Container>
        <SectionHeading
          eyebrow="Company Overview"
          title="About Kolmeks Manufacturing"
          description="A trusted international engineering partner in contract manufacturing, precision machining, and electric component solutions."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
            <p>
              Kolmeks is a long-standing manufacturing group providing custom engineering, precision CNC machining, and motor component solutions to global industrial clients.
            </p>
            <p>
              Our production facilities combine advanced automation, CMM coordinate measuring quality controls, and a fully integrated ERP platform to maintain zero-defect standards across complex supply chains.
            </p>
            <div className="p-4 bg-industrial-50 rounded-lg border border-industrial-200 text-xs font-mono text-industrial-900">
              Note: Detailed company statistics, facility sizes, and certifications will be verified and updated in future project stages.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card variant="industrial">
              <CardContent className="p-5 space-y-2">
                <Factory className="w-6 h-6 text-industrial-700" />
                <h4 className="font-bold text-slate-900 text-sm">Contract Manufacturing</h4>
                <p className="text-xs text-slate-500">End-to-end component production and sub-assemblies.</p>
              </CardContent>
            </Card>
            <Card variant="industrial">
              <CardContent className="p-5 space-y-2">
                <ShieldCheck className="w-6 h-6 text-industrial-700" />
                <h4 className="font-bold text-slate-900 text-sm">Quality Assurance</h4>
                <p className="text-xs text-slate-500">CMM laser verification & ISO standards compliance.</p>
              </CardContent>
            </Card>
            <Card variant="industrial">
              <CardContent className="p-5 space-y-2">
                <Globe className="w-6 h-6 text-industrial-700" />
                <h4 className="font-bold text-slate-900 text-sm">Global Reach</h4>
                <p className="text-xs text-slate-500">Logistics solutions serving international OEM clients.</p>
              </CardContent>
            </Card>
            <Card variant="industrial">
              <CardContent className="p-5 space-y-2">
                <Users className="w-6 h-6 text-industrial-700" />
                <h4 className="font-bold text-slate-900 text-sm">Engineering Team</h4>
                <p className="text-xs text-slate-500">Experienced manufacturing engineers and toolmakers.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};
