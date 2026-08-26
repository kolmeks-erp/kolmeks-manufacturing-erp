import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { SEO } from '../../components/public/SEO';
import { Home, ArrowLeft } from 'lucide-react';

export const PublicNotFoundPage: React.FC = () => {
  return (
    <div className="py-24 bg-slate-50 flex items-center justify-center min-h-[60vh]">
      <SEO title="404 — Page Not Found | Kolmeks Manufacturing" />

      <Container className="max-w-md text-center space-y-6">
        <div className="text-6xl sm:text-7xl font-extrabold font-mono text-[#0B1E36]">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            The resource or page you are requesting could not be found on the public Kolmeks manufacturing site.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
              Return to Home
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2"
          >
            Go Back Previous Page
          </button>
        </div>
      </Container>
    </div>
  );
};
