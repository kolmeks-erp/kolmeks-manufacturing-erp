import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { Button } from '../../components/ui/Button';
import { articlesData, ArticleData } from './NewsPage';
import { Calendar, Tag, ArrowLeft, BookOpen, ArrowRight } from 'lucide-react';

export const NewsDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const article: ArticleData | undefined = articlesData.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="py-20 bg-slate-50/50 min-h-[60vh] flex items-center">
        <SEO title="Kolmeks | Article Not Found" description="The requested technical article could not be found." />
        <Container className="max-w-md text-center space-y-6">
          <div className="w-14 h-14 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Article Not Found</h1>
            <p className="text-sm text-slate-600">The article you are looking for does not exist or has been relocated.</p>
          </div>
          <Link to="/news">
            <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to News & Insights
            </Button>
          </Link>
        </Container>
      </div>
    );
  }

  return (
    <div className="space-y-12 bg-slate-50/50 pb-12">
      <SEO title={`Kolmeks | ${article.title}`} description={article.summary} />

      {/* Header Banner */}
      <section className="pt-12 pb-8 bg-[#0B1E36] text-white">
        <Container className="max-w-4xl space-y-6">
          <Breadcrumbs
            items={[
              { label: 'News & Insights', href: '/news' },
              { label: article.title },
            ]}
          />

          <div className="space-y-4 pt-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full uppercase">
              <Tag className="w-3.5 h-3.5" /> {article.category}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-300 pt-2 border-t border-slate-700/80">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" /> Published: {article.date}
              </span>
              <span>•</span>
              <span>{article.readTime}</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Article Body */}
      <section className="py-8 bg-white border-y border-slate-200">
        <Container className="max-w-3xl space-y-8">
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base sm:text-lg space-y-6">
            {article.content.split('\n\n').map((paragraph: string, idx: number) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <Link to="/news">
              <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to News & Insights
              </Button>
            </Link>

            <Link to="/contact">
              <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Discuss Component Requirements
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
};
