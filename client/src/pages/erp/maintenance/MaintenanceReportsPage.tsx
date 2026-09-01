import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Download, FileSpreadsheet, Filter, RefreshCw, Printer, ShieldCheck 
} from 'lucide-react';
import { ERPLayout } from '../../../layouts/ERPLayout';
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
    { header: 'WO Number', accessor: (row: any) => <span className="font-mono text-sm font-semibold text-slate-900">{row.work_order_number}</span> },
    { header: 'Title', accessor: (row: any) => <span className="text-slate-900 font-medium">{row.title}</span> },
    { header: 'Asset', accessor: (row: any) => <span className="text-slate-700">{row.assets?.name || 'N/A'}</span> },
    { header: 'Type', accessor: (row: any) => <span className="text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-medium">{row.maintenance_type}</span> },
    { header: 'Status', accessor: (row: any) => <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">{row.status}</span> },
    { header: 'Completed Date', accessor: (row: any) => <span className="text-xs text-slate-500">{row.actual_end ? new Date(row.actual_end).toLocaleDateString() : 'N/A'}</span> }
  ];

  return (
    <ERPLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <ERPPageHeader
          title="Maintenance Analytical Reports & Audits"
          subtitle="Generate, filter, and export comprehensive equipment history, breakdown frequency, downtime impact, and cost analytics."
          icon={BarChart2}
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <Printer className="w-4 h-4" /> Print / Export PDF
              </button>
              <button
                onClick={fetchReport}
                className="p-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                title="Refresh Report"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          }
        />

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
    </ERPLayout>
  );
};

export default MaintenanceReportsPage;
