import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Globe, ArrowRight } from 'lucide-react';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { Card, CardContent } from '../ui/Card';

const DEMO_LOCATIONS = [
  {
    region: 'Northern Europe',
    role: 'Primary Manufacturing & Engineering Center',
    status: 'Operational Facility',
  },
  {
    region: 'Central Europe',
    role: 'Precision Components & Assembly Hub',
    status: 'Operational Facility',
  },
  {
    region: 'Global Logistics',
    role: 'International Supply Chain Coordination',
    status: 'Distribution Center',
  },
];

export const GlobalPresenceSection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <Container>
        <SectionHeading
          eyebrow="GLOBAL REACH"
          title="International Presence & Delivery Network"
          description="Serving OEM clients globally with flexible manufacturing coordination and logistics."
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DEMO_LOCATIONS.map((loc, idx) => (
            <Card key={idx} variant="industrial" className="hover:border-blue-600 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-lg bg-[#0F2C59] text-white flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{loc.region}</h3>
                  <div className="text-xs font-mono text-blue-700 font-semibold mt-0.5">
                    {loc.status}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {loc.role}
                </p>

                <div className="pt-2">
                  <Link
                    to="/locations"
                    className="inline-flex items-center text-xs font-bold text-slate-800 hover:text-blue-700 gap-1"
                  >
                    View Network Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-700 shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-900">Expanding Manufacturing Horizons</div>
              <div className="text-xs text-slate-500">Contact our sales engineering team for regional sourcing inquiries.</div>
            </div>
          </div>
          <Link to="/locations">
            <span className="text-xs font-bold text-blue-700 hover:underline shrink-0">
              Explore Locations →
            </span>
          </Link>
        </div>
      </Container>
    </section>
  );
};
