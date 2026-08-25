import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { MapPin } from 'lucide-react';

export const LocationsPage: React.FC = () => {
  return (
    <div className="py-12">
      <Container>
        <SectionHeading
          eyebrow="Global Footprint"
          title="Kolmeks Production Facilities"
          description="Manufacturing hubs, customer support units, and engineering offices."
        />
        <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
          <MapPin className="w-8 h-8 text-industrial-700" />
          <p className="text-sm text-slate-600">
            Kolmeks operates production and machining facilities strategically positioned for global industrial supply chains.
          </p>
        </div>
      </Container>
    </div>
  );
};
