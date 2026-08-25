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
  Award, 
  Layers,
  FileCheck2,
  Lock
} from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Badge } from '../../components/ui/Badge';
import { ERP_BASE_PATH } from '../../constants/navigation';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative bg-industrial-950 text-white py-20 lg:py-28 overflow-hidden">
        {/* Subtle Industrial Grid Background Effect */}
        <div className="absolute inset-0 industrial-grid-bg opacity-15 pointer-events-none" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-industrial-850 opacity-30 blur-3xl" />

        <Container className="relative z-10">
          <div className="max-w-3xl space-y-6">
            <Badge variant="industrial" className="bg-industrial-900 border-industrial-800 text-industrial-500 font-mono">
              ★ Enterprise Industrial Partner
            </Badge>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Precision Contract Manufacturing & Component Engineering
            </h1>

            <p className="text-lg text-slate-300 font-normal leading-relaxed">
              Kolmeks is an international contract manufacturing powerhouse delivering high-precision CNC components, sub-assemblies, electric motor windings, and industrial solutions with zero-defect quality.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link to="/request-quote">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Request a Production Quote
                </Button>
              </Link>
              <Link to="/contract-manufacturing">
                <Button variant="outline" size="lg" className="border-slate-700 bg-industrial-900 text-slate-200 hover:bg-slate-800">
                  Explore Capabilities
                </Button>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-3 gap-6 border-t border-slate-800 text-slate-400 font-mono text-xs">
              <div>
                <div className="text-xl font-bold text-white">ISO 9001:2015</div>
                <div>Certified Operations</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">CMM Tested</div>
                <div>Micron Tolerance</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">ERP-Integrated</div>
                <div>Real-time Telemetry</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Core Manufacturing Capabilities */}
      <section>
        <Container>
          <SectionHeading
            eyebrow="Core Competencies"
            title="Industrial Manufacturing Capabilities"
            description="End-to-end engineering solutions engineered to rigorous global technical standards."
            centered
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Capability 1 */}
            <Card variant="industrial" className="group hover:border-industrial-700 transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-industrial-50 text-industrial-850 flex items-center justify-center group-hover:bg-industrial-850 group-hover:text-white transition-colors">
                  <Factory className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Contract Manufacturing</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Turnkey production, component machining, and dedicated manufacturing lines tailored to high-volume OEMs.
                </p>
                <Link to="/contract-manufacturing" className="inline-flex items-center text-xs font-bold text-industrial-700 hover:text-industrial-900 gap-1">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>

            {/* Capability 2 */}
            <Card variant="industrial" className="group hover:border-industrial-700 transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-industrial-50 text-industrial-850 flex items-center justify-center group-hover:bg-industrial-850 group-hover:text-white transition-colors">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">CNC Machining</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  High-speed 5-axis CNC milling, turning, and automatic lathe production with sub-micron tolerances.
                </p>
                <Link to="/cnc-machining" className="inline-flex items-center text-xs font-bold text-industrial-700 hover:text-industrial-900 gap-1">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>

            {/* Capability 3 */}
            <Card variant="industrial" className="group hover:border-industrial-700 transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-industrial-50 text-industrial-850 flex items-center justify-center group-hover:bg-industrial-850 group-hover:text-white transition-colors">
                  <Boxes className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Component Assembly</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Full electro-mechanical sub-assemblies, pressure testing, and final quality validation.
                </p>
                <Link to="/assembly" className="inline-flex items-center text-xs font-bold text-industrial-700 hover:text-industrial-900 gap-1">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>

            {/* Capability 4 */}
            <Card variant="industrial" className="group hover:border-industrial-700 transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-industrial-50 text-industrial-850 flex items-center justify-center group-hover:bg-industrial-850 group-hover:text-white transition-colors">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Electric Motors & Windings</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Custom stator and rotor manufacturing, precision copper winding, and electrical testing.
                </p>
                <Link to="/electric-motors" className="inline-flex items-center text-xs font-bold text-industrial-700 hover:text-industrial-900 gap-1">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>

            {/* Capability 5 */}
            <Card variant="industrial" className="group hover:border-industrial-700 transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-industrial-50 text-industrial-850 flex items-center justify-center group-hover:bg-industrial-850 group-hover:text-white transition-colors">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Supply Chain Solutions</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Raw material sourcing, buffer inventory management, and just-in-time logistics delivery.
                </p>
                <Link to="/supply-chain" className="inline-flex items-center text-xs font-bold text-industrial-700 hover:text-industrial-900 gap-1">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>

            {/* Capability 6 */}
            <Card variant="industrial" className="group hover:border-industrial-700 transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-industrial-50 text-industrial-850 flex items-center justify-center group-hover:bg-industrial-850 group-hover:text-white transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">CMM & Quality Control</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Coordinate Measuring Machines (CMM) and 3D laser scanning for 100% quality verification.
                </p>
                <Link to="/quality" className="inline-flex items-center text-xs font-bold text-industrial-700 hover:text-industrial-900 gap-1">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* Internal ERP Integration Callout */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <Container>
          <div className="bg-industrial-950 rounded-2xl p-8 sm:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-industrial-lg">
            <div className="space-y-4 max-w-xl">
              <Badge variant="industrial" className="bg-industrial-900 border-industrial-800 text-industrial-500 font-mono">
                System Telemetry Integration
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Powered by Kolmeks Secure ERP Operations
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                From customer RFQ submission to CNC machine scheduling, material stock tracking, and CMM quality approval — our entire production floor is digitized in real time.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-4">
              <Link to="/request-quote">
                <Button variant="primary" size="lg">Submit RFQ</Button>
              </Link>
              <Link to={`${ERP_BASE_PATH}/login`}>
                <Button variant="outline" size="lg" className="border-slate-700 bg-industrial-900 text-white hover:bg-slate-800" leftIcon={<Lock className="w-4 h-4" />}>
                  Access Internal ERP
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
