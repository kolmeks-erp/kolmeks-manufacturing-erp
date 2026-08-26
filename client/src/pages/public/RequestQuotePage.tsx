import React, { useState } from 'react';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { HeroSection } from '../../components/public/HeroSection';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Card, CardContent } from '../../components/ui/Card';
import {
  FileText,
  Send,
  CheckCircle2,
  UploadCloud,
  ShieldCheck,
  Clock,
  HelpCircle,
  Factory,
} from 'lucide-react';

export const RequestQuotePage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [rfqData, setRfqData] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: '',
    capability: 'cnc-machining',
    material: 'aluminum',
    quantity: '100-500',
    targetTimeline: 'normal',
    projectSummary: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const steps = [
    { step: '01', title: 'RFQ Submission', desc: 'Submit drawings, 3D CAD files, and batch volume details.' },
    { step: '02', title: 'DFM Technical Review', desc: 'Our engineers review manufacturability, tolerances, and tooling setup.' },
    { step: '03', title: 'Formal Quotation', desc: 'Receive detailed unit pricing, tooling cost, and production lead times.' },
    { step: '04', title: 'Production Kickoff', desc: 'Sample prototyping, quality plan sign-off, and volume manufacturing.' },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | Request a Quote"
        description="Submit your manufacturing drawings and specifications for a technical review and formal RFQ quotation."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="REQUEST A QUOTE (RFQ)"
        title="Submit Component Specifications for Technical Quotation."
        description="Submit your engineering drawings, material specifications, and estimated quantities. Our manufacturing engineers will conduct a DFM review and prepare a detailed quotation."
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs items={[{ label: 'Request a Quote' }]} />
      </Container>

      {/* RFQ Form & Guidance Section */}
      <section className="py-4">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: What Happens Next & Guarantees */}
            <div className="lg:col-span-5 space-y-8">
              <SectionHeading
                eyebrow="THE RFQ PROCESS"
                title="What Happens After You Submit?"
                description="We handle your technical drawings with strict confidentiality and engineering rigor."
              />

              <div className="space-y-4">
                {steps.map((s, idx) => (
                  <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-1 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-600">
                      <span>STEP {s.step}</span> — <span className="text-slate-900 font-sans font-bold text-sm">{s.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 pl-1">{s.desc}</p>
                  </div>
                ))}
              </div>

              <Card variant="industrial" className="bg-[#0B1E36] text-white border-slate-800">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> CONFIDENTIALITY GUARANTEE
                  </div>
                  <h3 className="text-lg font-bold text-white">Non-Disclosure & Data Security</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    All submitted engineering files, 2D/3D CAD models, and proprietary project details are kept strictly confidential and protected under standard NDA protocols.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Interactive RFQ Submission Form */}
            <div className="lg:col-span-7">
              <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">RFQ Submission Form</h2>
                  <p className="text-sm text-slate-600">
                    Fill out project parameters to receive a technical response from our production team.
                  </p>
                </div>

                {submitted ? (
                  <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                    <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
                    <h3 className="text-2xl font-bold text-emerald-900">RFQ Received Successfully!</h3>
                    <p className="text-sm text-emerald-700 max-w-md mx-auto">
                      Thank you for submitting your manufacturing requirements. An engineering estimator will review your specifications and issue a formal quote within 1-2 business days.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                      Submit Another RFQ
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Full Name *"
                        placeholder="Sarah Jenkins"
                        value={rfqData.fullName}
                        onChange={(e) => setRfqData({ ...rfqData, fullName: e.target.value })}
                        required
                      />
                      <Input
                        label="Work Email *"
                        type="email"
                        placeholder="s.jenkins@oem.com"
                        value={rfqData.email}
                        onChange={(e) => setRfqData({ ...rfqData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Company Name *"
                        placeholder="Global Pumps & Machinery OEM"
                        value={rfqData.company}
                        onChange={(e) => setRfqData({ ...rfqData, company: e.target.value })}
                        required
                      />
                      <Input
                        label="Phone Number"
                        placeholder="+358..."
                        value={rfqData.phone}
                        onChange={(e) => setRfqData({ ...rfqData, phone: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        label="Primary Capability Needed *"
                        options={[
                          { label: 'CNC Machining (Turning / Milling)', value: 'cnc-machining' },
                          { label: 'Turnkey Contract Manufacturing', value: 'contract-mfg' },
                          { label: 'Sub-Assembly & Mechanical Fitment', value: 'assembly' },
                          { label: 'Electric Motor Shafts & Housings', value: 'electric-motors' },
                          { label: 'Supply Chain & Material Sourcing', value: 'supply-chain' },
                        ]}
                        value={rfqData.capability}
                        onChange={(e) => setRfqData({ ...rfqData, capability: e.target.value })}
                      />

                      <Select
                        label="Estimated Batch Quantity *"
                        options={[
                          { label: 'Prototype / Pre-Series (1 - 50 pcs)', value: '1-50' },
                          { label: 'Small Batch (50 - 250 pcs)', value: '50-250' },
                          { label: 'Medium Batch (250 - 1,000 pcs)', value: '250-1000' },
                          { label: 'High Volume Production (1,000+ pcs)', value: '1000+' },
                          { label: 'Annual Blanket Order Agreement', value: 'annual' },
                        ]}
                        value={rfqData.quantity}
                        onChange={(e) => setRfqData({ ...rfqData, quantity: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        label="Raw Material Preference"
                        options={[
                          { label: 'Aluminum (6061, 7075, etc.)', value: 'aluminum' },
                          { label: 'Stainless Steel (304, 316L, 17-4PH)', value: 'stainless' },
                          { label: 'Alloy / Carbon Steel (4140, C45)', value: 'steel' },
                          { label: 'Cast Iron / Ductile Iron', value: 'cast-iron' },
                          { label: 'Brass / Copper Alloys', value: 'brass' },
                          { label: 'Other / Material Specified in Drawing', value: 'other' },
                        ]}
                        value={rfqData.material}
                        onChange={(e) => setRfqData({ ...rfqData, material: e.target.value })}
                      />

                      <Select
                        label="Target Production Schedule"
                        options={[
                          { label: 'Standard Lead Time (4-6 Weeks)', value: 'normal' },
                          { label: 'Fast-Track / Urgent (2-3 Weeks)', value: 'urgent' },
                          { label: 'Scheduled Deliveries / KanBan Call-off', value: 'scheduled' },
                        ]}
                        value={rfqData.targetTimeline}
                        onChange={(e) => setRfqData({ ...rfqData, targetTimeline: e.target.value })}
                      />
                    </div>

                    <Textarea
                      label="Project Description & Specific Tolerances *"
                      placeholder="Please specify part numbers, critical dimensions, surface finish requirements (Ra), heat treatment specs, or packaging instructions..."
                      rows={5}
                      value={rfqData.projectSummary}
                      onChange={(e) => setRfqData({ ...rfqData, projectSummary: e.target.value })}
                      required
                    />

                    {/* File Attachment Placeholder */}
                    <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center space-y-2">
                      <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                      <div className="text-xs font-bold text-slate-700">Attach Engineering Drawings / CAD Files</div>
                      <p className="text-[11px] text-slate-500">
                        Supports PDF, STEP, IGES, DXF, DWG up to 25MB (File submission simulation)
                      </p>
                    </div>

                    <div className="pt-2">
                      <Button variant="primary" size="lg" className="w-full sm:w-auto" rightIcon={<Send className="w-4 h-4" />}>
                        Submit RFQ for Engineering Review
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
