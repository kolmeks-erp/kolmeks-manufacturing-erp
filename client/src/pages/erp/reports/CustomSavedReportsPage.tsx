import React, { useEffect, useState } from 'react';
import { Bookmark, Calendar, Plus, Trash2, Mail, CheckCircle } from 'lucide-react';
import { ReportsNavigationHeader } from '../../../components/reports/ReportsNavigationHeader';
import { SavedReport, ReportSchedule } from '../../../types/reports';
import { reportsService } from '../../../services/reports.service';

export const CustomSavedReportsPage: React.FC = () => {
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  // New Saved Report modal state
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [newReportName, setNewReportName] = useState('');
  const [newReportType, setNewReportType] = useState('sales');

  // New Schedule modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleReportType, setScheduleReportType] = useState('sales');
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [scheduleRecipients, setScheduleRecipients] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [savedRes, schedRes] = await Promise.all([
        reportsService.getSavedReports(),
        reportsService.getReportSchedules()
      ]);
      setSavedReports(savedRes);
      setSchedules(schedRes);
    } catch (err) {
      console.error('Failed to load saved reports or schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSavedReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportName) return;
    try {
      await reportsService.createSavedReport({
        name: newReportName,
        report_type: newReportType,
        filters: { date_range: 'this_month' },
        is_shared: false
      });
      setNewReportName('');
      setIsSavedModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create saved report:', err);
    }
  };

  const handleDeleteSavedReport = async (id: string) => {
    try {
      await reportsService.deleteSavedReport(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete saved report:', err);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reportsService.createReportSchedule({
        report_type: scheduleReportType,
        frequency: scheduleFrequency,
        recipients: scheduleRecipients.split(',').map((s) => s.trim()).filter(Boolean),
        format: 'csv',
        is_active: true
      });
      setScheduleRecipients('');
      setIsScheduleModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create report schedule:', err);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await reportsService.deleteReportSchedule(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete report schedule:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Bookmark className="w-7 h-7 text-indigo-400" />
            <span>Saved Custom Reports & Scheduled Automation</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Save custom filter configurations and set up automated scheduled report delivery via email.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSavedModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Save New Report</span>
          </button>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Delivery</span>
          </button>
        </div>
      </div>

      <ReportsNavigationHeader />

      {/* Grid of Saved Reports & Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Reports Card List */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-blue-400" />
            <span>Saved Custom Report Templates ({savedReports.length})</span>
          </h2>

          {loading ? (
            <p className="text-slate-400 text-sm">Loading saved reports...</p>
          ) : savedReports.length === 0 ? (
            <p className="text-slate-500 text-sm italic">No custom report templates saved yet.</p>
          ) : (
            <div className="space-y-3">
              {savedReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-white text-sm">{report.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 capitalize">
                      Module: <span className="text-blue-400 font-semibold">{report.report_type}</span> • Created:{' '}
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSavedReport(report.id)}
                    aria-label="Delete saved report"
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Automation Foundation List */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-5 shadow-lg space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Mail className="w-5 h-5 text-emerald-400" />
            <span>Automated Scheduled Report Delivery ({schedules.length})</span>
          </h2>

          {loading ? (
            <p className="text-slate-400 text-sm">Loading schedules...</p>
          ) : schedules.length === 0 ? (
            <p className="text-slate-500 text-sm italic">No report schedules configured yet.</p>
          ) : (
            <div className="space-y-3">
              {schedules.map((s) => (
                <div
                  key={s.id}
                  className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-white text-sm capitalize flex items-center space-x-2">
                      <span className="text-emerald-400">{s.report_type} Report Delivery</span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold uppercase">
                        {s.frequency}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Recipients: {s.recipients && s.recipients.length > 0 ? s.recipients.join(', ') : 'Self'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSchedule(s.id)}
                    aria-label="Delete scheduled report"
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Report Modal */}
      {isSavedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Save Custom Report Configuration</h3>
            <form onSubmit={handleCreateSavedReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Report Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly High-Value Sales Report"
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Module</label>
                <select
                  value={newReportType}
                  onChange={(e) => setNewReportType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sales">Sales & Commercial</option>
                  <option value="procurement">Procurement</option>
                  <option value="inventory">Inventory</option>
                  <option value="production">Production</option>
                  <option value="quality">Quality</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="hr">HR</option>
                  <option value="finance">Finance</option>
                  <option value="crm">CRM</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSavedModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 font-semibold text-sm rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition shadow-md"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Delivery Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Configure Automated Report Schedule</h3>
            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Report Module</label>
                <select
                  value={scheduleReportType}
                  onChange={(e) => setScheduleReportType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sales">Sales Report</option>
                  <option value="procurement">Procurement Spend Report</option>
                  <option value="inventory">Inventory Stock Report</option>
                  <option value="production">Production Order Report</option>
                  <option value="quality">Quality Control Report</option>
                  <option value="finance">Financial Report</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Frequency</label>
                <select
                  value={scheduleFrequency}
                  onChange={(e) => setScheduleFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Recipient Email(s)</label>
                <input
                  type="text"
                  placeholder="admin@kolmeks.com, manager@kolmeks.com"
                  value={scheduleRecipients}
                  onChange={(e) => setScheduleRecipients(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 font-semibold text-sm rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition shadow-md"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
