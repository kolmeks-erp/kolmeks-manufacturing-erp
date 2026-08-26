import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { HeroSection } from '../../components/public/HeroSection';
import { VisualPlaceholder } from '../../components/public/VisualPlaceholder';
import { Button } from '../../components/ui/Button';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { LocationCard } from '../../components/public/LocationCard';
import { MapPin, ArrowRight, Globe, Factory, Building2 } from 'lucide-react';
import locationsHeroImg from '../../assets/images/kolmeks-locations-hero.webp';
import globalMfgImg from '../../assets/images/kolmeks-global-manufacturing.webp';

export const LocationsPage: React.FC = () => {
  const locations = [
    {
      region: 'Turenki, Finland (Headquarters)',
      status: 'Primary European Component Manufacturing Facility',
      capability: 'Primary European manufacturing plant specializing in high-precision turning, CNC milling, electric motor components, CMM metrology, and sub-assembly.',
    },
    {
      region: 'Viljandi, Estonia',
      status: 'Baltic Operations & Assembly Hub',
      capability: 'Baltic region contract manufacturing, mechanical assembly, rotational shaft turning, VCI packaging, and regional logistics warehouse.',
    },
    {
      region: 'Wuxi, China',
      status: 'Asian Precision Components Facility',
      capability: 'Asian manufacturing location supporting regional OEM clients with precision machining, sourcing coordination, and component delivery.',
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | Global Manufacturing Locations"
        description="Explore Kolmeks manufacturing facilities in Finland, Estonia, and China delivering precision CNC machining and contract manufacturing."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="GLOBAL FOOTPRINT"
        title="Manufacturing Facilities & Regional Hubs."
        description="Kolmeks operates manufacturing facilities across Finland, Estonia, and China, serving global OEM clients with localized supply and high-precision component production."
        primaryCtaText="Contact Facilities"
        primaryCtaLink="/contact"
        secondaryCtaText="Request a Quote"
        secondaryCtaLink="/request-quote"
        imageUrl={locationsHeroImg}
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs
          items={[
            { label: 'Company', href: '/about' },
            { label: 'Locations' },
          ]}
        />
      </Container>

      {/* Intro Section */}
      <section className="py-4 bg-white border-y border-slate-200/80">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-mono font-bold uppercase">
              <Globe className="w-3.5 h-3.5 text-blue-600" /> INTERNATIONAL NETWORK
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Strategic Proximity to Global Industrial Markets.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              With production units positioned in Northern Europe and East Asia, Kolmeks offers OEM clients flexible capacity, regional logistics buffering, and localized engineering support across international supply chains.
            </p>
          </div>
        </Container>
      </section>

      {/* Facility Cards Grid */}
      <section className="py-4">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="OUR FACILITIES"
            title="Manufacturing & Assembly Sites."
            description="Detailed breakdown of Kolmeks manufacturing units, locations, and specialized capabilities."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {locations.map((loc, idx) => (
              <LocationCard key={idx} {...loc} />
            ))}
          </div>
        </Container>
      </section>

      {/* Global Manufacturing Network Graphic */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-mono font-bold uppercase">
                <Factory className="w-3.5 h-3.5 text-blue-600" /> INTEGRATED NETWORK
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Seamless Cross-Facility Coordination.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                All Kolmeks facilities share standardized quality management protocols, digital production monitoring, and unified ERP coordination to guarantee identical component quality regardless of production site.
              </p>

              <div className="space-y-4 pt-2 text-sm text-slate-700">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" /> Turenki, Finland (Headquarters)
                  </h3>
                  <p className="text-xs text-slate-600">Core machining hub, administrative headquarters, and primary R&D technical center.</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" /> Viljandi, Estonia
                  </h3>
                  <p className="text-xs text-slate-600">Contract manufacturing operations, rotational shaft machining, and Baltic dispatch center.</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" /> Wuxi, China
                  </h3>
                  <p className="text-xs text-slate-600">Precision component manufacturing and sourcing hub serving Asian industrial markets.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="KOLMEKS GLOBAL MANUFACTURING NETWORK"
                subtitle="Connected Production & Supply Chain Infrastructure"
                badge="GLOBAL NETWORK"
                imageUrl={globalMfgImg}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-4">
        <Container>
          <div className="bg-[#0B1E36] text-white p-8 sm:p-12 rounded-2xl border border-slate-800 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Connect with a Manufacturing Facility?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Get in touch with our global team to discuss manufacturing capacity, site visits, or RFQ submissions.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
              <Link to="/request-quote">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Request a Quote
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="border-slate-700 bg-[#0F2C59] text-white hover:bg-slate-800">
                  Contact Facilities
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
