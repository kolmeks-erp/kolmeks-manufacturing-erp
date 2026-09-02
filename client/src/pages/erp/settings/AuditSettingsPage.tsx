import React, { useEffect, useState } from 'react';
import { SettingsNavigationHeader } from './SettingsNavigationHeader';
import { settingsService } from '../../../services/settings.service';
import { AuditLogItem } from '../../../types/settings';
import { FileCheck, ShieldAlert, Eye, X, Filter } from 'lucide-react';

export const AuditSettingsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter, severityFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getAuditLogs({
        module: moduleFilter || undefined,
        severity: severityFilter || undefined
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          Enterprise Audit Log Center
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Centralized event audit trail capturing user actions, configuration modifications, and security events.
        </p>
      </div>

      <SettingsNavigationHeader />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-sm">
        <div className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300">
          <Filter className="w-4 h-4 text-blue-600" />
          Filter Activity:
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
        >
          <option value="">All Modules</option>
          <option value="Settings">Settings</option>
          <option value="Security">Security</option>
          <option value="HR">HR</option>
          <option value="Sales">Sales</option>
          <option value="Procurement">Procurement</option>
          <option value="Quality">Quality</option>
          <option value="Documents">Documents</option>
          <option value="Workflows">Workflows</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
        >
          <option value="">All Severities</option>
          <option value="INFO">INFO</option>
          <option value="WARNING">WARNING</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="SECURITY">SECURITY</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Target Record</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {log.actor?.full_name || log.actor?.email || 'System'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">{log.action}</td>
                  <td className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400">{log.module}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-mono text-xs">{log.target_record || '—'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        log.severity === 'SECURITY'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                          : log.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No audit records match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Audit Event Detail
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Action:</span>
                <span className="font-bold text-gray-900 dark:text-white">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Module:</span>
                <span className="font-semibold text-blue-600">{selectedLog.module}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Actor:</span>
                <span className="font-medium">{selectedLog.actor?.full_name || selectedLog.actor?.email || 'System'}</span>
              </div>

              {selectedLog.old_values && (
                <div>
                  <span className="text-gray-500 block mb-1 font-semibold">Previous Values:</span>
                  <pre className="p-2 bg-gray-50 dark:bg-gray-900 rounded font-mono text-[11px] overflow-x-auto text-red-600 dark:text-red-400">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <span className="text-gray-500 block mb-1 font-semibold">New Values:</span>
                  <pre className="p-2 bg-gray-50 dark:bg-gray-900 rounded font-mono text-[11px] overflow-x-auto text-emerald-600 dark:text-emerald-400">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
