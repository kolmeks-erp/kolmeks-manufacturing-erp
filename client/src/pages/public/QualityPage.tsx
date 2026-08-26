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
  CheckCircle2,
  Gauge,
  Ruler,
  FileCheck2,
  SearchCheck,
  Factory,
  Cpu,
  Cog,
  Truck,
} from 'lucide-react';
import qualityHeroImg from '../../assets/images/kolmeks-quality-hero.webp';
import qualityMeasurementImg from '../../assets/images/kolmeks-quality-measurement.webp';
import qualityInspectionImg from '../../assets/images/kolmeks-quality-inspection-process.webp';

export const QualityPage: React.FC = () => {
  const qualityPillars = [
    {
      icon: Ruler,
      title: 'Dimensional Verification',
      description: 'Verifying critical features, linear dimensions, and hole patterns using calibrated measurement instruments.',
    },
    {
      icon: Gauge,
      title: 'Surface Finish Inspection',
      description: 'Measuring surface roughness (Ra) on bearing journals, seal faces, and precision mating surfaces.',
    },
    {
      icon: FileCheck2,
      title: 'Material Traceability',
      description: 'Verifying raw material mill test certificates (EN 10204 3.1) and maintaining heat batch tracking.',
    },
    {
      icon: SearchCheck,
      title: 'First Article & Lot Audit',
      description: 'Conducting first-article inspection (FAI) and sampling audits prior to full batch production.',
    },
  ];

  const qualityStandards = [
    'ISO 9001 quality management system principles',
    'Full material heat traceability and 3.1 mill test certificates',
    'Calibrated digital micrometers, calipers, and height gauges',
    '3D Coordinate Measuring Machine (CMM) dimensional audits',
    'Final visual, burr, and surface cleanliness inspection',
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
      icon: Truck,
      title: 'Supply Chain Management',
      description: 'End-to-end material procurement, stock management, and delivery logistics.',
      href: '/supply-chain',
      badge: 'LOGISTICS',
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | Quality & Testing"
        description="Comprehensive quality assurance, dimensional inspection, material traceability, and CMM metrology for component manufacturing."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="QUALITY & TESTING"
        title="Precision Quality & Metrology Verification."
        description="Quality is integral to every machining and assembly process at Kolmeks. We maintain strict dimensional auditing, material certification tracking, and continuous quality control across all component manufacturing orders."
        primaryCtaText="Request a Quote"
        primaryCtaLink="/request-quote"
        secondaryCtaText="Explore Capabilities"
        secondaryCtaLink="/contract-manufacturing"
        imageUrl={qualityHeroImg}
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs
          items={[
            { label: 'Company', href: '/about' },
            { label: 'Quality & Testing' },
          ]}
        />
      </Container>

      {/* Overview Section */}
      <section className="py-4 bg-white border-y border-slate-200/80">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> QUALITY ASSURANCE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Zero Defect Commitment Across Every Batch.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Industrial clients require component consistency and drawing compliance. Our quality protocols combine advanced CMM probe measurement with manual gauge auditing to ensure every component meets specified geometric tolerances.
            </p>
          </div>
        </Container>
      </section>

      {/* Quality Pillars Grid */}
      <section className="py-4">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="METROLOGY & AUDITING"
            title="Quality Control Disciplines."
            description="Systematic quality auditing performed throughout raw material intake, machining, and final packing."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {qualityPillars.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs hover:border-emerald-600 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Measurement Metrology Visual Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-mono font-bold uppercase">
                <Ruler className="w-3.5 h-3.5 text-blue-600" /> METROLOGY INSTRUMENTS
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Calibrated Instruments & Digital Measurement.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Precision measurement relies on calibrated digital calipers, micrometers, and bore gauges. Every measuring tool undergoes regular calibration traceability checks to ensure measurement accuracy.
              </p>

              <div className="space-y-3 pt-2 text-sm text-slate-700 font-medium">
                {qualityStandards.map((std, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{std}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="CALIBRATED MEASUREMENT & GAGING"
                subtitle="Digital Micrometer & Caliper Measurement"
                badge="METROLOGY INSPECTION"
                imageUrl={qualityMeasurementImg}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Quality Process Inspection Image Section */}
      <section className="py-12 bg-[#0B1E36] text-white border-y border-slate-800">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="IN-PROCESS COMPONENT AUDIT"
                subtitle="Continuous Shop-Floor Quality Verification"
                badge="QUALITY INSPECTION"
                imageUrl={qualityInspectionImg}
              />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold uppercase">
                <SearchCheck className="w-3.5 h-3.5 text-emerald-400" /> SHOP-FLOOR QUALITY
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                In-Process Inspections & Audit Trails.
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                Machinists and quality engineers verify component dimensions after initial CNC setup and perform continuous sampling throughout production runs to prevent batch deviations.
              </p>

              <div className="space-y-3 pt-2 text-sm text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>First-article inspection (FAI) report generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>In-process feature sampling during CNC production</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Final pre-packaging visual and dimensional sign-off</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Connected Capabilities */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="CONNECTED CAPABILITIES"
            title="Explore Related Capabilities."
            description="Quality control supports all CNC machining, assembly, and contract manufacturing services."
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
              Have Specific Quality & Inspection Requirements?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Submit your engineering drawings and inspection criteria to discuss component manufacturing with our team.
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
