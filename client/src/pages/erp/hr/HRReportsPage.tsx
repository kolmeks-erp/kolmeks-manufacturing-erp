import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, AlertTriangle, ShieldCheck, FileText, PieChart, TrendingUp, Calendar, Award } from 'lucide-react';
import { employeeService } from '../../../services/employee.service';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingState } from '../../../components/erp/LoadingState';
import { ErrorState } from '../../../components/erp/ErrorState';

export const HRReportsPage: React.FC = () => {
  const { data: reportData, isLoading, isError, refetch } = useQuery({
    queryKey: ['hr_reports'],
    queryFn: () => employeeService.getHRReports(),
  });

  if (isLoading) return <LoadingState label="Generating HR analytical telemetry..." rows={6} />;
  if (isError || !reportData) return <ErrorState title="Failed to generate reports" message="Error loading HR reporting metrics." onRetry={() => refetch()} />;

  const formatDate = (dStr?: string) => dStr ? new Date(dStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="HR Analytics & Compliance Intelligence"
        description="Real-time headcount telemetry, department metrics, tenure distribution, and certification/document expiration monitoring."
        badge="HR Reports"
      />

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Total Personnel</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{reportData.totalEmployees}</div>
          </div>
          <Users className="w-8 h-8 text-indigo-600 opacity-80" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Under 1 Year Tenure</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{reportData.tenureBreakdown.under1Year}</div>
          </div>
          <Calendar className="w-8 h-8 text-amber-600 opacity-80" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Expiring Certifications</div>
            <div className="text-2xl font-black text-red-600 mt-1">{reportData.expiringCertifications.length}</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-600 opacity-80" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Expiring Documents</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{reportData.expiringDocuments.length}</div>
          </div>
          <FileText className="w-8 h-8 text-blue-600 opacity-80" />
        </div>
      </div>

      {/* DEPARTMENT HEADCOUNT BREAKDOWN */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <PieChart className="w-4 h-4 text-indigo-600" /> Departmental Headcount Allocation
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">Dept Code</th>
                <th className="p-3">Department Name</th>
                <th className="p-3">Total Headcount</th>
                <th className="p-3">Active</th>
                <th className="p-3">Probation</th>
                <th className="p-3">On Leave</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {reportData.departmentBreakdown.map((d: any) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-indigo-900">{d.code}</td>
                  <td className="p-3 font-bold text-slate-800">{d.name}</td>
                  <td className="p-3 font-bold text-slate-900">{d.total}</td>
                  <td className="p-3 text-emerald-700 font-bold">{d.active}</td>
                  <td className="p-3 text-amber-700 font-bold">{d.probation}</td>
                  <td className="p-3 text-blue-700 font-bold">{d.onLeave}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPLIANCE ALERT TABLES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expiring Certifications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" /> Certifications Expiring Within 30 Days
          </h3>

          {reportData.expiringCertifications.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No expiring certifications detected.</p>
          ) : (
            <div className="space-y-2">
              {reportData.expiringCertifications.map((c: any) => (
                <div key={c.id} className="p-3 border border-amber-200 bg-amber-50/50 rounded-xl text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900">{c.certification_name}</div>
                    <div className="text-slate-500">{c.employee?.first_name} {c.employee?.last_name} ({c.employee?.employee_code})</div>
                  </div>
                  <span className="font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                    Exp: {formatDate(c.expiry_date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiring Documents */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> Employee Documents Expiring Soon
          </h3>

          {reportData.expiringDocuments.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No expiring documents detected.</p>
          ) : (
            <div className="space-y-2">
              {reportData.expiringDocuments.map((doc: any) => (
                <div key={doc.id} className="p-3 border border-blue-200 bg-blue-50/50 rounded-xl text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900">{doc.document_name}</div>
                    <div className="text-slate-500">{doc.employee?.first_name} {doc.employee?.last_name}</div>
                  </div>
                  <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    Exp: {formatDate(doc.expiry_date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
