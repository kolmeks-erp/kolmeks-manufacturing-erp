import React from 'react';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { PageHeader } from '../../components/public/PageHeader';
import { CTASection } from '../../components/public/CTASection';

export const SupplyChainPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <SEO
        title="Supply Chain Solutions | Raw Sourcing & Buffer Logistics"
        description="Global raw material sourcing, certified supplier network, buffer stock management, and JIT logistics."
      />

      <PageHeader
        eyebrow="CAPABILITIES"
        title="Supply Chain & Material Sourcing"
        description="Strategic raw material sourcing, supplier quality management, inventory buffering, and global logistics coordination."
        breadcrumbs={[
          { label: 'Capabilities', href: '/supply-chain' },
          { label: 'Supply Chain' },
        ]}
      />

      <section className="py-8 bg-white">
        <Container className="max-w-4xl space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Resilient Manufacturing Supply Chain Management
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Our supply chain management system ensures continuity of raw materials (castings, forgings, bar stock) and components. We coordinate buffer inventory and just-in-time (JIT) deliveries to minimize production downtime for our clients.
          </p>
        </Container>
      </section>

      <CTASection />
    </div>
  );
};
