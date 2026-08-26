import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { HeroSection } from '../../components/public/HeroSection';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Newspaper, Calendar, ArrowRight, Tag } from 'lucide-react';

export const articlesData = [
  {
    slug: 'cnc-machining-expansion',
    title: 'Kolmeks Expands Multi-Axis CNC Machining Capacity',
    date: 'August 14, 2026',
    category: 'Operations & Technology',
    summary: 'Integration of new multi-axis CNC milling centers enhances component production throughput and complex geometry machining.',
    content: `Kolmeks has expanded its manufacturing operations with the addition of multi-axis CNC machining centers. This strategic investment strengthens our contract manufacturing capability, enabling higher component throughput and tight-tolerance machining for industrial pump and electric motor components.

The new machining technology allows complex rotational and prismatic parts to be processed with fewer setups, reducing lead times and enhancing dimensional accuracy across OEM production batches.`,
  },
  {
    slug: 'cmm-quality-upgrades',
    title: 'Enhanced 3D CMM Quality Control Inspections',
    date: 'July 28, 2026',
    category: 'Quality & Testing',
    summary: 'Upgraded Coordinate Measuring Machine (CMM) probing software enables faster 3D CAD comparison reports for OEM partners.',
    content: `To support zero-defect quality objectives, Kolmeks has upgraded its quality inspection laboratory with advanced 3D CMM coordinate measuring software. The system provides real-time CAD model probing comparisons and detailed inspection documentation for critical mechanical components.

These enhancements streamline first-article inspection (FAI) routines and support complete batch traceability across all contract manufacturing runs.`,
  },
  {
    slug: 'sustainable-manufacturing',
    title: 'Sustainable Metal Recycling & Coolant Efficiency',
    date: 'June 19, 2026',
    category: 'Sustainability',
    summary: 'Implementation of closed-loop coolant filtration and automated metal chip briquetting reduces environmental footprint.',
    content: `As part of our commitment to responsible industrial manufacturing, Kolmeks has implemented closed-loop machining coolant filtration systems and automated metal chip briquetting.

By recycling 100% of aluminum, steel, and brass swarf generated during CNC machining cycles, we minimize waste and optimize raw material utilization across our facility.`,
  },
];

export const NewsPage: React.FC = () => {
  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | News & Insights"
        description="Latest manufacturing announcements, CNC technology updates, and corporate news from Kolmeks."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="NEWS & ANNOUNCEMENTS"
        title="Latest Corporate & Technical News."
        description="Stay updated with Kolmeks manufacturing announcements, technology upgrades, quality enhancements, and industry insights."
        primaryCtaText="Contact Us"
        primaryCtaLink="/contact"
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs items={[{ label: 'News' }]} />
      </Container>

      {/* News Feed Grid */}
      <section className="py-4">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="CORPORATE UPDATES"
            title="Press Releases & Articles."
            description="Explore our latest manufacturing developments."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articlesData.map((article) => (
              <Card key={article.slug} variant="industrial" className="hover:border-blue-600 transition-colors">
                <CardContent className="p-6 space-y-4 flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span className="flex items-center gap-1 text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                        <Tag className="w-3 h-3" /> {article.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> {article.date}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{article.title}</h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{article.summary}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Link
                      to={`/news/${article.slug}`}
                      className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 gap-1"
                    >
                      Read Full Article <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
};
