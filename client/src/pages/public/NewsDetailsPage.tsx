import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { PageHeader } from '../../components/public/PageHeader';
import { CTASection } from '../../components/public/CTASection';
import { ArrowLeft } from 'lucide-react';

export const NewsDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="space-y-12">
      <SEO
        title="News Announcement | Kolmeks Manufacturing"
        description="Official manufacturing update and technical engineering press release from Kolmeks."
      />

      <PageHeader
        eyebrow="ANNOUNCEMENT"
        title="Manufacturing & Technology Update"
        description="Official press release regarding production technology and engineering capabilities."
        breadcrumbs={[
          { label: 'News', href: '/news' },
          { label: slug || 'Article' },
        ]}
      />

      <section className="py-8 bg-white">
        <Container className="max-w-3xl space-y-6">
          <Link to="/news" className="inline-flex items-center text-xs font-bold text-blue-700 gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to News & Insights
          </Link>
          <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-slate-700 leading-relaxed text-sm">
            <h2 className="text-xl font-bold text-slate-900">Technical Announcement</h2>
            <p>
              Detailed publication content regarding multi-axis CNC machining, quality system enhancements, and manufacturing operations.
            </p>
          </div>
        </Container>
      </section>

      <CTASection />
    </div>
  );
};
