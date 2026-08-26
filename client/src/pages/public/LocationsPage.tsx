import React from 'react';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { PageHeader } from '../../components/public/PageHeader';
import { CTASection } from '../../components/public/CTASection';
import { GlobalPresenceSection } from '../../components/public/GlobalPresenceSection';

export const LocationsPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <SEO
        title="Global Locations | Manufacturing & Logistics Network"
        description="Kolmeks international manufacturing plants, engineering centers, and regional logistics hubs."
      />

      <PageHeader
        eyebrow="GLOBAL FOOTPRINT"
        title="Manufacturing Facilities & Network"
        description="Strategic production facilities and engineering centers serving OEM partners worldwide."
        breadcrumbs={[{ label: 'Locations' }]}
      />

      <GlobalPresenceSection />

      <CTASection />
    </div>
  );
};
