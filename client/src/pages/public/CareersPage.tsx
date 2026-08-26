import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { HeroSection } from '../../components/public/HeroSection';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import {
  Users,
  Briefcase,
  Cpu,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Clock,
  Send,
} from 'lucide-react';

export const CareersPage: React.FC = () => {
  const openPositions = [
    {
      title: 'Senior CNC Machinist (Turning & Milling)',
      department: 'Production Operations',
      type: 'Full-Time',
      location: 'Manufacturing Plant',
      description: 'Setup and operate multi-axis CNC lathes and milling centers for tight-tolerance component production.',
    },
    {
      title: 'Quality Inspector (CMM Specialist)',
      department: 'Quality Assurance',
      type: 'Full-Time',
      location: 'Quality Laboratory',
      description: 'Program and operate 3D Coordinate Measuring Machines (CMM) and perform first-article dimensional audits.',
    },
    {
      title: 'Production Planning Engineer',
      department: 'Engineering & Logistics',
      type: 'Full-Time',
      location: 'Engineering Office',
      description: 'Develop CNC manufacturing processes, tooling selection, DFM reviews, and ERP production scheduling.',
    },
    {
      title: 'Electro-Mechanical Assembly Technician',
      department: 'Assembly Operations',
      type: 'Full-Time',
      location: 'Assembly Workshop',
      description: 'Assemble mechanical sub-systems, motor housings, bearings, and perform torque and pressure testing.',
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | Careers"
        description="Join Kolmeks engineering and manufacturing teams. Explore career opportunities in CNC machining, quality inspection, and production."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="CAREERS AT KOLMEKS"
        title="Join Our Engineering & Manufacturing Team."
        description="Build your career in high-precision contract manufacturing, CNC technology, quality assurance, and industrial production engineering."
        primaryCtaText="View Openings"
        primaryCtaLink="#openings"
        secondaryCtaText="Contact Us"
        secondaryCtaLink="/contact"
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs items={[{ label: 'Careers' }]} />
      </Container>

      {/* Culture & Working Environment */}
      <section className="py-4 bg-white border-y border-slate-200/80">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-mono font-bold uppercase">
              <Users className="w-3.5 h-3.5 text-blue-600" /> OUR CULTURE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Precision, Growth, and Technical Pride.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              At Kolmeks, we foster a collaborative environment focused on technical excellence, continuous skill development, and workplace safety. Our machinists, quality inspectors, and engineers take pride in fabricating components that power critical industrial machinery.
            </p>
          </div>
        </Container>
      </section>

      {/* Open Positions Section */}
      <section id="openings" className="py-4 scroll-mt-24">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="OPEN OPPORTUNITIES"
            title="Current Openings."
            description="Explore open roles across our manufacturing, engineering, and quality departments."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {openPositions.map((job, idx) => (
              <Card key={idx} variant="industrial" className="hover:border-blue-600 transition-colors">
                <CardContent className="p-6 space-y-4 flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">
                        {job.department}
                      </span>
                      <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {job.type}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>

                    <p className="text-sm text-slate-600 leading-relaxed">{job.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                    </span>
                    <Link to="/contact">
                      <Button variant="outline" size="sm" rightIcon={<Send className="w-3.5 h-3.5" />}>
                        Apply Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Application Procedure CTA */}
      <section className="py-4">
        <Container>
          <div className="bg-[#0B1E36] text-white p-8 sm:p-12 rounded-2xl border border-slate-800 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Don't See Your Exact Role?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              We are always interested in connecting with skilled CNC machinists, programmers, and production engineers. Submit an open application.
            </p>
            <div className="pt-2">
              <Link to="/contact">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Send General Application
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
