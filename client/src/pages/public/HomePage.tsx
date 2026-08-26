import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Factory, 
  Cpu, 
  Boxes, 
  Zap, 
  Truck, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Badge } from '../../components/ui/Badge';
import { SEO } from '../../components/public/SEO';
import { HeroSection } from '../../components/public/HeroSection';
import { CapabilityCard } from '../../components/public/CapabilityCard';
import { ProcessSection } from '../../components/public/ProcessSection';
import { QualitySection } from '../../components/public/QualitySection';
import { GlobalPresenceSection } from '../../components/public/GlobalPresenceSection';
import { IndustriesSection } from '../../components/public/IndustriesSection';
import { WhyKolmeksSection } from '../../components/public/WhyKolmeksSection';
import { StatCard } from '../../components/public/StatCard';
import { CTASection } from '../../components/public/CTASection';
import { ERP_BASE_PATH } from '../../constants/navigation';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-0">
      <SEO
        title="Kolmeks | Precision Manufacturing & Engineering"
        description="Global contract manufacturing partner specializing in CNC machining, component assembly, electric motor windings, and industrial supply chain solutions."
      />

      {/* 1. Hero Section */}
      <HeroSection
        eyebrow="PRECISION MANUFACTURING"
        title="Precision Manufacturing. Engineered for Performance."
        description="Kolmeks delivers custom contract manufacturing, high-precision CNC machining, sub-assemblies, and electric motor components backed by ISO-certified quality processes."
        primaryCtaText="Request a Quote"
        primaryCtaLink="/request-quote"
        secondaryCtaText="Explore Capabilities"
        secondaryCtaLink="/cnc-machining"
      />

      {/* 2. Introduction Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold font-mono">
                ABOUT KOLMEKS
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Engineering Precision Into Every Component.
              </h2>

              <p className="text-base text-slate-600 leading-relaxed">
                As an international contract manufacturing partner, Kolmeks supports OEM clients with reliable component production, custom CNC machining, electro-mechanical sub-assemblies, and electric motor component manufacturing.
              </p>

              <div className="space-y-3 text-sm text-slate-700 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Dedicated DFM engineering & prototyping support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>High-speed multi-axis CNC milling, turning & grinding</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>ISO-aligned Quality Management & CMM inspection protocols</span>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/about">
                  <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Discover Kolmeks
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0B1E36] text-white flex items-center justify-center">
                    <Factory className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Turnkey Manufacturing Partner</h3>
                    <p className="text-xs text-slate-500 font-mono">Single-Source Responsibility</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  From raw material sourcing to final packaging and logistics delivery, our production management guarantees repeatable quality and operational efficiency.
                </p>

                <div className="grid grid-cols-2 gap-4 font-mono text-xs pt-2">
                  <div className="p-3 bg-white rounded border border-slate-200">
                    <div className="text-slate-500">Execution</div>
                    <div className="font-bold text-slate-900">OEM Contract</div>
                  </div>
                  <div className="p-3 bg-white rounded border border-slate-200">
                    <div className="text-slate-500">Quality</div>
                    <div className="font-bold text-slate-900">Zero Defect</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Capabilities Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <Container>
          <SectionHeading
            eyebrow="CORE COMPETENCIES"
            title="Industrial Manufacturing Capabilities"
            description="End-to-end component manufacturing solutions engineered to rigorous global technical standards."
            centered
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CapabilityCard
              icon={Factory}
              title="Contract Manufacturing"
              description="Turnkey component production, dedicated manufacturing lines, and scalable supply for global OEMs."
              href="/contract-manufacturing"
              badge="Turnkey"
            />
            <CapabilityCard
              icon={Cpu}
              title="CNC Machining"
              description="High-speed 5-axis milling, turning, and automatic lathe machining with tight tolerance control."
              href="/cnc-machining"
              badge="Precision"
            />
            <CapabilityCard
              icon={Boxes}
              title="Component Assembly"
              description="Electro-mechanical sub-assemblies, pressure testing, and final quality assurance validation."
              href="/assembly"
              badge="Sub-Assembly"
            />
            <CapabilityCard
              icon={Zap}
              title="Electric Motors"
              description="Custom stator and rotor manufacturing, copper winding, and specialized motor component solutions."
              href="/electric-motors"
              badge="Electrical"
            />
            <CapabilityCard
              icon={Truck}
              title="Supply Chain Solutions"
              description="Raw material sourcing, buffer inventory coordination, and just-in-time logistics delivery."
              href="/supply-chain"
              badge="Logistics"
            />
            <CapabilityCard
              icon={ShieldCheck}
              title="Quality Control & CMM"
              description="Coordinate measuring machine (CMM) inspection and surface roughness testing for 100% compliance."
              href="/quality"
              badge="Inspection"
            />
          </div>
        </Container>
      </section>

      {/* 4. Manufacturing Process Workflow */}
      <ProcessSection />

      {/* 5. Quality Assurance Section */}
      <QualitySection />

      {/* 6. Global Presence Section */}
      <GlobalPresenceSection />

      {/* 7. Target Industries Section */}
      <IndustriesSection />

      {/* 8. Why Kolmeks Value Proposition */}
      <WhyKolmeksSection />

      {/* 9. Operational Metrics Structural Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <Container>
          <SectionHeading
            eyebrow="OPERATIONAL FOUNDATION"
            title="Manufacturing Performance Metrics"
            description="Structural framework demonstrating operational metrics and production monitoring standards."
            centered
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Quality Management" value="ISO 9001" subtext="Standardized SOPs" />
            <StatCard label="Environmental Standard" value="ISO 14001" subtext="Sustainable Sourcing" />
            <StatCard label="CMM Inspection" value="±0.005mm" subtext="Micron Tolerances" />
            <StatCard label="ERP Digitization" value="100%" subtext="Real-time Telemetry" />
          </div>
        </Container>
      </section>

      {/* 10. Call to Action Banner */}
      <CTASection
        title="Have a Contract Manufacturing Requirement?"
        description="Our engineering team is available to review your drawings, technical specifications, and production volume targets."
        primaryButtonText="Request a Quote"
        primaryButtonHref="/request-quote"
        secondaryButtonText="Contact Sales"
        secondaryButtonHref="/contact"
      />
    </div>
  );
};
