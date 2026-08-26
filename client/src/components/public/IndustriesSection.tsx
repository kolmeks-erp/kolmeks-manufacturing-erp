import React from 'react';
import { Factory, Car, Zap, Cog, Wrench, ShieldCheck } from 'lucide-react';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';

const INDUSTRIES = [
  {
    icon: Factory,
    title: 'Industrial OEM Machinery',
    description: 'Heavy machinery housings, precision shafts, and custom mechanical sub-assemblies.',
  },
  {
    icon: Car,
    title: 'Transportation & Mobility',
    description: 'High-durability machined castings, brackets, and structural components.',
  },
  {
    icon: Zap,
    title: 'Electrical & Power Systems',
    description: 'Stator laminations, electric motor windings, and conductive component assemblies.',
  },
  {
    icon: Cog,
    title: 'Precision Automation',
    description: 'Robotic drive gears, pneumatic blocks, and micron-tolerance sensor housings.',
  },
  {
    icon: Wrench,
    title: 'Fluid & Pump Technologies',
    description: 'Impellers, valve bodies, and pressure-tested hydraulic component assemblies.',
  },
  {
    icon: ShieldCheck,
    title: 'Energy & Power Generation',
    description: 'Heat-resistant alloy parts and specialized components for power infrastructure.',
  },
];

export const IndustriesSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <Container>
        <SectionHeading
          eyebrow="TARGET SECTORS"
          title="Industries Served"
          description="Delivering engineered components and contract manufacturing for demanding technical applications."
          centered
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {INDUSTRIES.map((ind, idx) => {
            const Icon = ind.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-600 hover:shadow-md transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-[#0B1E36] text-white flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {ind.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {ind.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
