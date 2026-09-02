import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Users,
  UserX,
  Smartphone,
  AlertTriangle,
  Lock,
  Activity,
  Download
} from 'lucide-react';
import { SecurityNavigationHeader } from '../../../components/security/SecurityNavigationHeader';
import { KPICard } from '../../../components/reports/KPICard';
import { securityService } from '../../../services/security.service';
import { SecurityOverviewMetrics } from '../../../types/security';

export const SecurityOverviewPage: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityOverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const data = await securityService.getOverviewMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load security metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleExport = () => {
    if (!metrics) return;
    const headers = ['Security Overview Metric', 'System Value'];
    const rows = [
      ['Total Registered Staff Users', metrics.users.total],
      ['Active Authorized Accounts', metrics.users.active],
      ['Suspended Staff Accounts', metrics.users.suspended],
      ['Active Device Sessions', metrics.sessions.activeCount],
      ['Security Events (Last 30 Days)', metrics.events.totalLast30Days],
      ['High / Critical Security Incidents', metrics.events.criticalCount],
      ['Failed Authentication Events', metrics.events.failedLoginAttempts],
      ['Privilege & Permission Alterations', metrics.events.privilegeChangesCount],
      ['Sensitive Data Export Actions', metrics.events.exportActivitiesCount]
    ];
    securityService.exportSecurityCSV('Security_Overview_Telemetry', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <ShieldAlert className="w-7 h-7 text-rose-500" />
            <span>Enterprise Security & Compliance Center</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time observability into authentication, RBAC privileges, session security, threat events, and immutability logs.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Security Telemetry</span>
        </button>
      </div>

      <SecurityNavigationHeader />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Active Users"
          value={loading ? '...' : metrics?.users.active || 0}
          subtitle={`Out of ${metrics?.users.total || 0} registered staff`}
          icon={Users}
          color="emerald"
        />

        <KPICard
          title="Suspended Accounts"
          value={loading ? '...' : metrics?.users.suspended || 0}
          subtitle="Access blocked by policy"
          icon={UserX}
          color="rose"
        />

        <KPICard
          title="Active Sessions"
          value={loading ? '...' : metrics?.sessions.activeCount || 0}
          subtitle="Monitored device connections"
          icon={Smartphone}
          color="blue"
        />

        <KPICard
          title="Critical Incidents (30d)"
          value={loading ? '...' : metrics?.events.criticalCount || 0}
          subtitle="High/Critical severity events"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Secondary Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Failed Auth Events</span>
            </h3>
            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-mono font-bold">
              {loading ? '...' : metrics?.events.failedLoginAttempts || 0}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Consecutive failed password attempts or invalid token requests recorded in security audit telemetry.
          </p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>Privilege & Role Edits</span>
            </h3>
            <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-xs font-mono font-bold">
              {loading ? '...' : metrics?.events.privilegeChangesCount || 0}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Administrative role promotions, permission scope alterations, or access privilege changes.
          </p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Enforced Policies</span>
            </h3>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-mono font-bold">
              {loading ? '...' : `${metrics?.policiesCount || 5} Active`}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Password strength requirements, session idle timeouts, export restrictions, and lockout policies.
          </p>
        </div>
      </div>
    </div>
  );
};
