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
  CheckCircle2,
  Factory,
  Cog,
  Zap,
  Truck,
  MessageSquare,
  Layers,
  Sparkles,
} from 'lucide-react';
import contractHeroImg from '../../assets/images/kolmeks-contract-manufacturing-hero.webp';
import contractProcessImg from '../../assets/images/kolmeks-contract-process.webp';

export const ContractManufacturingPage: React.FC = () => {
  const conceptualSteps = [
    {
      number: '01',
      title: 'Requirement',
      description: 'Understand drawings, specifications, quantity and delivery requirements.',
    },
    {
      number: '02',
      title: 'Engineering Review',
      description: 'Review manufacturability and production requirements.',
    },
    {
      number: '03',
      title: 'Material Sourcing',
      description: 'Prepare appropriate manufacturing materials.',
    },
    {
      number: '04',
      title: 'Production',
      description: 'Manufacture components using appropriate processes.',
    },
    {
      number: '05',
      title: 'Quality',
      description: 'Inspect components against applicable requirements.',
    },
    {
      number: '06',
      title: 'Delivery',
      description: 'Prepare completed products for delivery.',
    },
  ];

  const benefits = [
    {
      icon: Factory,
      title: 'Single Manufacturing Partner',
      description: 'Centralized manufacturing coordination for your complete component sourcing needs.',
    },
    {
      icon: Cpu,
      title: 'Engineering Support',
      description: 'Better understanding of manufacturing requirements and technical optimization.',
    },
    {
      icon: ShieldCheck,
      title: 'Quality Focus',
      description: 'Quality is integrated into every stage of component fabrication and assembly.',
    },
    {
      icon: Truck,
      title: 'Supply Coordination',
      description: 'Support for material procurement, inventory buffer planning, and scheduled delivery.',
    },
    {
      icon: Layers,
      title: 'Flexible Production',
      description: 'Manufacturing approach adapted to project batch sizes and specific OEM requirements.',
    },
  ];

  const connectedCapabilities = [
    {
      icon: Cpu,
      title: 'CNC Machining',
      description: 'High-precision turning, milling, and multi-axis component machining.',
      href: '/cnc-machining',
      badge: 'MACHINING',
    },
    {
      icon: Cog,
      title: 'Sub-Assembly',
      description: 'Mechanical and electro-mechanical assembly for complete sub-systems.',
      href: '/assembly',
      badge: 'ASSEMBLY',
    },
    {
      icon: Zap,
      title: 'Electric Motors & Components',
      description: 'Stator/rotor machining, motor housings, and custom shafts.',
      href: '/electric-motors',
      badge: 'MOTORS',
    },
    {
      icon: Truck,
      title: 'Supply Chain Management',
      description: 'End-to-end material procurement, stock management, and delivery logistics.',
      href: '/supply-chain',
      badge: 'LOGISTICS',
    },
  ];

  const qualityStages = [
    { stage: 'Requirement', text: 'Drawing & tolerance validation' },
    { stage: 'Material', text: 'Raw material certificate check' },
    { stage: 'Production', text: 'In-line dimension controls' },
    { stage: 'Inspection', text: '3D CMM quality audit' },
    { stage: 'Assembly', text: 'Fit & torque verification' },
    { stage: 'Delivery', text: 'Packaging & dispatch audit' },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | Contract Manufacturing"
        description="Professional contract manufacturing services for OEM clients, including component machining, dedicated lines, and sub-assembly."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="CONTRACT MANUFACTURING"
        title="Your Manufacturing Partner from Requirement to Delivery."
        description="Contract manufacturing with Kolmeks represents a strategic partnership where original equipment manufacturers work with a single dedicated partner for component production, CNC machining, sub-assembly, and delivery according to agreed technical specifications."
        primaryCtaText="Request a Quote"
        primaryCtaLink="/request-quote"
        secondaryCtaText="Explore CNC Machining"
        secondaryCtaLink="/cnc-machining"
        imageUrl={contractHeroImg}
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs
          items={[
            { label: 'Capabilities', href: '/contract-manufacturing' },
            { label: 'Contract Manufacturing' },
          ]}
        />
      </Container>

      {/* Contract Manufacturing Introduction */}
      <section className="py-4 bg-white border-y border-slate-200/80">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-mono font-bold uppercase">
              <Factory className="w-3.5 h-3.5 text-blue-600" /> MANUFACTURING PARTNERSHIP
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Manufacturing Support Built Around Your Requirements.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              We provide full-scope contract manufacturing designed to streamline component procurement for OEM industrial clients. From understanding engineering drawings and sourcing raw materials to CNC machining, quality inspection, and sub-assembly, our operations ensure consistent component supply.
            </p>
          </div>
        </Container>
      </section>

      {/* End-to-End Conceptual Process Section */}
      <section className="py-4">
        <Container className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <SectionHeading
                eyebrow="CONCEPTUAL WORKFLOW"
                title="From Requirement to Finished Component."
                description="A structured conceptual approach ensuring technical accuracy and quality control at every phase."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {conceptualSteps.map((step) => (
                  <div
                    key={step.number}
                    className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs hover:border-blue-500 transition-colors"
                  >
                    <div className="text-xs font-mono font-extrabold text-blue-600">
                      STEP {step.number}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{step.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="PRODUCTION FACTORY FLOOR"
                subtitle="Integrated CNC Machining & Operations"
                badge="CONTRACT PROCESS"
                imageUrl={contractProcessImg}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Contract Manufacturing Benefits */}
      <section className="py-12 bg-[#0B1E36] text-white border-y border-slate-800">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="PARTNERSHIP ADVANTAGES"
            title="Key Benefits of Contract Manufacturing."
            description="Our manufacturing structure is designed to deliver operational efficiency and technical confidence."
            centered={true}
            className="[&_h2]:text-white [&_p]:text-slate-300"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => {
              const IconComp = benefit.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-[#0F2C59]/80 border border-slate-700/80 space-y-3 hover:border-blue-500 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{benefit.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Connected Capabilities Grid */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="INTEGRATED DISCIPLINES"
            title="Connected Manufacturing Capabilities."
            description="Contract manufacturing integrates seamlessly across our core industrial capabilities."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {connectedCapabilities.map((cap, idx) => (
              <CapabilityCard key={idx} {...cap} />
            ))}
          </div>
        </Container>
      </section>

      {/* Quality Across Manufacturing Journey */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container className="space-y-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> QUALITY ASSURANCE
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Quality Across the Manufacturing Journey.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Quality assurance is an ongoing operational commitment active across every milestone of component fabrication.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {qualityStages.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-center shadow-xs"
              >
                <div className="text-xs font-mono font-bold text-emerald-600 uppercase">
                  {item.stage}
                </div>
                <p className="text-xs font-semibold text-slate-800">{item.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Customer Collaboration Section */}
      <section className="py-4">
        <Container>
          <div className="p-8 sm:p-12 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-mono font-bold uppercase">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> CUSTOMER COLLABORATION
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Clear Communication from Requirement to Delivery.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Successful contract manufacturing relies on transparent dialogue. We maintain active communication regarding engineering drawings, tolerance specifications, order quantities, delivery timelines, and quality expectations.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Technical drawing validation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Synchronized delivery schedules</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Transparent order updates</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Contract Final CTA Section */}
      <section className="py-4">
        <Container>
          <div className="bg-[#0B1E36] text-white p-8 sm:p-12 rounded-2xl border border-slate-800 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Have a Component or Manufacturing Requirement?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Submit your manufacturing drawings and specifications for technical review and quotation.
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
