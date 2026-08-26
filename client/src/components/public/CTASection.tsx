import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';

interface CTASectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  eyebrow = "LET'S BUILD TOGETHER",
  title = 'Have a Manufacturing Requirement?',
  description = 'Our sales engineers and technical team are available to review your drawings, material specifications, and batch volume targets.',
  primaryButtonText = 'Request a Quote',
  primaryButtonHref = '/request-quote',
  secondaryButtonText = 'Contact Us',
  secondaryButtonHref = '/contact',
}) => {
  return (
    <section className="py-16 bg-slate-100 border-t border-slate-200">
      <Container>
        <div className="bg-[#0B1E36] rounded-2xl p-8 sm:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#0F2C59] opacity-40 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 max-w-2xl relative z-10">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              {eyebrow}
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {title}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-4 relative z-10 w-full sm:w-auto">
            {primaryButtonText && primaryButtonHref && (
              <Link to={primaryButtonHref} className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  {primaryButtonText}
                </Button>
              </Link>
            )}
            {secondaryButtonText && secondaryButtonHref && (
              <Link to={secondaryButtonHref} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-slate-700 bg-[#0F2C59] text-white hover:bg-slate-800"
                  leftIcon={<Mail className="w-4 h-4" />}
                >
                  {secondaryButtonText}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};
