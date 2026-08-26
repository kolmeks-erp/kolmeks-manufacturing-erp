import React from 'react';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { PageHeader } from '../../components/public/PageHeader';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { ArrowRight, ShieldCheck, FileCheck2 } from 'lucide-react';

export const RequestQuotePage: React.FC = () => {
  return (
    <div className="space-y-12">
      <SEO
        title="Request a Quote | Kolmeks Manufacturing RFQ"
        description="Submit your technical drawings, component specifications, and batch volume requirements to Kolmeks for a production quotation."
      />

      <PageHeader
        eyebrow="RFQ SUBMISSION"
        title="Request a Production Quote (RFQ)"
        description="Submit your component specifications, material requirements, and estimated annual batch volume for engineering evaluation."
        breadcrumbs={[{ label: 'Request a Quote' }]}
      />

      <section className="py-8 bg-white">
        <Container className="max-w-4xl">
          <div className="bg-slate-50 p-8 sm:p-10 rounded-2xl border border-slate-200 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <FileCheck2 className="w-6 h-6 text-blue-600 shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">RFQ Technical Specifications</h2>
                <p className="text-xs text-slate-500 font-mono">Confidential Technical Review</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Contact Name" placeholder="Jane Smith" required />
                <Input label="Work Email" type="email" placeholder="jane@oem-manufacturer.com" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Company Name" placeholder="OEM Dynamics Ltd." required />
                <Input label="Phone Number" placeholder="+358 40 123 4567" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Primary Capability Required"
                  options={[
                    { value: 'cnc', label: 'CNC Machining (Milling / Turning)' },
                    { value: 'contract', label: 'Turnkey Contract Manufacturing' },
                    { value: 'assembly', label: 'Electro-Mechanical Sub-Assembly' },
                    { value: 'motors', label: 'Electric Motor Components & Windings' },
                    { value: 'supply', label: 'Supply Chain & Sourcing' },
                  ]}
                  required
                />
                <Input label="Estimated Batch Volume (pcs/year)" placeholder="e.g. 5,000 pcs/year" required />
              </div>

              <Textarea
                label="Component Specifications & Tolerance Notes"
                placeholder="Describe material type (e.g. EN-GJL-250, Aluminum 6061-T6), key dimensions, surface finishing, and quality tolerance standards..."
                rows={4}
                required
              />

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Confidentiality Guarantee:</span> All submitted drawings, CAD files, and technical specifications are handled strictly under non-disclosure confidentiality standards.
                </div>
              </div>

              <div className="pt-2">
                <Button variant="primary" size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Submit RFQ for Engineering Review
                </Button>
              </div>
            </form>
          </div>
        </Container>
      </section>
    </div>
  );
};
