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
  Settings,
  Cog,
  Zap,
  Truck,
  Layers,
  Ruler,
  Wrench,
  Factory,
  HelpCircle,
  FileCheck,
  Compass,
} from 'lucide-react';
import cncHeroImg from '../../assets/images/kolmeks-cnc-machining-hero.webp';
import cncPrecisionImg from '../../assets/images/kolmeks-cnc-precision-component.webp';
import cncQualityImg from '../../assets/images/kolmeks-cnc-quality-inspection.webp';

export const CncMachiningPage: React.FC = () => {
  const conceptualWorkflow = [
    { step: '01', title: 'Engineering Data', text: 'Review of engineering drawing or 3D CAD model specifications.' },
    { step: '02', title: 'Process Planning', text: 'Determining machining strategy, tooling paths, and workholding setup.' },
    { step: '03', title: 'CNC Programming', text: 'Translating design data into G-code digital equipment instructions.' },
    { step: '04', title: 'Material Prep', text: 'Selecting certified raw bar stock, plate, casting, or forging stock.' },
    { step: '05', title: 'Machining', text: 'Executing computer-controlled material removal operations.' },
    { step: '06', title: 'Inspection', text: 'Verifying final dimensions and surface finish against requirements.' },
  ];

  const generalOperations = [
    { title: 'Milling', desc: 'Removing material using rotating multi-flute cutters across multi-axis vectors.' },
    { title: 'Turning', desc: 'Rotating the workpiece against stationary cutting tools for cylindrical geometry.' },
    { title: 'Drilling & Boring', desc: 'Creating and enlarging internal cylindrical holes with axial precision.' },
    { title: 'Threading & Tapping', desc: 'Forming external or internal thread profiles to defined standards.' },
    { title: 'Cutting & Facing', desc: 'Squaring ends, parting off stock, or producing smooth planar surfaces.' },
    { title: 'Precision Machining', desc: 'Combining multi-pass operations to achieve defined geometric profiles.' },
  ];

  const capabilityCategories = [
    {
      icon: Cpu,
      title: 'Milling Operations',
      description: 'Typical CNC milling capabilities include machining flat surfaces, slots, pockets, and complex 3D contours.',
    },
    {
      icon: Settings,
      title: 'Turning Operations',
      description: 'Typical CNC turning capabilities produce cylindrical components, shafts, bushings, and rotational features.',
    },
    {
      icon: Wrench,
      title: 'Drilling & Boring',
      description: 'Precision hole-making processes ensuring accurate center locations, concentricity, and diameter control.',
    },
    {
      icon: Layers,
      title: 'Precision Machining',
      description: 'Integrated multi-operation machining configured to manufacture engineered components to drawing specifications.',
    },
    {
      icon: Ruler,
      title: 'Component Finishing',
      description: 'Post-machining processes such as deburring, surface smoothing, and secondary finishing operations.',
    },
    {
      icon: ShieldCheck,
      title: 'Inspection & Verification',
      description: 'Dimensional and visual verification procedures conducted throughout the manufacturing process.',
    },
  ];

  const commonMaterials = [
    { category: 'Aluminum', note: 'Lightweight alloys commonly used for structural frames and housings.' },
    { category: 'Steel Alloys', note: 'Carbon and alloy steels providing high strength and wear resistance.' },
    { category: 'Stainless Steel', note: 'Corrosion-resistant grades suitable for fluid handling and harsh environments.' },
    { category: 'Brass & Copper', note: 'Non-ferrous metals valued for machinability, conductivity, and corrosion resistance.' },
    { category: 'Engineering Metals', note: 'Cast iron, ductile iron, and specialized metals tailored to functional demands.' },
  ];

  const evaluationRequirements = [
    { item: 'Technical Drawing', desc: 'Detailed 2D engineering drawing with dimensional callouts.' },
    { item: '3D CAD Model', desc: 'Digital STEP or IGES geometry file for CAM toolpath planning.' },
    { item: 'Material Grade', desc: 'Specified raw material alloy and heat treatment state.' },
    { item: 'Production Quantity', desc: 'Estimated batch size or annual demand requirements.' },
    { item: 'Surface & Finish', desc: 'Defined surface roughness (Ra) and secondary coating specs.' },
    { item: 'Tolerance Targets', desc: 'Critical feature dimensions requiring special control.' },
    { item: 'Delivery Schedule', desc: 'Target lead time or production delivery schedule.' },
    { item: 'Inspection Protocol', desc: 'Specialized quality reports or material certificate requests.' },
  ];

  const timelineSteps = [
    { number: '01', title: 'Drawing / CAD', desc: 'Submit technical drawings or digital model files.' },
    { number: '02', title: 'Process Planning', desc: 'Establish tooling strategy and sequence.' },
    { number: '03', title: 'Programming', desc: 'Generate G-code machining instructions.' },
    { number: '04', title: 'Machining', desc: 'Execute computer-controlled cutting routines.' },
    { number: '05', title: 'Inspection', desc: 'Measure dimensions against drawing requirements.' },
    { number: '06', title: 'Delivery', desc: 'Package and dispatch finished components.' },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | CNC Machining"
        description="Learn about CNC machining, precision manufacturing principles, material selection, quality control, and engineered components for industrial applications."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="CNC MACHINING"
        title="Precision Machining for Engineered Components."
        description="CNC machining uses computer-controlled manufacturing equipment to produce precision components according to defined digital instructions, technical drawings, and engineering requirements."
        primaryCtaText="Request a Quote"
        primaryCtaLink="/request-quote"
        secondaryCtaText="Contact Us"
        secondaryCtaLink="/contact"
        imageUrl={cncHeroImg}
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs
          items={[
            { label: 'Capabilities', href: '/contract-manufacturing' },
            { label: 'CNC Machining' },
          ]}
        />
      </Container>

      {/* CNC Introduction */}
      <section className="py-4 bg-white border-y border-slate-200/80">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-mono font-bold uppercase">
              <Compass className="w-3.5 h-3.5 text-blue-600" /> PRECISION MANUFACTURING
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              From Engineering Data to Precision Components.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              In modern industrial manufacturing, component production relies on converting engineering specifications into physical parts with repeatable accuracy. Through structured process planning, digital toolpath programming, material preparation, and quality control, machining transforms raw metal into functional engineered components.
            </p>
          </div>
        </Container>
      </section>

      {/* What is CNC Machining Educational Section */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="EDUCATIONAL OVERVIEW"
            title="What Is CNC Machining?"
            description="Computer Numerical Control (CNC) refers to the automated control of machining tools using software instructions."
          />

          <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
            <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
              A CNC machine reads digital code (typically G-code) derived from CAD/CAM software to control the movement, rotational speed, feed rate, and position of cutting tools. Typical CNC machining processes include:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generalOperations.map((op, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    {op.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{op.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CNC Capability Section Grid */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="MACHINING CATEGORIES"
            title="Typical Machining Capability Categories."
            description="General categories of machining operations commonly utilized in precision manufacturing."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilityCategories.map((cap, idx) => {
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

      {/* CNC Precision Component Image Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-bold uppercase">
                <Layers className="w-3.5 h-3.5" /> ENGINEERED COMPONENTS
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Precision Where It Matters.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Fabricating engineered components requires strict attention to dimensional requirements, feature repeatability, surface roughness specifications, and material characteristics.
              </p>

              <div className="space-y-3 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Dimensional compliance with technical drawings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Feature repeatability across production batches</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Controlled surface roughness and finishing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Material composition integrity and verification</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="PRECISION ENGINEERED COMPONENTS"
                subtitle="High-Accuracy Rotational & Prismatic Parts"
                badge="ENGINEERED COMPONENTS"
                imageUrl={cncPrecisionImg}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* CNC Materials Section */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="MATERIAL SELECTION"
            title="Common CNC Machining Materials."
            description="Selecting appropriate raw materials is essential for meeting structural and environmental requirements."
          />

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Common CNC machining materials can include a wide variety of metals and alloys based on component application demands:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {commonMaterials.map((mat, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm text-blue-600 font-mono">
                    {mat.category}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{mat.note}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CNC Engineering Requirements Section */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="TECHNICAL EVALUATION"
            title="Evaluating a Machining Requirement."
            description="Key technical details that help a manufacturing partner review and quote a machining project."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {evaluationRequirements.map((req, idx) => (
              <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                <div className="text-xs font-mono font-bold text-slate-500 uppercase">
                  PARAM {idx + 1}
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{req.item}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{req.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CNC Quality Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="QUALITY CONTROL & INSPECTION"
                subtitle="Dimensional Verification & Compliance Audit"
                badge="QUALITY CONTROL"
                imageUrl={cncQualityImg}
              />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> QUALITY CONTROL
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Every Component Should Meet the Defined Requirement.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Quality assurance in precision machining involves verifying that finished components adhere strictly to defined engineering specifications through structured inspection procedures.
              </p>

              <div className="space-y-3 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dimensional inspection against engineering drawings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Visual inspection for burrs and surface anomalies</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Calibrated measurement verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Quality documentation and batch traceability where required</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CNC Visual Workflow Timeline */}
      <section className="py-12 bg-[#0B1E36] text-white border-y border-slate-800">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="TYPICAL WORKFLOW"
            title="Conceptual CNC Production Sequence."
            description="General roadmap from initial technical data to component shipment."
            centered={true}
            className="[&_h2]:text-white [&_p]:text-slate-300"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {timelineSteps.map((step) => (
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

      {/* CNC Final CTA */}
      <section className="py-4">
        <Container>
          <div className="bg-[#0B1E36] text-white p-8 sm:p-12 rounded-2xl border border-slate-800 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Have a Precision Machining Requirement?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Submit your engineering drawings and project parameters to discuss component production with our team.
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
