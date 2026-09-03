import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Download, FileSpreadsheet, Filter, RefreshCw, Printer, ShieldCheck 
} from 'lucide-react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import DataTable from '../../../components/common/DataTable';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { maintenanceService } from '../../../services/maintenance.service';

const MaintenanceReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<string>('history');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await maintenanceService.getMaintenanceReports({ reportType });
      setReportData(res);
    } catch (err: any) {
      console.error('Failed to generate report:', err);
      setError(err.message || 'Unable to generate maintenance analytical report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const historyColumns = [
    { header: 'WO Number', accessor: (row: any) => <span className="font-mono text-sm font-semibold text-slate-900 whitespace-nowrap">{row.work_order_number}</span> },
    { header: 'Title', accessor: (row: any) => <span className="text-slate-900 font-medium whitespace-nowrap">{row.title}</span> },
    { header: 'Asset', accessor: (row: any) => <span className="text-slate-700 whitespace-nowrap">{row.assets?.name || 'N/A'}</span> },
    { header: 'Type', accessor: (row: any) => <span className="text-xs bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap">{row.maintenance_type ? row.maintenance_type.replace(/_/g, ' ') : ''}</span> },
    { header: 'Status', accessor: (row: any) => <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">{row.status ? row.status.replace(/_/g, ' ') : ''}</span> },
    { header: 'Completed Date', accessor: (row: any) => <span className="text-xs text-slate-500 whitespace-nowrap">{row.actual_end ? new Date(row.actual_end).toLocaleDateString() : 'N/A'}</span> }
  ];

  return (
    <div className="space-y-6 animate-fadeIn w-full text-slate-800">
      {/* Modern Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200 shrink-0">
            <BarChart2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance Analytical Reports & Audits</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Generate, filter, and export comprehensive equipment history, breakdown frequency, downtime impact, and cost analytics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / Export PDF
          </button>
          <button
            onClick={fetchReport}
            className="p-2 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            title="Refresh Report"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Report Selection Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <span className="text-xs font-semibold text-slate-500 uppercase">Select Report Type:</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="text-sm font-medium border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="history">Maintenance History Report</option>
            <option value="breakdown">Equipment Breakdown Report</option>
            <option value="downtime">Downtime Analysis Report</option>
            <option value="pm">Preventive Maintenance Schedule Report</option>
            <option value="cost">Maintenance Expenditure Report</option>
            <option value="parts">Spare Parts Consumption Report</option>
            <option value="reliability">Asset Reliability & MTBF Report</option>
          </select>
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <LoadingState message="Generating analytical maintenance report data..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReport} />
      ) : (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 capitalize border-b border-slate-100 pb-3">
            {reportType.replace('_', ' ')} Report Results ({reportData?.workOrders?.length || 0} Records)
          </h3>
          <DataTable
            data={reportData?.workOrders || []}
            columns={historyColumns}
          />
        </div>
      )}
    </div>
  );
};

export default MaintenanceReportsPage;
