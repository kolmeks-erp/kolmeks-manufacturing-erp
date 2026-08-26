import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { HeroSection } from '../../components/public/HeroSection';
import { CapabilityCard } from '../../components/public/CapabilityCard';
import { VisualPlaceholder } from '../../components/public/VisualPlaceholder';
import { Button } from '../../components/ui/Button';
import { SectionHeading } from '../../components/ui/SectionHeading';
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Factory,
  Layers,
  Globe2,
  CheckCircle2,
  Settings,
  Cog,
  Zap,
  Truck,
  MessageSquare,
  Compass,
} from 'lucide-react';
import aboutHeroImg from '../../assets/images/kolmeks-about-hero.webp';
import aboutMfgImg from '../../assets/images/kolmeks-about-manufacturing.webp';

export const AboutPage: React.FC = () => {
  const capabilities = [
    {
      icon: Factory,
      title: 'Contract Manufacturing',
      description: 'Turnkey component fabrication and sub-assembly management tailored for international OEM partners.',
      href: '/contract-manufacturing',
      badge: 'TURNKEY',
    },
    {
      icon: Cpu,
      title: 'CNC Machining',
      description: 'High-precision multi-axis turning, milling, and grinding for tight-tolerance industrial components.',
      href: '/cnc-machining',
      badge: 'PRECISION',
    },
    {
      icon: Cog,
      title: 'Sub-Assembly & Mechanical',
      description: 'Electro-mechanical assembly, press fitting, balancing, and sub-system modular integration.',
      href: '/assembly',
      badge: 'ASSEMBLY',
    },
    {
      icon: Zap,
      title: 'Electric Motors & Components',
      description: 'Precision rotor and stator components, motor housings, and specialized shaft assemblies.',
      href: '/electric-motors',
      badge: 'MOTORS',
    },
    {
      icon: Truck,
      title: 'Supply Chain & Logistics',
      description: 'Synchronized material sourcing, inventory buffer management, and reliable delivery logistics.',
      href: '/supply-chain',
      badge: 'LOGISTICS',
    },
  ];

  const workflowSteps = [
    { step: '01', title: 'Requirement', text: 'Thorough review of engineering drawings, material specs, and tolerances.' },
    { step: '02', title: 'Engineering', text: 'Design for Manufacturability (DFM) assessment and production planning.' },
    { step: '03', title: 'Manufacturing', text: 'Precision CNC machining, turning, milling, and sub-assembly operations.' },
    { step: '04', title: 'Inspection', text: 'In-line measurements and Coordinate Measuring Machine (CMM) audits.' },
    { step: '05', title: 'Delivery', text: 'Secure packaging, quality documentation, and scheduled shipment.' },
  ];

  const principles = [
    {
      number: '01',
      title: 'Precision',
      description: 'Manufacturing decisions should be driven by defined requirements and accuracy.',
    },
    {
      number: '02',
      title: 'Engineering',
      description: 'Engineering thinking supports practical manufacturing solutions.',
    },
    {
      number: '03',
      title: 'Quality',
      description: 'Quality should be considered throughout the manufacturing process.',
    },
    {
      number: '04',
      title: 'Partnership',
      description: 'Manufacturing should be built around clear communication and customer requirements.',
    },
  ];

  const whyWorkBenefits = [
    {
      icon: Cpu,
      title: 'Engineering Expertise',
      description: 'Deep technical understanding of component requirements, material characteristics, and production feasibility.',
    },
    {
      icon: Settings,
      title: 'Precision Manufacturing',
      description: 'Advanced CNC machining setup focused on dimensional consistency and tight mechanical tolerances.',
    },
    {
      icon: ShieldCheck,
      title: 'Quality Focus',
      description: 'Comprehensive inspection protocols integrated directly into every stage of component fabrication.',
    },
    {
      icon: Truck,
      title: 'Reliable Supply',
      description: 'Dedicated production planning ensuring predictable manufacturing lead times and delivery schedules.',
    },
    {
      icon: MessageSquare,
      title: 'Customer Collaboration',
      description: 'Transparent technical dialogue and responsive account management for custom OEM specifications.',
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | About"
        description="Learn about Kolmeks contract manufacturing, precision engineering values, and OEM component partnerships."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="ABOUT KOLMEKS"
        title="Engineering Experience. Manufacturing Precision."
        description="Kolmeks is an international manufacturing partner focused on precision component production, electro-mechanical sub-assemblies, and specialized engineering solutions for industrial OEMs."
        primaryCtaText="Explore Capabilities"
        primaryCtaLink="/cnc-machining"
        secondaryCtaText="Request a Quote"
        secondaryCtaLink="/request-quote"
        imageUrl={aboutHeroImg}
      />

      {/* Breadcrumb Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs items={[{ label: 'About' }]} />
      </Container>

      {/* Company Introduction Section */}
      <section className="py-4 bg-white border-y border-slate-200/80">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-mono font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-blue-600" /> WHO WE ARE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Built Around Precision, Engineering and Reliability.
            </h2>
            <div className="prose prose-slate max-w-none text-base sm:text-lg text-slate-600 leading-relaxed space-y-4">
              <p>
                At Kolmeks, we operate with a dedicated engineering mindset to support original equipment manufacturers with high-precision component fabrication and contract assembly services. Our operations are structured around exact customer specifications, material integrity, and repeatable manufacturing accuracy.
              </p>
              <p>
                By combining advanced machining technology with structured production workflows, we foster long-term partnerships with industrial clients who require dependable quality, clear technical communication, and predictable delivery schedules.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* About Manufacturing Image (2-Column Section) */}
      <section className="py-4">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="KOLMEKS MANUFACTURING CELL"
                subtitle="High-Precision Multi-Axis CNC Milling & Assembly"
                badge="ENGINEERING OPERATIONS"
                imageUrl={aboutMfgImg}
              />
            </div>
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-bold uppercase">
                MANUFACTURING APPROACH
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                From Engineering Requirements to Manufactured Components.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Transforming engineering drawings into physical high-performance components requires structured control across every phase of production.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 p-3.5 bg-white rounded-lg border border-slate-200/80 shadow-xs">
                  <Cpu className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Engineering Evaluation</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">Technical review and manufacturability assessment aligned with client specifications.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-white rounded-lg border border-slate-200/80 shadow-xs">
                  <Settings className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Precision Manufacturing</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">High-accuracy CNC machining, turning, milling, and mechanical assembly processes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-white rounded-lg border border-slate-200/80 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Quality Focus</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">Structured quality controls and dimensional inspection integrated throughout component production.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-white rounded-lg border border-slate-200/80 shadow-xs">
                  <MessageSquare className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Customer Collaboration</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">Transparent communication and synchronized production scheduling.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Engineering Philosophy Section */}
      <section className="py-12 bg-[#0B1E36] text-white border-y border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 industrial-grid-dark opacity-10 pointer-events-none" />
        <Container className="relative z-10 space-y-10">
          <SectionHeading
            eyebrow="OUR APPROACH"
            title="Engineering Thinking at Every Stage."
            description="Our conceptual workflow ensures seamless transition from initial customer requirements to final component delivery."
            centered={true}
            className="[&_h2]:text-white [&_p]:text-slate-300"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {workflowSteps.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[#0F2C59]/80 border border-slate-700/80 space-y-3 relative group hover:border-blue-500 transition-colors"
              >
                <div className="text-xs font-mono font-bold text-emerald-400">
                  STEP {item.step}
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* About Principles Section */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="CORE VALUES"
            title="Guided by Four Core Principles."
            description="These principles define our approach to component fabrication, quality, and OEM client relationships."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {principles.map((item) => (
              <div
                key={item.number}
                className="p-6 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs hover:border-blue-500 transition-colors"
              >
                <div className="text-2xl font-mono font-extrabold text-blue-600">
                  {item.number} — {item.title}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Capabilities Overview Section */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="CAPABILITIES OVERVIEW"
            title="Comprehensive Industrial Capabilities."
            description="Explore our specialized manufacturing disciplines designed to fulfill technical B2B requirements."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, idx) => (
              <CapabilityCard key={idx} {...cap} />
            ))}
          </div>
        </Container>
      </section>

      {/* Quality & Reliability Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> QUALITY
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Quality Is Built Into the Process.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Quality assurance is not treated as an isolated final step, but integrated systematically into material verification, machining setup, in-line dimensional audits, and final inspection protocols.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Defined technical specifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>In-line process control</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>CMM dimensional inspection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Material batch traceability</span>
                </div>
              </div>
              <div>
                <Link to="/quality">
                  <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Explore Quality Systems
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 space-y-4">
              <div className="text-xs font-mono text-emerald-400 font-bold">QUALITY PHILOSOPHY</div>
              <h3 className="text-xl font-bold text-white">Preventative & Systematic</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                By maintaining structured inspection routines and standardized setups, we minimize dimensional variation and ensure components strictly match customer drawings.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Global Perspective Section */}
      <section className="py-4">
        <Container>
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-[#0F2C59] to-[#0B1E36] text-white border border-slate-800 space-y-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none p-12">
              <Globe2 className="w-64 h-64 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono font-bold uppercase">
              <Globe2 className="w-3.5 h-3.5" /> GLOBAL PERSPECTIVE
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight max-w-2xl">
              Connected Manufacturing for Global Requirements.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Industrial supply chains demand clear communication, production coordination, and uninterrupted component delivery across international markets. Kolmeks synchronizes manufacturing schedules to meet diverse OEM requirements.
            </p>
          </div>
        </Container>
      </section>

      {/* Why Work With Kolmeks Section */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="WHY KOLMEKS"
            title="Why OEM Partners Work With Kolmeks."
            description="Our manufacturing capability is structured around technical precision, reliable delivery, and transparent collaboration."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyWorkBenefits.map((benefit, idx) => {
              const IconComp = benefit.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white border border-slate-200 rounded-xl space-y-3 hover:border-blue-600 transition-colors shadow-xs"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0F2C59] flex items-center justify-center font-bold">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{benefit.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* About Final CTA Section */}
      <section className="py-4">
        <Container>
          <div className="bg-[#0B1E36] text-white p-8 sm:p-12 rounded-2xl border border-slate-800 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Have a Manufacturing Requirement?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Talk with our team about your custom component drawings, machining tolerances, or contract assembly needs.
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
