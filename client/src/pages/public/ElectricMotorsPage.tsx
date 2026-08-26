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
  Zap,
  Cog,
  Truck,
  Factory,
  Layers,
  Activity,
  Ruler,
  Compass,
  FileText,
  Boxes,
} from 'lucide-react';
import motorsHeroImg from '../../assets/images/kolmeks-electric-motors-hero.webp';
import motorComponentsImg from '../../assets/images/kolmeks-electric-motor-components.webp';
import motorQualityImg from '../../assets/images/kolmeks-electric-motor-quality.webp';

export const ElectricMotorsPage: React.FC = () => {
  const introductionPoints = [
    { title: 'Component Geometry', desc: 'Concentricity, cylindrical symmetry, and precise feature locations.' },
    { title: 'Material Selection', desc: 'Choosing appropriate steel alloys, aluminum, cast iron, or laminations.' },
    { title: 'Dimensional Accuracy', desc: 'Meeting defined engineering drawing tolerances for reliable fitment.' },
    { title: 'Surface Requirements', desc: 'Controlled surface roughness (Ra) on bearing journals and seal seats.' },
    { title: 'Sub-Assembly Integration', desc: 'Fitting stator packs, shafts, bearings, and protective housings.' },
    { title: 'Inspection & Verification', desc: 'Measuring runout, dimensional limits, and visual cleanliness.' },
  ];

  const capabilityItems = [
    {
      icon: Cpu,
      title: 'Precision Machined Components',
      description: 'Machining precision rotational and stationary parts to exact technical drawing specifications.',
      link: '/cnc-machining',
      linkText: 'Explore CNC Machining',
    },
    {
      icon: Layers,
      title: 'Motor Housings',
      description: 'Machining cast iron and aluminum motor frames, stator housings, and end shields.',
      link: '/contract-manufacturing',
      linkText: 'Contract Manufacturing',
    },
    {
      icon: Activity,
      title: 'Drive Shafts',
      description: 'Precision turning, keyway milling, and journal grinding for electric drive shafts.',
      link: '/cnc-machining',
      linkText: 'Machining Capabilities',
    },
    {
      icon: Cog,
      title: 'Mechanical Components',
      description: 'Fabricating motor flanges, bearing covers, seal retainers, and mounting brackets.',
      link: '/contract-manufacturing',
      linkText: 'OEM Partnerships',
    },
    {
      icon: Boxes,
      title: 'Assembly Support',
      description: 'Sub-assembling rotor shafts, bearings, and stator housings into modular sub-systems.',
      link: '/assembly',
      linkText: 'Explore Assembly',
    },
    {
      icon: ShieldCheck,
      title: 'Inspection & Testing',
      description: 'Dimensional checks, dial indicator runout measurement, and quality documentation.',
      link: '/quality',
      linkText: 'Quality Standards',
    },
  ];

  const conceptualSteps = [
    { number: '01', title: 'Requirement', desc: 'Reviewing customer drawings and component parameters.' },
    { number: '02', title: 'Engineering Review', desc: 'Evaluating process planning, tooling, and material specs.' },
    { number: '03', title: 'Component Manufacturing', desc: 'Executing CNC turning, milling, and grinding routines.' },
    { number: '04', title: 'Inspection', desc: 'Measuring critical feature dimensions against requirements.' },
    { number: '05', title: 'Assembly Support', desc: 'Performing sub-assembly or press-fitting where requested.' },
    { number: '06', title: 'Final Verification', desc: 'Conducting final visual audit and packing for dispatch.' },
  ];

  const applicationExamples = [
    { title: 'Industrial Motors', desc: 'Components for general-purpose AC/DC induction motors and drives.' },
    { title: 'Electrical Equipment', desc: 'Machined parts for transformers, switchgear, and power generators.' },
    { title: 'Machinery Drives', desc: 'Precision shafts and housings for machine tool feed drives and pumps.' },
    { title: 'Motion Systems', desc: 'Rotational components for automated conveyor drives and actuators.' },
    { title: 'Power Equipment', desc: 'Heavy-duty motor frames and flanges for industrial fluid handling.' },
  ];

  const engineeringParameters = [
    { label: 'Technical Drawing', detail: '2D PDF or DWG with dimensional tolerances and surface finishes.' },
    { label: 'Raw Material', detail: 'Specific alloy grade (steel, aluminum, ductile iron, brass).' },
    { label: 'Production Quantity', detail: 'Initial batch size and anticipated annual volume.' },
    { label: 'Dimensional Limits', detail: 'Critical feature callouts requiring strict measurement.' },
    { label: 'Surface Finish', detail: 'Specified Ra roughness targets on bearing fits and seals.' },
    { label: 'Sub-Assembly Needs', detail: 'Hardware press-fitting or seal installation requirements.' },
    { label: 'Inspection Protocol', detail: 'Specialized measurement reports or mill test cert requests.' },
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
        title="Kolmeks | Electric Motors & Components"
        description="Learn about precision machining, sub-assembly, material selection, and quality requirements for electric motor components and drive systems."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="ELECTRIC MOTORS & COMPONENTS"
        title="Precision Components for Electric Motor Applications."
        description="Electric motor systems rely on accurately manufactured components such as housings, shafts, rotors, stators, and related precision parts built to engineering specifications."
        primaryCtaText="Request a Quote"
        primaryCtaLink="/request-quote"
        secondaryCtaText="Explore CNC Machining"
        secondaryCtaLink="/cnc-machining"
        imageUrl={motorsHeroImg}
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs
          items={[
            { label: 'Capabilities', href: '/contract-manufacturing' },
            { label: 'Electric Motors & Components' },
          ]}
        />
      </Container>

      {/* Electric Motor Introduction */}
      <section className="py-4 bg-white border-y border-slate-200/80">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-mono font-bold uppercase">
              <Compass className="w-3.5 h-3.5 text-blue-600" /> ENGINEERED COMPONENTS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Precision at the Core of Electric Motor Performance.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Electric motor performance depends on the precise interaction and dimensional accuracy of multiple internal and structural components. Achieving smooth rotation, low vibration, and long operating life requires careful material selection, tight geometric concentricity, and rigorous inspection during manufacturing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {introductionPoints.map((pt, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    {pt.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{pt.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Component Image Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-bold uppercase">
                <Zap className="w-3.5 h-3.5" /> MOTOR COMPONENTS
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Manufactured Around Critical Component Requirements.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Electric motor systems can include components such as turned drive shafts, cast iron or aluminum housings, rotor assemblies, stators, bearing covers, and precision mechanical fittings.
              </p>

              <div className="space-y-3 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Rotor shafts turned and ground to specified tolerances</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Stator housings bored for precise concentric alignment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>End shields and bearing caps designed for tight fitment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Mechanical sub-assemblies prepared for motor integration</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="ELECTRIC MOTOR COMPONENT FABRICATION"
                subtitle="Shafts, Housings, Rotors & Mechanical Fittings"
                badge="COMPONENT MANUFACTURING"
                imageUrl={motorComponentsImg}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Component Capability Grid */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="MANUFACTURING DISCIPLINES"
            title="Motor Component Capability Categories."
            description="General categories of precision manufacturing operations utilized for electric drive systems."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilityItems.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs hover:border-blue-600 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0F2C59] flex items-center justify-center font-bold">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={item.link}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <span>{item.linkText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Conceptual Manufacturing Workflow */}
      <section className="py-12 bg-[#0B1E36] text-white border-y border-slate-800">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="CONCEPTUAL WORKFLOW"
            title="Conceptual Component Manufacturing Process."
            description="General sequence from customer drawing review to final component verification."
            centered={true}
            className="[&_h2]:text-white [&_p]:text-slate-300"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {conceptualSteps.map((step) => (
              <div
                key={step.number}
                className="p-4 rounded-xl bg-[#0F2C59]/80 border border-slate-700/80 space-y-2 hover:border-blue-500 transition-colors"
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

      {/* Electric Motor Quality Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="QUALITY & RUNOUT INSPECTION"
                subtitle="Dimensional Verification & Surface Checks"
                badge="QUALITY CONTROL"
                imageUrl={motorQualityImg}
              />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> QUALITY ASSURANCE
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Precision Components. Consistent Requirements.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Quality control for electric motor components ensures that every shaft, housing, and flange adheres to defined drawing dimensions, surface specifications, and functional alignment goals.
              </p>

              <div className="space-y-3 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dimensional measurement against technical drawings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Component feature consistency across production lots</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Material certificate verification where specified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Visual inspection for burrs, scratches, or surface defects</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sub-assembly fitment verification before packaging</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Electric Motor Applications */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="APPLICATION EXAMPLES"
            title="Relevant Application Areas."
            description="Examples of industrial areas where precision motor components are frequently utilized."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {applicationExamples.map((app, idx) => (
              <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                <h3 className="font-bold text-slate-900 text-sm text-blue-600 font-mono">
                  {app.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{app.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Engineering Considerations Section */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="ENGINEERING CONSIDERATIONS"
            title="The Details Matter."
            description="Key technical information that assists engineers in evaluating component manufacturing feasibility."
          />

          <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              When evaluating a motor component project, reviewing complete engineering data ensures accurate process planning and cost estimation:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {engineeringParameters.map((param, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    {param.label}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{param.detail}</p>
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
            description="Electric motor component fabrication connects directly with CNC machining, assembly, and contract manufacturing."
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
              Looking for Precision Motor Components?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Submit your component drawings or technical parameters to discuss manufacturing with our engineering team.
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
