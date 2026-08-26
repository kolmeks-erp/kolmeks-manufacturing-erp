import React from 'react';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { 
  FileCheck2, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Boxes, 
  Truck 
} from 'lucide-react';

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Engineering & DFM',
    description: 'Technical drawing evaluation, Design for Manufacturability (DFM) review, and production planning.',
    icon: FileCheck2,
  },
  {
    step: '02',
    title: 'Material Sourcing',
    description: 'Raw material procurement, mill test certificates, and strict alloy compliance verification.',
    icon: Layers,
  },
  {
    step: '03',
    title: 'CNC Machining',
    description: 'High-precision multi-axis milling, turning, and tight-tolerance component fabrication.',
    icon: Cpu,
  },
  {
    step: '04',
    title: 'Quality Inspection',
    description: 'CMM 3D coordinate scanning, surface roughness testing, and dimensional compliance checks.',
    icon: ShieldCheck,
  },
  {
    step: '05',
    title: 'Assembly & Testing',
    description: 'Sub-assembly integration, pressure testing, and final electro-mechanical validation.',
    icon: Boxes,
  },
  {
    step: '06',
    title: 'Logistics & Delivery',
    description: 'Custom protective packaging, export documentation, and just-in-time scheduled dispatch.',
    icon: Truck,
  },
];

export const ProcessSection: React.FC = () => {
  return (
    <section className="py-16 bg-slate-50 border-y border-slate-200">
      <Container>
        <SectionHeading
          eyebrow="WORKFLOW EXCELLENCE"
          title="Manufacturing Execution Process"
          description="A structured workflow designed to deliver repeatable precision and quality at scale."
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {PROCESS_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative space-y-4 hover:border-blue-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black font-mono text-slate-300">
                    {step.step}
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-[#0F2C59] text-white flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-slate-400 font-mono">
          * Workflow overview represents standard contract manufacturing practices.
        </div>
      </Container>
    </section>
  );
};
