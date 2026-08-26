import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { HeroSection } from '../../components/public/HeroSection';
import { VisualPlaceholder } from '../../components/public/VisualPlaceholder';
import { CTASection } from '../../components/public/CTASection';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Button } from '../../components/ui/Button';
import {
  ShieldCheck,
  CheckCircle2,
  Ruler,
  FileCheck,
  Search,
  RotateCcw,
  ArrowRight,
  Layers,
} from 'lucide-react';

export const QualityPage: React.FC = () => {
  const qualityPillars = [
    {
      icon: Search,
      title: 'Incoming Material Verification',
      description: 'Raw material chemical and mechanical verification, checking mill test certificates before releasing stock to production.',
    },
    {
      icon: Layers,
      title: 'In-Process Dimensional Control',
      description: 'First-article inspection, first-piece signoff, and operator gauge checks during CNC machining runs.',
    },
    {
      icon: Ruler,
      title: '3D CMM Coordinate Inspection',
      description: 'Coordinate Measuring Machine (CMM) dimensional verification against complex CAD models and engineering drawings.',
    },
    {
      icon: FileCheck,
      title: 'Complete Batch Traceability',
      description: 'Full traceability linking component batch numbers with raw material heat numbers, operator logs, and inspection reports.',
    },
  ];

  const inspectionStages = [
    { stage: 'Stage 01', name: 'Material Receiving Audit', desc: 'Verify mill certificates, material dimensions, and surface condition.' },
    { stage: 'Stage 02', name: 'First Article Inspection (FAI)', desc: 'Complete dimensional audit of initial machined parts prior to volume run.' },
    { stage: 'Stage 03', name: 'In-Process Sampling', desc: 'Routine gauge audits during turning, milling, and grinding cycles.' },
    { stage: 'Stage 04', name: 'Final CMM Inspection', desc: 'Dimensional measurement report generated via 3D CMM probing.' },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | Quality & Testing"
        description="ISO-aligned quality management systems, Coordinate Measuring Machine (CMM) dimensional audits, and raw material traceability."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="QUALITY & TESTING"
        title="Precision Measurement & Quality Control Standards."
        description="Kolmeks integrates quality control into every stage of component fabrication. From incoming raw material verification to 3D CMM dimensional audits, quality is systematically built into our manufacturing processes."
        primaryCtaText="Request a Quote"
        primaryCtaLink="/request-quote"
        secondaryCtaText="Explore Capabilities"
        secondaryCtaLink="/cnc-machining"
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs items={[{ label: 'Quality & Testing' }]} />
      </Container>

      {/* Quality Overview */}
      <section className="py-4 bg-white border-y border-slate-200/80">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> SYSTEMATIC QUALITY
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Quality Built Into Every Stage of Production.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              We operate under a preventative quality philosophy. Rather than relying solely on final inspection, our quality procedures control dimensional variation during machining, tooling setup, and assembly.
            </p>
          </div>
        </Container>
      </section>

      {/* Quality Pillars Grid */}
      <section className="py-4">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="QUALITY MANAGEMENT"
            title="Key Quality Assurance Pillars."
            description="Structured controls maintaining component consistency and strict drawing compliance."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {qualityPillars.map((pillar, idx) => {
              const IconComp = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs hover:border-emerald-600 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                    <IconComp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{pillar.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Inspection Stages Workflow */}
      <section className="py-12 bg-[#0B1E36] text-white border-y border-slate-800">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="INSPECTION WORKFLOW"
            title="Four-Stage Quality Control Protocol."
            description="Our conceptual inspection roadmap ensures strict compliance from raw material to finished product."
            centered={true}
            className="[&_h2]:text-white [&_p]:text-slate-300"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {inspectionStages.map((stage, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-[#0F2C59]/80 border border-slate-700/80 space-y-3 hover:border-emerald-400 transition-colors"
              >
                <div className="text-xs font-mono font-bold text-emerald-400">
                  {stage.stage}
                </div>
                <h3 className="text-lg font-bold text-white">{stage.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{stage.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CMM & Measurement Detail */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-bold uppercase">
                <Ruler className="w-3.5 h-3.5" /> DIMENSIONAL AUDIT
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                High-Precision 3D CMM & Surface Profiling.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Coordinate Measuring Machine (CMM) technology enables detailed 3D dimensional auditing of complex geometries, hole patterns, concentricity, and surface flatness.
              </p>

              <div className="space-y-3 pt-2 text-sm text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>3D CAD model comparison & probing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Surface roughness & concentricity measurement</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custom inspection documentation upon request</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Calibrated micrometers, bore gauges & optical comparators</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="CMM COORDINATE MEASURING MACHINE"
                subtitle="3D Probing & Surface Profiling Laboratory"
                badge="QUALITY LAB"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  );
};
