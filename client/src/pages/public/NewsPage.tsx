import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { PageHeader } from '../../components/public/PageHeader';
import { CTASection } from '../../components/public/CTASection';
import { ArrowRight } from 'lucide-react';

const NEWS_ITEMS = [
  {
    slug: '5-axis-cnc-expansion',
    title: 'Kolmeks Expands High-Speed Multi-Axis CNC Machining Fleet',
    date: '2026-05-14',
    summary: 'Investment in new multi-axis machining centers enhances component throughput and tight-tolerance production capacity.',
  },
  {
    slug: 'iso-recertification-audit',
    title: 'Successful Completion of Annual Quality Audit & ISO Standards Review',
    date: '2026-03-20',
    summary: 'Our manufacturing facilities completed annual ISO quality management audits with zero non-conformances.',
  },
];

export const NewsPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <SEO
        title="News & Insights | Kolmeks Manufacturing Updates"
        description="Read the latest manufacturing news, technical engineering insights, and facility expansion updates from Kolmeks."
      />

      <PageHeader
        eyebrow="COMPANY UPDATES"
        title="News & Engineering Insights"
        description="Latest announcements, manufacturing technology developments, and operational updates from Kolmeks."
        breadcrumbs={[{ label: 'News & Insights' }]}
      />

      <section className="py-8 bg-white">
        <Container className="max-w-4xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {NEWS_ITEMS.map((item) => (
              <div key={item.slug} className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="text-xs font-mono text-slate-400">{item.date}</div>
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.summary}</p>
                <Link to={`/news/${item.slug}`} className="inline-flex items-center text-xs font-bold text-blue-700 gap-1 pt-2">
                  Read Announcement <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CTASection />
    </div>
  );
};
