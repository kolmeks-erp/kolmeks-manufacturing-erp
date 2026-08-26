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
import { MapPin, ArrowRight, Globe, Factory, Building2, Info, CheckCircle2, MessageSquare } from 'lucide-react';
import locationsHeroImg from '../../assets/images/kolmeks-locations-hero.webp';
import globalMfgImg from '../../assets/images/kolmeks-global-manufacturing.webp';

export const LocationsPage: React.FC = () => {
  // Prepared structured framework for future verified location data
  const locationFrameworkItems = [
    {
      region: 'Manufacturing & Assembly Operations',
      status: 'VERIFICATION PENDING',
      capability: 'Facility parameters, precision equipment lists, site addresses, and regional contact details will be displayed here once verified.',
    },
    {
      region: 'Contract Machining & Logistics Hub',
      status: 'VERIFICATION PENDING',
      capability: 'Regional warehouse capacity, delivery logistics infrastructure, and local engineering contacts will be published upon confirmation.',
    },
    {
      region: 'International OEM Support Center',
      status: 'VERIFICATION PENDING',
      capability: 'OEM client communication hub details, drawing evaluation services, and project management contacts will be listed here.',
    },
  ];

  const coordinationPillars = [
    { title: 'Global Supply Coordination', desc: 'Aligning component production schedule with international shipping logistics.' },
    { title: 'Responsive Communication', desc: 'Direct technical communication between customer engineers and manufacturing planners.' },
    { title: 'Production Planning', desc: 'Capacity scheduling to match customer demand cycles and delivery timetables.' },
    { title: 'Delivery Reliability', desc: 'Protective packaging and verified logistics dispatch for international transport.' },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | Locations"
        description="Learn about Kolmeks global manufacturing perspective, supply chain coordination, international customer connection, and facility location framework."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="LOCATIONS"
        title="Connected Manufacturing Across Markets."
        description="Manufacturing coordination and reliable component supply are essential for OEM customers operating across regional and international markets."
        primaryCtaText="Contact Us"
        primaryCtaLink="/contact"
        secondaryCtaText="Request a Quote"
        secondaryCtaLink="/request-quote"
        imageUrl={locationsHeroImg}
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs
          items={[
            { label: 'Locations' },
          ]}
        />
      </Container>

      {/* Global Manufacturing Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-mono font-bold uppercase">
                <Globe className="w-3.5 h-3.5 text-blue-600" /> GLOBAL PERSPECTIVE
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Manufacturing Connected to Customer Requirements.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Industrial customers require component suppliers capable of coordinating raw material procurement, CNC machining, sub-assembly, quality verification, and shipment delivery across international supply routes.
              </p>

              <div className="space-y-3 pt-2 text-xs font-medium text-slate-700">
                {coordinationPillars.map((pillar, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">{pillar.title}: </span>
                      <span className="text-slate-600">{pillar.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="CONNECTED GLOBAL MANUFACTURING & LOGISTICS"
                subtitle="International Component Supply & Logistics Coordination"
                badge="GLOBAL PERSPECTIVE"
                imageUrl={globalMfgImg}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Information State & Location Framework */}
      <section className="py-4">
        <Container className="space-y-8">
          {/* Professional Information State Notice */}
          <div className="p-6 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Location Information Frame
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Facility information and verified operational parameters are being prepared and will be published when available. The framework below demonstrates the structured location data layout.
              </p>
            </div>
          </div>

          <SectionHeading
            eyebrow="FACILITY FRAMEWORK"
            title="Location Data Framework."
            description="Structured framework designed to display verified manufacturing facilities, site capabilities, and contact details."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locationFrameworkItems.map((loc, idx) => (
              <LocationCard key={idx} {...loc} />
            ))}
          </div>
        </Container>
      </section>

      {/* Abstract Visual Global Map Section */}
      <section className="py-12 bg-[#0B1E36] text-white border-y border-slate-800">
        <Container className="space-y-8 text-center">
          <SectionHeading
            eyebrow="GLOBAL REACH"
            title="Connecting International Supply Chains."
            description="Serving OEM clients across regional and global manufacturing markets."
            centered={true}
            className="[&_h2]:text-white [&_p]:text-slate-300"
          />

          {/* Abstract Global Map Visual Graphic */}
          <div className="p-8 sm:p-12 rounded-2xl bg-[#0F2C59]/60 border border-slate-700/80 relative overflow-hidden flex flex-col items-center justify-center min-h-[260px] space-y-4">
            <Globe className="w-16 h-16 text-blue-400 opacity-60 animate-pulse" />
            <div className="space-y-2 max-w-xl">
              <h3 className="text-lg font-bold text-white">Abstract Supply Network Visualization</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Visualizing global component supply flows and international customer connections across European and global industrial markets.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Customer Connection Section */}
      <section className="py-4">
        <Container>
          <div className="p-8 sm:p-10 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-mono font-bold uppercase">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> CUSTOMER CONNECTION
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Manufacturing Coordination That Supports Your Requirements.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              Whether you require drawing evaluation, raw material planning, CNC machining, or custom component packaging, our team is ready to discuss your project requirements.
            </p>

            <div className="pt-2">
              <Link to="/contact">
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Final Location CTA */}
      <section className="py-4">
        <Container>
          <div className="bg-[#0B1E36] text-white p-8 sm:p-12 rounded-2xl border border-slate-800 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Looking for a Manufacturing Partner?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Talk with our team to discuss your component manufacturing, machining, and supply requirements.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
              <Link to="/request-quote">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Request a Quote
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="border-slate-700 bg-[#0F2C59] text-white hover:bg-slate-800">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
