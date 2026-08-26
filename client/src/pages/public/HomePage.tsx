import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { SEO } from '../../components/public/SEO';
import { HeroSection } from '../../components/public/HeroSection';
import { PositioningStrip } from '../../components/public/PositioningStrip';
import { AboutSection } from '../../components/public/AboutSection';
import { CapabilityCard } from '../../components/public/CapabilityCard';
import { ProcessSection } from '../../components/public/ProcessSection';
import { QualitySection } from '../../components/public/QualitySection';
import { GlobalPresenceSection } from '../../components/public/GlobalPresenceSection';
import { IndustriesSection } from '../../components/public/IndustriesSection';
import { WhyKolmeksSection } from '../../components/public/WhyKolmeksSection';
import { StatCard } from '../../components/public/StatCard';
import { CTASection } from '../../components/public/CTASection';

import { CAPABILITIES_DATA, STATS_PLACEHOLDERS_DATA } from '../../data/homeContent';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-0">
      <SEO
        title="Kolmeks | Precision Manufacturing & Engineering"
        description="Explore Kolmeks contract manufacturing capabilities, precision engineering, quality focus, and industrial component solutions."
      />

      {/* 2. Hero Section */}
      <HeroSection
        eyebrow="PRECISION MANUFACTURING"
        title="Precision Manufacturing. Engineered for Performance."
        description="Kolmeks delivers custom contract manufacturing, high-precision CNC machining, sub-assemblies, and electric motor components engineered for international B2B requirements."
        primaryCtaText="Request a Quote"
        primaryCtaLink="/request-quote"
        secondaryCtaText="Explore Capabilities"
        secondaryCtaLink="/cnc-machining"
      />

      {/* 3. Trust / Positioning Strip */}
      <PositioningStrip />

      {/* 4. About / Company Introduction */}
      <AboutSection />

      {/* 5. Capabilities Section */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <Container>
          <SectionHeading
            eyebrow="OUR CAPABILITIES"
            title="Manufacturing Expertise Across the Production Journey"
            description="End-to-end component manufacturing solutions engineered for high precision and repeatable quality."
            centered
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CAPABILITIES_DATA.map((item) => (
              <CapabilityCard
                key={item.index}
                icon={item.icon}
                title={item.title}
                description={item.description}
                href={item.href}
                badge={item.badge}
              />
            ))}
          </div>

          {/* Capabilities Section CTA */}
          <div className="mt-12 p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h4 className="text-base font-bold text-slate-900">Looking for the right manufacturing solution?</h4>
              <p className="text-xs text-slate-500">Our engineering team is ready to evaluate your technical component requirements.</p>
            </div>
            <Link to="/request-quote">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Request a Quote
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* 6. Manufacturing Process Workflow */}
      <ProcessSection />

      {/* 7. Precision / Quality Section */}
      <QualitySection />

      {/* 8. Global Presence Section */}
      <GlobalPresenceSection />

      {/* 9. Target Industries & Applications Section */}
      <IndustriesSection />

      {/* 10. Why Kolmeks Editorial Section */}
      <WhyKolmeksSection />

      {/* 11. Statistics Placeholder Area */}
      <section className="py-16 bg-white border-b border-slate-200">
        <Container>
          <SectionHeading
            eyebrow="OPERATIONAL FRAMEWORK"
            title="Manufacturing Quality Standards"
            description="Structural metrics framework demonstrating quality compliance and ERP digitization standards."
            centered
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS_PLACEHOLDERS_DATA.map((stat, idx) => (
              <StatCard
                key={idx}
                label={stat.label}
                value={stat.value}
                subtext={stat.subtext}
                isPlaceholder={true}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* 12. Final Customer Call-to-Action */}
      <CTASection
        eyebrow="LET'S BUILD TOGETHER"
        title="Have a Manufacturing Requirement?"
        description="Our sales engineers and technical team are available to review your drawings, material specifications, and batch volume targets."
        primaryButtonText="Request a Quote"
        primaryButtonHref="/request-quote"
        secondaryButtonText="Contact Us"
        secondaryButtonHref="/contact"
      />
    </div>
  );
};
