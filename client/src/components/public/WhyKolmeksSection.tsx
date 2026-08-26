import React from 'react';
import { Cpu, ShieldCheck, Truck, Users, Award, Layers } from 'lucide-react';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';

const REASONS = [
  {
    icon: Cpu,
    title: 'Engineering Rigor',
    description: 'Collaborative DFM engineering to optimize part design for cost, strength, and manufacturability.',
  },
  {
    icon: ShieldCheck,
    title: 'Zero-Defect Commitment',
    description: 'Advanced CMM inspection and raw material certified traceability across all batch sizes.',
  },
  {
    icon: Truck,
    title: 'Dependable Supply Chain',
    description: 'Buffer stock management and scheduled JIT delivery to support client production schedules.',
  },
  {
    icon: Layers,
    title: 'Turnkey Capability',
    description: 'Single-source responsibility from raw material procurement to machining and final assembly.',
  },
  {
    icon: Users,
    title: 'Dedicated Account Management',
    description: 'Direct collaboration with experienced technical sales engineers and production planners.',
  },
  {
    icon: Award,
    title: 'Continuous Improvement',
    description: 'Investment in modern multi-axis CNC machines and digitized ERP telemetry.',
  },
];

export const WhyKolmeksSection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 industrial-grid-dark opacity-10 pointer-events-none" />

      <Container className="relative z-10">
        <SectionHeading
          eyebrow="THE KOLMEKS ADVANTAGE"
          title="Why Leading OEMs Choose Kolmeks"
          description="A reliable engineering partner dedicated to precision, transparency, and operational consistency."
          centered
          className="text-white [&_h2]:text-white [&_p]:text-slate-300 [&_span]:text-emerald-400 [&_span]:bg-slate-800 [&_span]:border-slate-700"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {REASONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#0B1E36] p-6 rounded-xl border border-slate-800 space-y-4 hover:border-emerald-500/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[#0F2C59] text-emerald-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-bold text-white">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
