import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Card, CardContent } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';

export const NewsPage: React.FC = () => {
  return (
    <div className="py-12">
      <Container>
        <SectionHeading
          eyebrow="Media & Insights"
          title="Latest Kolmeks News"
          description="Updates on manufacturing technology investments, certifications, and company announcements."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="default">
            <CardContent className="p-6 space-y-3">
              <Newspaper className="w-6 h-6 text-industrial-700" />
              <h3 className="text-base font-bold text-slate-900">Kolmeks Expands 5-Axis CNC Capacity</h3>
              <p className="text-xs text-slate-500">August 2026 • Manufacturing Engineering</p>
              <p className="text-xs text-slate-600">Investment in new high-precision multi-axis machining centers to support growing motor component demand.</p>
              <Link to="/news/5-axis-cnc-expansion" className="inline-block text-xs font-bold text-industrial-700">Read Article →</Link>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
};
