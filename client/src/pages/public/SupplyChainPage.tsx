import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Truck } from 'lucide-react';

export const SupplyChainPage: React.FC = () => {
  return (
    <div className="py-12">
      <Container>
        <SectionHeading
          eyebrow="Logistics"
          title="Supply Chain & Material Sourcing"
          description="Integrated raw material procurement, buffer stock management, and Kanban delivery."
        />
        <div className="p-6 bg-white border border-slate-200 rounded-lg space-y-3">
          <Truck className="w-8 h-8 text-industrial-700" />
          <p className="text-sm text-slate-600">
            Real-time material requirements planning (MRP) integrated directly into Kolmeks ERP for transparent inventory flow.
          </p>
        </div>
      </Container>
    </div>
  );
};
