import React from 'react';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { HeroSection } from '../../components/public/HeroSection';
import { GlobalPresenceSection } from '../../components/public/GlobalPresenceSection';
import { CTASection } from '../../components/public/CTASection';

export const LocationsPage: React.FC = () => {
  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | Locations"
        description="Explore Kolmeks manufacturing facilities, sales offices, and global customer support locations."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="GLOBAL LOCATIONS"
        title="Manufacturing Facilities & International Presence."
        description="Kolmeks operates synchronized manufacturing plants and sales representation to support OEM clients across international markets."
        primaryCtaText="Contact Us"
        primaryCtaLink="/contact"
        secondaryCtaText="Request a Quote"
        secondaryCtaLink="/request-quote"
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs items={[{ label: 'Locations' }]} />
      </Container>

      {/* Global Presence Section */}
      <GlobalPresenceSection />

      {/* Final CTA */}
      <CTASection />
    </div>
  );
};
