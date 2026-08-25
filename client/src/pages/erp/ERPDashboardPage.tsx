import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHealthCheck } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  Activity, 
  Factory, 
  Cpu, 
  FileText, 
  Boxes, 
  ShieldCheck, 
  RefreshCw, 
  Server,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const ERPDashboardPage: React.FC = () => {
  const { data: healthData, isLoading, isError, refetch } = useQuery({
    queryKey: ['healthCheck'],
    queryFn: fetchHealthCheck,
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manufacturing Executive Dashboard"
        description="Real-time telemetry, backend API health, and operational module entry points."
        badge="Foundation Phase 01"
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh Telemetry
          </Button>
        }
      />

      {/* Health Check Server Telemetry Card */}
      <Card variant="industrial">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-industrial-700" />
            <CardTitle>Express & Supabase Backend Telemetry</CardTitle>
          </div>
          <Badge variant={healthData?.status === 'online' ? 'success' : 'warning'}>
            {isLoading ? 'Checking...' : healthData?.status || 'Offline'}
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-xs text-slate-500 font-mono">Querying Express GET /api/health endpoint...</p>}
          {isError && (
            <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
              ⚠️ Backend Express server is not responding at <code>http://localhost:5000/api/health</code>. Ensure the server process is started via <code>npm run dev</code> in <code>/server</code>.
            </div>
          )}
          {healthData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Service Name</span>
                <span className="font-bold text-slate-800">{healthData.service}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Database Provider</span>
                <span className="font-bold text-industrial-700">{healthData.database.provider}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Server Uptime</span>
                <span className="font-bold text-slate-800">{healthData.uptime}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase">Environment</span>
                <span className="font-bold text-emerald-700 uppercase">{healthData.environment}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operational Module Summary Cards Placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card variant="default">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending RFQs</span>
              <FileText className="w-4 h-4 text-industrial-700" />
            </div>
            <div className="text-2xl font-bold text-slate-900">0</div>
            <p className="text-[10px] text-slate-500 font-mono">Module prepared for Prompt 02</p>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active CNC Machines</span>
              <Cpu className="w-4 h-4 text-industrial-700" />
            </div>
            <div className="text-2xl font-bold text-slate-900">0</div>
            <p className="text-[10px] text-slate-500 font-mono">CNC Machine Hub Shell</p>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Materials Master</span>
              <Boxes className="w-4 h-4 text-industrial-700" />
            </div>
            <div className="text-2xl font-bold text-slate-900">0</div>
            <p className="text-[10px] text-slate-500 font-mono">PostgreSQL Schema Ready</p>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">QC Reports</span>
              <ShieldCheck className="w-4 h-4 text-industrial-700" />
            </div>
            <div className="text-2xl font-bold text-slate-900">0</div>
            <p className="text-[10px] text-slate-500 font-mono">CMM Quality Control Shell</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
