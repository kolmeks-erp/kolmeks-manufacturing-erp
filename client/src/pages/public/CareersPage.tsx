import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { HeroSection } from '../../components/public/HeroSection';
import { VisualPlaceholder } from '../../components/public/VisualPlaceholder';
import { Button } from '../../components/ui/Button';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Card, CardContent } from '../../components/ui/Card';
import {
  Users,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  HardHat,
  Cpu,
  ShieldCheck,
  HeartHandshake,
} from 'lucide-react';
import careersHeroImg from '../../assets/images/kolmeks-careers-hero.webp';
import careersTeamImg from '../../assets/images/kolmeks-careers-team.webp';
import careersEngImg from '../../assets/images/kolmeks-careers-engineering.webp';

export const CareersPage: React.FC = () => {
  const careerAreas = [
    {
      icon: Cpu,
      title: 'CNC Machining & Tooling',
      description: 'Machinists, CNC programmers, and setup specialists operating multi-axis turning and milling equipment.',
    },
    {
      icon: HardHat,
      title: 'Sub-Assembly & Mechanical Production',
      description: 'Technicians and assembly operators building precision mechanical and electro-mechanical sub-systems.',
    },
    {
      icon: ShieldCheck,
      title: 'Quality & Metrology Inspection',
      description: 'Quality engineers and metrology auditors performing CMM verification, gauge calibration, and FAI audits.',
    },
    {
      icon: Building2,
      title: 'Production Planning & Logistics',
      description: 'Supply chain coordinators, material planners, and inventory managers orchestrating production workflows.',
    },
  ];

  const workCulturePillars = [
    'Safety-first manufacturing environment and ergonomic workstation design',
    'Continuous professional development and specialized equipment training',
    'Collaborative cross-functional teams bridging engineering and shop floor',
    'Modern production technologies and computerized monitoring tools',
  ];

  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | Careers & Opportunities"
        description="Explore career paths, engineering roles, precision machining opportunities, and team culture at Kolmeks."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="CAREERS AT KOLMEKS"
        title="Build Your Future in Precision Manufacturing."
        description="Join an industrial manufacturing team dedicated to component quality, engineering excellence, and reliable OEM supply across international markets."
        primaryCtaText="Explore Opportunities"
        primaryCtaLink="#openings"
        secondaryCtaText="Contact HR Team"
        secondaryCtaLink="/contact"
        imageUrl={careersHeroImg}
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs
          items={[
            { label: 'Company', href: '/about' },
            { label: 'Careers' },
          ]}
        />
      </Container>

      {/* Intro Section */}
      <section className="py-4 bg-white border-y border-slate-200/80">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-mono font-bold uppercase">
              <Users className="w-3.5 h-3.5 text-blue-600" /> PEOPLE & CULTURE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Engineering Excellence Built by Dedicated People.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              At Kolmeks, we bring together CNC machinists, quality inspectors, assembly technicians, and logistics planners to manufacture critical industrial components for OEM clients worldwide.
            </p>
          </div>
        </Container>
      </section>

      {/* Career Areas */}
      <section className="py-4">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="FUNCTIONAL AREAS"
            title="Operational & Engineering Disciplines."
            description="Explore key operational areas where professionals contribute to component manufacturing excellence."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {careerAreas.map((area, idx) => {
              const Icon = area.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs hover:border-blue-600 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{area.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{area.description}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Team Collaboration Image Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-mono font-bold uppercase">
                <HeartHandshake className="w-3.5 h-3.5 text-blue-600" /> TEAMWORK
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Collaborative Shop-Floor & Engineering Culture.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                We foster open technical communication between engineering desks, quality inspection benches, and CNC machine cells to solve manufacturing challenges efficiently.
              </p>

              <div className="space-y-3 pt-2 text-sm text-slate-700 font-medium">
                {workCulturePillars.map((pillar, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{pillar}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="CROSS-FUNCTIONAL ENGINEERING & SHOP-FLOOR TEAM"
                subtitle="Collaborative Blueprint & Component Review"
                badge="ENGINEERING TEAM"
                imageUrl={careersTeamImg}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Engineering Opportunities Visual Section */}
      <section className="py-12 bg-[#0B1E36] text-white border-y border-slate-800">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="SHOP-FLOOR METROLOGY & QUALITY ROLES"
                subtitle="Precision Inspection & Dial Gauge Verification"
                badge="QUALITY CAREERS"
                imageUrl={careersEngImg}
              />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono font-bold uppercase">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" /> OPEN OPPORTUNITIES
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Grow Your Skills with Precision Manufacturing.
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                Whether you are an experienced machinist, quality engineer, or eager apprentice, Kolmeks offers structured pathways to advance your technical expertise.
              </p>

              <div className="p-4 bg-[#0F2C59] border border-slate-700 rounded-xl space-y-2">
                <h3 className="font-bold text-white text-sm">Open Candidate Inquiries</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We are always interested in connecting with skilled CNC operators, toolsetters, quality inspectors, and assembly specialists.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Final Career CTA */}
      <section id="openings" className="py-4">
        <Container>
          <div className="bg-[#0B1E36] text-white p-8 sm:p-12 rounded-2xl border border-slate-800 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Interested in Joining the Kolmeks Team?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Send your CV and introductory details to our human resources team to discuss open positions and future opportunities.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
              <Link to="/contact">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Contact HR Team
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
