import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { HeroSection } from '../../components/public/HeroSection';
import { Button } from '../../components/ui/Button';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { NewsCard } from '../../components/public/NewsCard';
import { Calendar, Tag, ArrowRight, BookOpen, Layers } from 'lucide-react';
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
    category: 'Manufacturing',
    summary: 'Exploring multi-axis turning strategies, toolpath optimization, and setup reduction techniques in industrial component production.',
    excerpt: 'Exploring multi-axis turning strategies, toolpath optimization, and setup reduction techniques in industrial component production.',
    readTime: '4 min read',
    content: `High-efficiency CNC machining requires careful alignment of machine kinematics, cutting tool geometry, and CAD/CAM programming strategies. When producing complex rotational and prismatic components for industrial equipment, minimizing non-cutting cycle time is key.\n\nMulti-axis machining centers allow complex component geometries—such as pump casings, motor end shields, and valve bodies—to be machined in fewer setups. This setup consolidation improves dimensional accuracy by eliminating cumulative clamping errors across multiple setups.\n\nFurthermore, standardized tooling packages and rigid workholding fixtures allow machinists to maintain consistent chip loads and predictable surface roughness (Ra) across large component batches. Combining rigid tooling with automated in-process probing ensures every feature remains well within drawing tolerances.`,
  },
  {
    slug: 'material-traceability-in-sub-assembly',
    title: 'The Role of Material Traceability in Industrial Sub-Assembly',
    date: 'July 28, 2026',
    category: 'Quality',
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

export const categoriesList = [
  'All',
  'Company',
  'Engineering',
  'Manufacturing',
  'Technology',
  'Quality',
  'Industry',
];

export const NewsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredArticles = selectedCategory === 'All'
    ? articlesData
    : articlesData.filter((art) => art.category === selectedCategory);

  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | News & Insights"
        description="Stay updated with technical articles, manufacturing insights, CNC machining updates, and component quality practices at Kolmeks."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="NEWS & INSIGHTS"
        title="Manufacturing, Engineering and Kolmeks Updates."
        description="Stay informed with technical articles, manufacturing insights, engineering developments, and news updates across component production."
        primaryCtaText="Explore Capabilities"
        primaryCtaLink="/cnc-machining"
        secondaryCtaText="Contact Us"
        secondaryCtaLink="/contact"
        imageUrl={newsHeroImg}
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs
          items={[
            { label: 'News & Insights' },
          ]}
        />
      </Container>

      {/* Main Content Area */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="PUBLICATIONS"
            title="Technical Articles & Insights."
            description="Educational articles on component manufacturing, metrology, quality control, and supply chain coordination."
          />

          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-2 pb-2">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors border ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Articles Grid or Empty State */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredArticles.map((art: ArticleData) => (
                <NewsCard key={art.slug} article={art} />
              ))}
            </div>
          ) : (
            <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No Articles Available in This Category</h3>
              <p className="text-xs text-slate-500">Articles in category "{selectedCategory}" will be published when available.</p>
            </div>
          )}
        </Container>
      </section>

      {/* News CTA */}
      <section className="py-4">
        <Container>
          <div className="bg-[#0B1E36] text-white p-8 sm:p-12 rounded-2xl border border-slate-800 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Stay Connected With Kolmeks.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Explore our manufacturing capabilities or get in touch with our engineering team to discuss your project requirements.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
              <Link to="/cnc-machining">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Capabilities
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
