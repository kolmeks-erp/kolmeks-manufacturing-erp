import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { HeroSection } from '../../components/public/HeroSection';
import { VisualPlaceholder } from '../../components/public/VisualPlaceholder';
import { Button } from '../../components/ui/Button';
import { SectionHeading } from '../../components/ui/SectionHeading';
import {
  Users,
  Briefcase,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Building2,
  HardHat,
  Cpu,
  ShieldCheck,
  HeartHandshake,
  Lightbulb,
  Info,
} from 'lucide-react';
import careersHeroImg from '../../assets/images/kolmeks-careers-hero.webp';
import careersTeamImg from '../../assets/images/kolmeks-careers-team.webp';
import careersEngImg from '../../assets/images/kolmeks-careers-engineering.webp';

export const CareersPage: React.FC = () => {
  const careerPrinciples = [
    {
      number: '01',
      title: 'Learn',
      description: 'Develop technical and professional knowledge across precision component manufacturing disciplines.',
    },
    {
      number: '02',
      title: 'Collaborate',
      description: 'Work closely across engineering, quality, production planning, and shop-floor manufacturing teams.',
    },
    {
      number: '03',
      title: 'Improve',
      description: 'Look for better, more reliable ways to solve complex manufacturing and tooling challenges.',
    },
    {
      number: '04',
      title: 'Build',
      description: 'Contribute to components and assemblies that support real-world industrial machinery applications.',
    },
  ];

  const functionalAreas = [
    {
      title: 'Mechanical Engineering',
      desc: 'Designing fixtures, reviewing component drawings, and evaluating mechanical tolerances.',
    },
    {
      title: 'Manufacturing Engineering',
      desc: 'Optimizing CNC toolpaths, machine setups, and shop-floor manufacturing sequences.',
    },
    {
      title: 'Quality & Metrology',
      desc: 'Executing CMM dimensional audits, gauge calibrations, and first-article inspections.',
    },
    {
      title: 'Production & Machining',
      desc: 'Operating multi-axis CNC turning and milling equipment, toolsetting, and sub-assembly.',
    },
    {
      title: 'Supply Chain & Planning',
      desc: 'Coordinating raw material procurement, inventory levels, and customer shipment logistics.',
    },
    {
      title: 'Software & Digital Systems',
      desc: 'Supporting digital production monitoring, shop-floor data tracking, and industrial IT.',
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | Careers"
        description="Explore career principles, engineering disciplines, manufacturing roles, and team collaboration opportunities at Kolmeks."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="CAREERS"
        title="Build Your Career in Engineering and Manufacturing."
        description="Engineering and manufacturing professionals contribute to component quality, technical problem-solving, and reliable OEM supply across international markets."
        primaryCtaText="View Opportunities"
        primaryCtaLink="#openings"
        secondaryCtaText="Contact Us"
        secondaryCtaLink="/contact"
        imageUrl={careersHeroImg}
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs
          items={[
            { label: 'Careers' },
          ]}
        />
      </Container>

      {/* Careers Introduction */}
      <section className="py-4 bg-white border-y border-slate-200/80">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-mono font-bold uppercase">
              <Users className="w-3.5 h-3.5 text-blue-600" /> WORK WITH KOLMEKS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Where Engineering Meets Manufacturing.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Manufacturing complex industrial components requires collaboration between design engineers, CNC machinists, quality auditors, and logistics coordinators. We value technical curiosity, practical problem-solving, and continuous learning.
            </p>
          </div>
        </Container>
      </section>

      {/* Team Image Section: People Behind the Process */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-mono font-bold uppercase">
                <HeartHandshake className="w-3.5 h-3.5 text-blue-600" /> OUR PEOPLE
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                People Behind the Process.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Manufacturing success depends on dedicated professionals across engineering, production, quality control, inventory management, and customer logistics.
              </p>

              <div className="space-y-3 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Engineering review and drawing evaluation before production setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Shop-floor machining craftsmanship and toolpath monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Quality audit verification and dimensional metrology</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Supply chain coordination and timely customer delivery</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="CROSS-FUNCTIONAL ENGINEERING & SHOP-FLOOR TEAM"
                subtitle="Collaborative Technical Review & Planning"
                badge="PEOPLE BEHIND PROCESS"
                imageUrl={careersTeamImg}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Career Principles */}
      <section className="py-4">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="CAREER VALUES"
            title="Four Career Principles."
            description="Core principles guiding professional development and teamwork across manufacturing disciplines."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {careerPrinciples.map((cp) => (
              <div
                key={cp.number}
                className="p-6 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs hover:border-blue-600 transition-colors"
              >
                <div className="text-xs font-mono font-bold text-blue-600">
                  PRINCIPLE {cp.number}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{cp.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {cp.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Engineering Career Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <VisualPlaceholder
                title="METROLOGY & ENGINEERING CAREER DISCIPLINES"
                subtitle="Precision Inspection & Shop-Floor Verification"
                badge="ENGINEERING CAREERS"
                imageUrl={careersEngImg}
              />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-mono font-bold uppercase">
                <Lightbulb className="w-3.5 h-3.5 text-blue-600" /> ENGINEERING
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Turn Engineering Knowledge Into Real Manufacturing.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Precision manufacturing bridges theoretical engineering with practical shop-floor execution across multiple technical functional areas:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {functionalAreas.map((fa, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <h3 className="font-bold text-slate-900 text-xs">{fa.title}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{fa.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Opportunities Section: Intentional Empty State */}
      <section id="openings" className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="JOB OPENINGS"
            title="Current Opportunities."
            description="Explore career inquiries and job openings as they are published."
          />

          <div className="p-8 sm:p-12 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Job Openings Will Be Published Here When Available.</h3>
            <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              We welcome general inquiries from qualified engineering, machining, quality, and manufacturing professionals interested in future positions.
            </p>
            <div className="pt-2">
              <Link to="/contact">
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Final Application CTA */}
      <section className="py-4">
        <Container>
          <div className="bg-[#0B1E36] text-white p-8 sm:p-12 rounded-2xl border border-slate-800 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Interested in Joining the Team?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Get in touch with our team to submit your background details and discuss future career opportunities.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
              <Link to="/contact">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
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
