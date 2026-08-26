import React from 'react';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { PROCESS_STEPS_DATA } from '../../data/homeContent';

export const ProcessSection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-50 border-y border-slate-200">
      <Container>
        <SectionHeading
          eyebrow="HOW WE WORK"
          title="From Requirement to Finished Component"
          description="A typical manufacturing workflow designed to transform technical specifications into precision components."
          centered
        />

        {/* Workflow Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative pt-4">
          {PROCESS_STEPS_DATA.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative space-y-4 hover:border-blue-600 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
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
