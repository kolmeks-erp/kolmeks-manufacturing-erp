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
  Compass,
  ArrowDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import qualityHeroImg from '../../assets/images/kolmeks-quality-hero.webp';
import qualityMeasurementImg from '../../assets/images/kolmeks-quality-measurement.webp';
import qualityInspectionImg from '../../assets/images/kolmeks-quality-inspection-process.webp';

export const QualityPage: React.FC = () => {
  const qualityRelationship = [
    { title: 'Customer Requirements', desc: 'Understanding defined tolerances, surface finishes, and delivery expectations.' },
    { title: 'Engineering Information', desc: 'Translating drawings and CAD models into clear process sequences.' },
    { title: 'Material Selection', desc: 'Procuring certified raw stock that matches mechanical specifications.' },
    { title: 'Manufacturing Process', desc: 'Executing CNC machining and sub-assembly routines consistently.' },
    { title: 'Inspection & Audit', desc: 'Evaluating manufactured parts against engineering requirements.' },
    { title: 'Final Verification', desc: 'Confirming packaging protection and documentation completeness before shipping.' },
  ];

  const qualityPrinciples = [
    {
      number: '01',
      title: 'Defined Requirements',
      desc: 'Manufacturing begins with understanding the required specifications and tolerances.',
    },
    {
      number: '02',
      title: 'Process Control',
      desc: 'Manufacturing processes should be controlled consistently across production runs.',
    },
    {
      number: '03',
      title: 'Inspection',
      desc: 'Components can be evaluated against relevant engineering drawing requirements.',
    },
    {
      number: '04',
      title: 'Continuous Improvement',
      desc: 'Manufacturing processes can be reviewed and improved over time to enhance reliability.',
    },
  ];

  const inspectionSteps = [
    { number: '01', title: 'Requirement Review', desc: 'Verify drawing tolerances, features, and critical callouts.' },
    { number: '02', title: 'Component Inspection', desc: 'Position parts on inspection granite surface or setup fixture.' },
    { number: '03', title: 'Measurement', desc: 'Take dimensional readings using appropriate measuring tools.' },
    { number: '04', title: 'Result Evaluation', desc: 'Compare measured data against drawing upper/lower limits.' },
    { number: '05', title: 'Documentation', desc: 'Record inspection data or quality verification logs.' },
    { number: '06', title: 'Final Verification', desc: 'Confirm part condition and clear for protective packaging.' },
  ];

  const traceabilityElements = [
    { title: 'Component Identification', desc: 'Batch tagging or part number marking to track manufactured lots.' },
    { title: 'Manufacturing Information', desc: 'Recording machine IDs, operator logs, and production timestamps.' },
    { title: 'Inspection Records', desc: 'Archiving dimensional measurement readings and audit logs.' },
    { title: 'Material Information', desc: 'Linking components back to raw stock mill test certificates.' },
    { title: 'Quality Documentation', desc: 'Providing certificate of compliance documents when requested.' },
  ];

  const manufacturingJourney = [
    { step: '01', label: 'Engineering' },
    { step: '02', label: 'Material' },
    { step: '03', label: 'Machining' },
    { step: '04', label: 'Assembly' },
    { step: '05', label: 'Inspection' },
    { step: '06', label: 'Delivery' },
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
        title="Kolmeks | Quality & Precision Manufacturing"
        description="Learn about quality control principles, dimensional measurement tools, inspection workflows, component traceability, and manufacturing verification."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="QUALITY"
        title="Precision You Can Measure."
        description="Quality is an essential phase of component manufacturing. Producing reliable engineered parts requires evaluating components against defined technical drawings, maintaining process consistency, and verifying dimensions."
        primaryCtaText="Request a Quote"
        primaryCtaLink="/request-quote"
        secondaryCtaText="Explore CNC Machining"
        secondaryCtaLink="/cnc-machining"
        imageUrl={qualityHeroImg}
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs
          items={[
            { label: 'Quality' },
          ]}
        />
      </Container>

      {/* Quality Introduction */}
      <section className="py-4 bg-white border-y border-slate-200/80">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> DEFINED REQUIREMENTS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Quality Begins With Defined Requirements.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Industrial component quality relies on alignment between customer specifications, engineering planning, certified raw materials, controlled manufacturing processes, thorough inspection, and final packaging verification.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {qualityRelationship.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Quality Principles Grid */}
      <section className="py-4">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="QUALITY FOUNDATION"
            title="Four Principles of Manufacturing Quality."
            description="Core principles guiding component manufacturing, dimensional verification, and process evaluation."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {qualityPrinciples.map((pr, idx) => (
              <div key={idx} className="p-6 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs hover:border-emerald-600 transition-colors">
                <div className="text-xs font-mono font-bold text-emerald-600">
                  PRINCIPLE {pr.number}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{pr.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {pr.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Quality Measurement Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-mono font-bold uppercase">
                <Ruler className="w-3.5 h-3.5 text-blue-600" /> PRECISION MEASUREMENT
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                The Details Matter.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Precision manufacturing may involve measurement tools such as digital calipers, outside micrometers, bore gauges, height gauges, dial indicators, and coordinate measurement equipment to verify feature geometries.
              </p>

              <div className="space-y-3 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Dimensional inspection of diameters, lengths, and hole positions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Surface roughness (Ra) measurement on bearing journals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Concentricity and runout checks on rotational shafts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Visual audit for burrs, sharp edges, and surface finish</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="DIMENSIONAL MEASUREMENT & INSTRUMENTATION"
                subtitle="Micrometers, Calipers & Feature Gauging"
                badge="PRECISION MEASUREMENT"
                imageUrl={qualityMeasurementImg}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Conceptual Inspection Process */}
      <section className="py-12 bg-[#0B1E36] text-white border-y border-slate-800">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="INSPECTION PROCESS"
            title="Checking the Component Against the Requirement."
            description="Conceptual sequence for evaluating component dimensions against technical drawings."
            centered={true}
            className="[&_h2]:text-white [&_p]:text-slate-300"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {inspectionSteps.map((step) => (
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

      {/* Traceability Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="SHOP-FLOOR QUALITY & TRACEABILITY AUDIT"
                subtitle="Material Certificates & Measurement Records"
                badge="COMPONENT TRACEABILITY"
                imageUrl={qualityInspectionImg}
              />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold uppercase">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" /> MATERIAL TRACEABILITY
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Traceability Across Component Production.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Maintaining component traceability connects finished parts back to raw material certificates, manufacturing batch numbers, and inspection records.
              </p>

              <div className="space-y-3 pt-2 text-xs font-medium text-slate-700">
                {traceabilityElements.map((elem, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">{elem.title}: </span>
                      <span className="text-slate-600">{elem.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Quality Throughout Manufacturing Flow */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="MANUFACTURING JOURNEY"
            title="Quality Throughout Manufacturing."
            description="Quality considerations exist across every stage of component production—not only at final inspection."
          />

          <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              {manufacturingJourney.map((j, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="text-[10px] font-mono font-bold text-emerald-600 uppercase">
                    PHASE {j.step}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{j.label}</h3>
                </div>
              ))}
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
            description="Quality assurance supports all CNC machining, sub-assembly, and contract manufacturing services."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {connectedCapabilities.map((cap, idx) => (
              <CapabilityCard key={idx} {...cap} />
            ))}
          </div>
        </Container>
      </section>

      {/* Final Quality CTA */}
      <section className="py-4">
        <Container>
          <div className="bg-[#0B1E36] text-white p-8 sm:p-12 rounded-2xl border border-slate-800 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Have a Quality-Critical Manufacturing Requirement?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Talk with our team to discuss your component specifications, inspection requirements, and manufacturing drawings.
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
