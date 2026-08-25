import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { FileUp, ShieldCheck } from 'lucide-react';

export const RequestQuotePage: React.FC = () => {
  return (
    <div className="py-12">
      <Container size="lg">
        <SectionHeading
          eyebrow="RFQ Portal"
          title="Request a Manufacturing Quote"
          description="Submit your component technical drawings, estimated annual volumes, and manufacturing requirements."
        />

        <Card variant="industrial">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-3 p-4 bg-industrial-50 rounded-md text-xs text-industrial-900 border border-industrial-200">
              <ShieldCheck className="w-5 h-5 text-industrial-700 shrink-0" />
              <span>
                All submitted RFQs and engineering drawings are governed by strict confidentiality agreements and processed directly into our internal Kolmeks ERP database.
              </span>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Contact Name" placeholder="Jane Smith" />
                <Input label="Company Name" placeholder="Industrial OEM Ltd" />
                <Input label="Email Address" type="email" placeholder="j.smith@oem.com" />
                <Input label="Phone Number" placeholder="+1 (555) 000-0000" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Primary Manufacturing Service"
                  options={[
                    { value: 'contract-manufacturing', label: 'Turnkey Contract Manufacturing' },
                    { value: 'cnc-machining', label: 'Precision CNC Machining' },
                    { value: 'component-assembly', label: 'Component Assembly & Testing' },
                    { value: 'electric-motors', label: 'Electric Motors & Windings' },
                    { value: 'supply-chain', label: 'Supply Chain & Sourcing' },
                  ]}
                />
                <Input label="Estimated Annual Volume (Units)" placeholder="e.g. 5,000 units/year" />
              </div>

              <Textarea
                label="Component Specifications & Requirements"
                placeholder="Detail material grade (e.g. Stainless 316, Cast Iron), surface treatment, critical tolerances, or required delivery schedules..."
              />

              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50 space-y-2">
                <FileUp className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs font-semibold text-slate-700">Attach Technical Drawings (STEP, IGES, PDF)</div>
                <div className="text-[10px] text-slate-500">Cloudinary attachment uploads will be integrated in future prompts.</div>
              </div>

              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Submit RFQ Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};
