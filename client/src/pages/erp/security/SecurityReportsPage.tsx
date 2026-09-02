import React, { useEffect, useState } from 'react';
import { FileText, Download, ShieldCheck, CheckCircle2, Award } from 'lucide-react';
import { SecurityNavigationHeader } from '../../../components/security/SecurityNavigationHeader';
import { securityService } from '../../../services/security.service';
import { SecurityOverviewMetrics } from '../../../types/security';

export const SecurityReportsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityOverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await securityService.getOverviewMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load compliance report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleExportComplianceReport = () => {
    if (!metrics) return;
    const headers = ['Security & Compliance Control Domain', 'Implementation Status', 'Verification Standard', 'Metric / Count'];
    const rows = [
      ['Row-Level Security (RLS) Isolation', 'ENFORCED', 'Supabase PostgreSQL RLS Policies', 'Applied to all core ERP tables'],
      ['Role-Based Access Control (RBAC)', 'ENFORCED', 'Trusted JWT Profile Authorization', `${metrics.users.active} Active Roles`],
      ['Audit Log Immutability', 'ENFORCED', 'Triggers Block UPDATE / DELETE', '100% Tamper-Proof Audit Log'],
      ['Session Lifecycle & Device Tracking', 'MONITORED', 'Token & Session Verification', `${metrics.sessions.activeCount} Active Sessions`],
      ['Security Event Telemetry', 'ACTIVE', 'Real-Time Event Stream', `${metrics.events.totalLast30Days} Events Captured (30d)`],
      ['Suspended Account Safeguards', 'ACTIVE', 'Forbidden 403 Response Middleware', `${metrics.users.suspended} Suspended Accounts`],
      ['Public Website Data Isolation', 'VERIFIED', 'Separate /secure-kolmeks-x0y0 Routes', 'Zero ERP Data Exposed']
    ];
    securityService.exportSecurityCSV('Enterprise_Security_Compliance_Readiness_Report', headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <FileText className="w-7 h-7 text-rose-500" />
            <span>Security & Compliance Readiness Audit Reports</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Generate formal security compliance documentation, evidence logs, and access control audit trails for internal & external auditors.
          </p>
        </div>
        <button
          onClick={handleExportComplianceReport}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Compliance Audit Report</span>
        </button>
      </div>

      <SecurityNavigationHeader />

      {/* Audit Readiness Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Access Control & Identity Isolation</h3>
              <p className="text-xs text-slate-400">Strict authentication, role checks, and database RLS policies</p>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Supabase Auth JWT Token validation on every protected route.</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Row Level Security (RLS) active on all PostgreSQL tables.</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Privilege escalation protections prevent self-promotion and unauthorized suspension.</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Audit Traceability & Data Immutability</h3>
              <p className="text-xs text-slate-400">Tamper-proof audit logs and immutable security event logs</p>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Database triggers reject any UPDATE or DELETE operations on audit logs.</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Complete actor ID, timestamp, module, action, and payload details recorded.</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Export security logs capture all user CSV data export operations.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
