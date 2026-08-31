import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { INDUSTRIES_DATA } from '../../data/homeContent';

export const IndustriesSection: React.FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-[#071220] border-b border-slate-200 dark:border-slate-800 transition-colors">
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
                className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F2647]/50 hover:bg-white dark:hover:bg-[#0F2647] hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0B1E36] dark:bg-blue-600 text-white flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {ind.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ind.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to="/request-quote"
                    className="inline-flex items-center text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-[#0B1E36] dark:hover:text-blue-300 gap-1"
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
