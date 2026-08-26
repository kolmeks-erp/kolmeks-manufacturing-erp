import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { HeroSection } from '../../components/public/HeroSection';
import { VisualPlaceholder } from '../../components/public/VisualPlaceholder';
import { Button } from '../../components/ui/Button';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Newspaper, Calendar, ArrowRight, Tag, BookOpen, Layers } from 'lucide-react';
import newsHeroImg from '../../assets/images/kolmeks-news-hero.webp';

export interface ArticleData {
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  excerpt: string;
  readTime: string;
  content: string;
}

export const articlesData: ArticleData[] = [
  {
    slug: 'enhancing-cnc-machining-efficiency',
    title: 'Enhancing CNC Machining Efficiency for OEM Components',
    date: 'August 14, 2026',
    category: 'Manufacturing Insights',
    summary: 'Exploring multi-axis turning strategies, toolpath optimization, and setup reduction techniques in industrial component production.',
    excerpt: 'Exploring multi-axis turning strategies, toolpath optimization, and setup reduction techniques in industrial component production.',
    readTime: '4 min read',
    content: `High-efficiency CNC machining requires careful alignment of machine kinematics, cutting tool geometry, and CAD/CAM programming strategies. When producing complex rotational and prismatic components for industrial equipment, minimizing non-cutting cycle time is key.\n\nMulti-axis machining centers allow complex component geometries—such as pump casings, motor end shields, and valve bodies—to be machined in fewer setups. This setup consolidation improves dimensional accuracy by eliminating cumulative clamping errors across multiple setups.\n\nFurthermore, standardized tooling packages and rigid workholding fixtures allow machinists to maintain consistent chip loads and predictable surface roughness (Ra) across large component batches. Combining rigid tooling with automated in-process probing ensures every feature remains well within drawing tolerances.`,
  },
  {
    slug: 'material-traceability-in-sub-assembly',
    title: 'The Role of Material Traceability in Industrial Sub-Assembly',
    date: 'July 28, 2026',
    category: 'Quality Control',
    summary: 'How EN 10204 3.1 material certificates and heat batch identification protect OEM component reliability.',
    excerpt: 'How EN 10204 3.1 material certificates and heat batch identification protect OEM component reliability.',
    readTime: '5 min read',
    content: `Material traceability is the backbone of industrial quality assurance. In critical applications—such as hydraulic systems, power generation equipment, and fluid pumps—component failure can cause costly operational downtime.\n\nTraceability begins at raw material intake. Every bar stock shipment, casting, or forging is inspected and matched against EN 10204 3.1 mill test certificates. These certificates document chemical composition, tensile strength, yield points, and heat treatment batches.\n\nDuring machining and sub-assembly, parts are tracked using batch identification tags and router traveler documentation. Should an operational anomaly occur in the field, complete traceability allows engineers to immediately isolate affected material heats and verify manufacturing inspection records.`,
  },
  {
    slug: 'electric-motor-component-precision',
    title: 'Precision Considerations for Electric Motor Shafts & Housings',
    date: 'June 19, 2026',
    category: 'Engineering',
    summary: 'Analyzing rotational balance, journal bearing tolerances, and concentricity requirements in electric motor component manufacturing.',
    excerpt: 'Analyzing rotational balance, journal bearing tolerances, and concentricity requirements in electric motor component manufacturing.',
    readTime: '6 min read',
    content: `Electric motors rely on precise mechanical alignment between the rotor shaft, bearing journals, and stator housing bore to maintain high efficiency and quiet operation.\n\nKey manufacturing considerations include strict concentricity between shaft bearing journals, precise keyway milling, and controlled total indicator reading (TIR) runout. Even minor eccentricity can induce vibration, premature bearing wear, and acoustic noise.\n\nUsing multi-tasking CNC turning centers equipped with live tooling, rotor shafts can be turned, grooved, and keyway-milled in a single chucking operation. This guarantees coaxiality between all rotational surfaces and simplifies downstream motor assembly.`,
  },
];

export const NewsPage: React.FC = () => {
  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | News & Technical Articles"
        description="Stay updated with technical articles, manufacturing insights, CNC machining updates, and component quality practices at Kolmeks."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="NEWS & INSIGHTS"
        title="Manufacturing Articles & Technical Insights."
        description="Stay informed with manufacturing insights, technical articles, and updates on CNC machining, quality control, and component engineering."
        primaryCtaText="Read Articles"
        primaryCtaLink="#articles"
        secondaryCtaText="Request a Quote"
        secondaryCtaLink="/request-quote"
        imageUrl={newsHeroImg}
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs
          items={[
            { label: 'News & Articles' },
          ]}
        />
      </Container>

      {/* Articles Grid */}
      <section id="articles" className="py-4">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="LATEST PUBLICATION"
            title="Technical Articles & Insights."
            description="Explore educational articles on component manufacturing, metrology, and supply chain coordination."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articlesData.map((art: ArticleData) => (
              <div
                key={art.slug}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-blue-600 transition-colors flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                    <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      <Tag className="w-3 h-3" /> {art.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {art.date}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">{art.readTime}</span>
                  <Link
                    to={`/news/${art.slug}`}
                    className="inline-flex items-center text-xs font-bold text-blue-700 hover:text-blue-900 gap-1"
                  >
                    Read Full Article <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
};
