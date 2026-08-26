import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { INDUSTRIES_DATA } from '../../data/homeContent';

export const IndustriesSection: React.FC = () => {
  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <Container>
        <SectionHeading
          eyebrow="INDUSTRIES & APPLICATIONS"
          title="Engineering for Demanding Applications"
          description="Delivering contract manufacturing and precision component machining for technical industrial sectors."
          centered
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {INDUSTRIES_DATA.map((ind, idx) => {
            const Icon = ind.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-600 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
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

                <div className="pt-2 border-t border-slate-100">
                  <Link
                    to="/request-quote"
                    className="inline-flex items-center text-xs font-bold text-blue-700 hover:text-[#0B1E36] gap-1"
                  >
                    Discuss Application <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
