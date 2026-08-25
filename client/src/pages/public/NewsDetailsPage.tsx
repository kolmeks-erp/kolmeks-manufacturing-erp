import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { ArrowLeft } from 'lucide-react';

export const NewsDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="py-12">
      <Container size="md">
        <Link to="/news" className="inline-flex items-center text-xs font-semibold text-industrial-700 mb-6 gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to News
        </Link>
        <SectionHeading
          eyebrow="News Detail"
          title={`Article: ${slug || 'Manufacturing Update'}`}
          description="Official announcement and technical overview."
        />
        <div className="prose max-w-none text-slate-700 text-sm space-y-4">
          <p>
            Kolmeks continues to invest in state-of-the-art manufacturing infrastructure and telemetry integration across all machining lines.
          </p>
        </div>
      </Container>
    </div>
  );
};
