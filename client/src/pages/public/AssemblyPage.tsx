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
  Cog,
  Zap,
  Truck,
  Factory,
  Wrench,
  Gauge,
  Layers,
  Plus,
  Equal,
} from 'lucide-react';
import assemblyHeroImg from '../../assets/images/kolmeks-assembly-hero.webp';
import assemblyQualityImg from '../../assets/images/kolmeks-assembly-quality.webp';

export const AssemblyPage: React.FC = () => {
  const assemblyInvolvements = [
    { title: 'Component Preparation', desc: 'Deburring, cleaning, and organizing components prior to assembly.' },
    { title: 'Component Alignment', desc: 'Positioning individual parts to exact positional and rotational tolerances.' },
    { title: 'Fastening & Joining', desc: 'Securing components using mechanical fasteners, press fits, or adhesives.' },
    { title: 'Sub-Assembly', desc: 'Combining groups of components into intermediate modular units.' },
    { title: 'Inspection', desc: 'Verifying dimensional fit, clearance, and proper component orientation.' },
    { title: 'Final Verification', desc: 'Conducting functional or visual checks before protective packaging.' },
  ];

  const assemblyCapabilities = [
    {
      icon: Cog,
      title: 'Component Assembly',
      description: 'General assembly operations combining individual manufactured parts into defined sub-structures.',
    },
    {
      icon: Layers,
      title: 'Sub-Assembly',
      description: 'Building modular intermediate sub-assemblies for direct integration into client production lines.',
    },
    {
      icon: Wrench,
      title: 'Mechanical Assembly',
      description: 'Assembling mechanical components, housings, shafts, bearings, and structural fasteners.',
    },
    {
      icon: Gauge,
      title: 'Final Assembly',
      description: 'Completing multi-stage component joining and integration according to drawing requirements.',
    },
    {
      icon: ShieldCheck,
      title: 'Inspection & Verification',
      description: 'Structured visual and physical verification checks performed throughout the assembly process.',
    },
  ];

  const workflowSteps = [
    { number: '01', title: 'Preparation', desc: 'Organize and inspect individual component lots.' },
    { number: '02', title: 'Planning', desc: 'Establish assembly sequence and fastening criteria.' },
    { number: '03', title: 'Assembly', desc: 'Perform component alignment, press-fitting, and joining.' },
    { number: '04', title: 'Inspection', desc: 'Verify torque specifications, alignment, and gaps.' },
    { number: '05', title: 'Verification', desc: 'Conduct functional visual checks where required.' },
    { number: '06', title: 'Delivery', desc: 'Apply protective packaging and prepare for shipment.' },
  ];

  const qualityPoints = [
    { title: 'Correct Components', desc: 'Verifying component part numbers and revision levels prior to assembly.' },
    { title: 'Correct Assembly Sequence', desc: 'Following defined step-by-step procedures to avoid assembly stress.' },
    { title: 'Alignment & Fitment', desc: 'Ensuring tight-tolerance alignments, clearances, and concentricity.' },
    { title: 'Fastening Control', desc: 'Applying controlled mechanical fastening according to engineering requirements.' },
    { title: 'Visual & Functional Audit', desc: 'Conducting thorough visual audits and operational checks where specified.' },
  ];

  const partnershipSteps = [
    { step: '01', name: 'Requirement' },
    { step: '02', name: 'Engineering' },
    { step: '03', name: 'Component Mfg' },
    { step: '04', name: 'Assembly' },
    { step: '05', name: 'Quality' },
    { step: '06', name: 'Delivery' },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | Component Assembly"
        description="Learn about component sub-assembly, mechanical assembly processes, quality verification, and turnkey contract manufacturing integration."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="ASSEMBLY"
        title="From Precision Components to Complete Assemblies."
        description="Assembly brings manufactured components together into finished or partially finished sub-systems according to defined engineering specifications and assembly requirements."
        primaryCtaText="Request a Quote"
        primaryCtaLink="/request-quote"
        secondaryCtaText="Explore Contract Manufacturing"
        secondaryCtaLink="/contract-manufacturing"
        imageUrl={assemblyHeroImg}
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs
          items={[
            { label: 'Capabilities', href: '/contract-manufacturing' },
            { label: 'Assembly' },
          ]}
        />
      </Container>

      {/* Assembly Introduction */}
      <section className="py-4 bg-white border-y border-slate-200/80">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-mono font-bold uppercase">
              <Cog className="w-3.5 h-3.5 text-blue-600" /> INTEGRATED MANUFACTURING
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Precision Continues Beyond Machining.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Industrial component manufacturing frequently extends beyond producing individual machined parts. Modern sub-assembly operations combine machining precision with controlled component alignment, fastening, and verification to deliver ready-to-integrate sub-systems directly to assembly lines.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {assemblyInvolvements.map((inv, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    {inv.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{inv.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Assembly Capabilities */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="CAPABILITY OVERVIEW"
            title="Assembly Capability Categories."
            description="General categories of assembly operations commonly performed in component manufacturing."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assemblyCapabilities.map((cap, idx) => {
              const IconComp = cap.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs hover:border-blue-600 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0F2C59] flex items-center justify-center font-bold">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{cap.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Assembly Workflow Timeline */}
      <section className="py-12 bg-[#0B1E36] text-white border-y border-slate-800">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="ASSEMBLY WORKFLOW"
            title="Conceptual Assembly Sequence."
            description="General steps involved in assembling manufactured components."
            centered={true}
            className="[&_h2]:text-white [&_p]:text-slate-300"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {workflowSteps.map((step) => (
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

      {/* Component Integration Technical Graphic */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="COMPONENT INTEGRATION"
            title="Systematic Component Integration."
            description="Combining manufactured and hardware elements into unified sub-systems."
          />

          <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center text-center">
              <div className="md:col-span-2 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <Cpu className="w-6 h-6 text-blue-600 mx-auto" />
                <h3 className="font-bold text-slate-900 text-sm">Machined Components</h3>
                <p className="text-xs text-slate-500">Custom turned & milled parts</p>
              </div>

              <div className="flex justify-center text-slate-400">
                <Plus className="w-6 h-6" />
              </div>

              <div className="md:col-span-2 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <Wrench className="w-6 h-6 text-blue-600 mx-auto" />
                <h3 className="font-bold text-slate-900 text-sm">Hardware & Fasteners</h3>
                <p className="text-xs text-slate-500">Seals, bearings & fittings</p>
              </div>

              <div className="flex justify-center text-slate-400">
                <Equal className="w-6 h-6 text-blue-600 font-bold" />
              </div>

              <div className="md:col-span-1 p-5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <Cog className="w-6 h-6 text-blue-700 mx-auto" />
                <h3 className="font-bold text-blue-900 text-sm">Finished Sub-System</h3>
                <p className="text-xs text-blue-700">Verified assembly</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Assembly Quality Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> ASSEMBLY QUALITY
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Quality at Every Connection.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Quality assurance during assembly ensures that every component is correctly oriented, properly aligned, and securely fastened according to engineering guidelines.
              </p>

              <div className="space-y-3 pt-2 text-xs font-medium text-slate-700">
                {qualityPoints.map((qp, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">{qp.title}: </span>
                      <span className="text-slate-600">{qp.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="ASSEMBLY VERIFICATION & TESTING"
                subtitle="Torque Check & Clearance Alignment"
                badge="ASSEMBLY QUALITY"
                imageUrl={assemblyQualityImg}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Manufacturing Partnership Link Section */}
      <section className="py-4">
        <Container>
          <div className="p-8 sm:p-10 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono font-bold uppercase">
              <Factory className="w-3.5 h-3.5" /> CONTRACT MANUFACTURING PARTNERSHIP
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Connecting Assembly with Contract Manufacturing.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Assembly can function as an integrated phase within full-scope contract manufacturing, allowing OEM clients to receive fully assembled sub-systems directly from a single manufacturing partner.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              {partnershipSteps.map((ps, idx) => (
                <div key={idx} className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg text-center">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold">{ps.step}</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">{ps.name}</div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link to="/contract-manufacturing">
                <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Contract Manufacturing
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Assembly Final CTA */}
      <section className="py-4">
        <Container>
          <div className="bg-[#0B1E36] text-white p-8 sm:p-12 rounded-2xl border border-slate-800 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Looking for More Than Individual Components?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Talk with our team to discuss your component assembly and manufacturing requirements.
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
