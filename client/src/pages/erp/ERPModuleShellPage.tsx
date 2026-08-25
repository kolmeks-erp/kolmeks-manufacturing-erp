import React from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { ERP_SIDEBAR_MENU } from '../../constants/navigation';
import { Factory } from 'lucide-react';

export const ERPModuleShellPage: React.FC = () => {
  const location = useLocation();
  
  const currentModule = ERP_SIDEBAR_MENU.find((item) => item.path === location.pathname) || {
    label: 'ERP Operations Module',
    category: 'core',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={currentModule.label}
        description={`Secure Kolmeks ERP module shell for path: ${location.pathname}`}
        badge={`Category: ${currentModule.category?.toUpperCase() || 'CORE'}`}
      />

      <EmptyState
        title={`${currentModule.label} (Foundation Shell)`}
        description="The routing and layout foundation for this ERP module is established. Full database schemas and interactive business CRUD operations will be added in subsequent implementation prompts."
        icon={<Factory className="w-8 h-8 text-industrial-700" />}
      />
    </div>
  );
};
