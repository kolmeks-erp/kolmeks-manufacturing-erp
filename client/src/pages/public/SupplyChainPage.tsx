import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { HeroSection } from '../../components/public/HeroSection';
import { VisualPlaceholder } from '../../components/public/VisualPlaceholder';
import { CapabilityCard } from '../../components/public/CapabilityCard';
import { Button } from '../../components/ui/Button';
import { SectionHeading } from '../../components/ui/SectionHeading';
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Truck,
  Factory,
  Cog,
  Zap,
  PackageCheck,
  Boxes,
  Clock,
  Compass,
  FileCheck2,
  ArrowDown,
} from 'lucide-react';
import supplyHeroImg from '../../assets/images/kolmeks-supply-chain-hero.webp';
import supplyCoordinationImg from '../../assets/images/kolmeks-supply-chain-coordination.webp';

export const SupplyChainPage: React.FC = () => {
  const coordinationElements = [
    { title: 'Raw Materials', desc: 'Sourcing certified metal alloys, castings, and stock to drawing specifications.' },
    { title: 'Production Scheduling', desc: 'Aligning machining and assembly capacity with customer delivery targets.' },
    { title: 'Quality Audits', desc: 'Verifying material certs and performing in-line dimensional audits.' },
    { title: 'Inventory Buffering', desc: 'Planning component safety stock and scheduled call-off releases.' },
    { title: 'Packaging Protection', desc: 'Applying anti-corrosion VCI coatings and custom transport cradles.' },
    { title: 'Delivery Dispatch', desc: 'Coordinating freight dispatch to customer manufacturing locations.' },
  ];

  const supplySteps = [
    { number: '01', title: 'Requirement Planning', desc: 'Reviewing component demand schedules and material specs.' },
    { number: '02', title: 'Material Coordination', desc: 'Procuring certified raw stock and verified hardware.' },
    { number: '03', title: 'Production Planning', desc: 'Scheduling machine capacity and assembly operations.' },
    { number: '04', title: 'Quality Verification', desc: 'Conducting dimensional checks and compliance auditing.' },
    { number: '05', title: 'Packaging', desc: 'Applying protective wrapping and shipping labels.' },
    { number: '06', title: 'Delivery', desc: 'Dispatching shipments according to agreed logistics schedules.' },
  ];

  const materialThemes = [
    { title: 'Material Availability', desc: 'Securing raw stock early prevents production bottlenecks.' },
    { title: 'Lead Time Awareness', desc: 'Accounting for mill production times and heat treatment schedules.' },
    { title: 'Material Specification', desc: 'Verifying chemical composition and mechanical strength certificates.' },
    { title: 'Production Synchronization', desc: 'Matching material arrival with scheduled CNC machine availability.' },
  ];

  const inventoryFlow = [
    { step: '01', label: 'Material Availability' },
    { step: '02', label: 'Production Planning' },
    { step: '03', label: 'Component Manufacturing' },
    { step: '04', label: 'Finished Components' },
    { step: '05', label: 'Delivery Dispatch' },
  ];

  const packagingAspects = [
    { title: 'Component Protection', desc: 'Preventing surface scratches, thread damage, and impact during transport.' },
    { title: 'Environmental Protection', desc: 'Using anti-corrosion barrier films and moisture control for storage.' },
    { title: 'Part Identification', desc: 'Clear labeling of part numbers, batch IDs, and barcode tags for easy receiving.' },
    { title: 'Custom Crating', desc: 'Constructing sturdy wooden crates or pallet collared boxes for heavy metal parts.' },
  ];

  const connectedCapabilities = [
    {
      icon: Factory,
      title: 'Contract Manufacturing',
      description: 'Turnkey OEM component production and dedicated manufacturing lines.',
      href: '/contract-manufacturing',
      badge: 'TURNKEY',
    },
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
  ];

  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | Supply Chain"
        description="Learn about manufacturing supply chain coordination, material planning, inventory buffering, packaging protection, and delivery logistics."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="SUPPLY CHAIN"
        title="Connected Manufacturing. Reliable Supply."
        description="Successful manufacturing relies on coordinating raw materials, production planning, quality verification, inventory buffering, and delivery logistics to ensure component availability."
        primaryCtaText="Request a Quote"
        primaryCtaLink="/request-quote"
        secondaryCtaText="Explore Contract Manufacturing"
        secondaryCtaLink="/contract-manufacturing"
        imageUrl={supplyHeroImg}
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs
          items={[
            { label: 'Capabilities', href: '/contract-manufacturing' },
            { label: 'Supply Chain' },
          ]}
        />
      </Container>

      {/* Supply Chain Introduction */}
      <section className="py-4 bg-white border-y border-slate-200/80">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-mono font-bold uppercase">
              <Compass className="w-3.5 h-3.5 text-blue-600" /> MANUFACTURING COORDINATION
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Manufacturing Does Not End at the Machine.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Producing high-precision engineered components is only part of an industrial partnership. Reliable component supply requires synchronized coordination across raw material sourcing, shop-floor production planning, quality auditing, protective packaging, and delivery dispatch.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {coordinationElements.map((elem, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    {elem.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{elem.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Supply Chain Process */}
      <section className="py-12 bg-[#0B1E36] text-white border-y border-slate-800">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="CONCEPTUAL PROCESS"
            title="Conceptual Supply Chain Sequence."
            description="General roadmap for coordinating materials, manufacturing, and shipment."
            centered={true}
            className="[&_h2]:text-white [&_p]:text-slate-300"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {supplySteps.map((step) => (
              <div
                key={step.number}
                className="p-4 rounded-xl bg-[#0F2C59]/80 border border-slate-700/80 space-y-2 hover:border-emerald-400 transition-colors"
              >
                <div className="text-xs font-mono font-bold text-emerald-400">
                  STEP {step.number}
                </div>
                <h3 className="text-sm font-bold text-white">{step.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Supply Chain Coordination Image Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-mono font-bold uppercase">
                <Truck className="w-3.5 h-3.5" /> SUPPLY COORDINATION
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Coordinating Every Stage of the Supply Journey.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Effective supply coordination ensures that production schedules align with raw material lead times, batch quality approvals, and customer delivery targets.
              </p>

              <div className="space-y-3 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Production planning aligned with machine capacity</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Raw material availability and heat cert verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Inventory visibility across work-in-progress and finished stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Shipment preparation and custom protective packaging</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="SUPPLY CHAIN & LOGISTICS COORDINATION"
                subtitle="Production Planning & Inventory Management"
                badge="LOGISTICS COORDINATION"
                imageUrl={supplyCoordinationImg}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Material Coordination Section */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="MATERIAL PLANNING"
            title="Why Material Coordination Matters."
            description="Proactive material planning reduces production risk and maintains component delivery schedules."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {materialThemes.map((theme, idx) => (
              <div key={idx} className="p-6 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                <div className="text-xs font-mono font-bold text-blue-600 uppercase">
                  PILLAR {idx + 1}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{theme.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {theme.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Informational Inventory Connection Diagram */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="CONCEPTUAL FLOW"
            title="Connecting Manufacturing & Supply."
            description="Informational overview showing how component manufacturing connects to delivery."
          />

          <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center items-center">
              {inventoryFlow.map((flow, idx) => (
                <React.Fragment key={idx}>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="text-[10px] font-mono font-bold text-blue-600 uppercase">
                      STAGE {flow.step}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{flow.label}</h3>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Packaging & Delivery Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="SHIPMENT PREPARATION"
            title="Packaging & Component Protection."
            description="Ensuring precision-machined parts arrive at their destination without damage or corrosion."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {packagingAspects.map((pack, idx) => (
              <div key={idx} className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{pack.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{pack.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Connected Capabilities */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="CONNECTED CAPABILITIES"
            title="Explore Related Capabilities."
            description="Supply chain coordination supports all manufacturing, CNC, and assembly operations."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {connectedCapabilities.map((cap, idx) => (
              <CapabilityCard key={idx} {...cap} />
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-4">
        <Container>
          <div className="bg-[#0B1E36] text-white p-8 sm:p-12 rounded-2xl border border-slate-800 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Need a Manufacturing Supply Partner?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Talk with our team to discuss your component manufacturing and supply chain coordination needs.
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
