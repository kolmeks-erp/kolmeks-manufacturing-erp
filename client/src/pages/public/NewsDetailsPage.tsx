import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { PageHeader } from '../../components/public/PageHeader';
import { CTASection } from '../../components/public/CTASection';
import { Button } from '../../components/ui/Button';
import { articlesData } from './NewsPage';
import { Calendar, Tag, ArrowLeft } from 'lucide-react';

export const NewsDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = articlesData.find((a) => a.slug === slug) || articlesData[0];

  return (
    <div className="space-y-12">
      <SEO title={`Kolmeks | ${article.title}`} description={article.summary} />

      <PageHeader
        eyebrow={article.category.toUpperCase()}
        title={article.title}
        description={`Published on ${article.date}`}
        breadcrumbs={[
          { label: 'News', href: '/news' },
          { label: article.title },
        ]}
      />

      <section className="py-8 bg-white">
        <Container className="max-w-3xl space-y-8">
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500 border-b border-slate-200 pb-4">
            <span className="flex items-center gap-1.5 text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full">
              <Tag className="w-3.5 h-3.5" /> {article.category}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {article.date}
            </span>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base space-y-6">
            {article.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-200">
            <Link to="/news">
              <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to News & Articles
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      <CTASection />
    </div>
  );
};
