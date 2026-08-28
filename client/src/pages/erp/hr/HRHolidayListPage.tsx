import React, { useEffect, useState } from 'react';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { hrOperationsService } from '../../../services/hr_operations.service';
import { Holiday } from '../../../types/hr_operations';
import { Calendar, Plus } from 'lucide-react';

const HRHolidayListPage: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrOperationsService.getHolidays();
      setHolidays(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load holiday calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) return;

    try {
      setSubmitting(true);
      await hrOperationsService.createHoliday({
        name,
        holiday_date: date,
        description,
      });
      setShowModal(false);
      setName('');
      setDate('');
      setDescription('');
      fetchHolidays();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to add holiday.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Holiday Date',
      accessor: (row: Holiday) => (
        <span className="font-mono text-emerald-400 font-bold">{row.holiday_date}</span>
      ),
    },
    {
      header: 'Holiday Name',
      accessor: (row: Holiday) => (
        <span className="font-medium text-white">{row.name}</span>
      ),
    },
    {
      header: 'Description',
      accessor: (row: Holiday) => (
        <span className="text-slate-400 text-xs">{row.description || 'Statutory company holiday'}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: Holiday) => (
        <StatusBadge status={row.status} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Factory Statutory & Company Holiday Calendar"
        subtitle="Manage official holidays, factory closures, and statutory days off"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium shadow-sm transition-all text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Holiday
          </button>
        }
      />

      {loading ? (
        <LoadingState message="Loading holiday calendar..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchHolidays} />
      ) : (
        <div className="space-y-6">
          <DataTable
            data={holidays}
            columns={columns}
            searchable={true}
            searchPlaceholder="Search by holiday name or date..."
          />

          {/* New Holiday Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">Add Factory Holiday</h3>
                <p className="text-xs text-slate-400 mb-4">Add a new statutory or company holiday to the plant calendar.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Holiday Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Independence Day"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Holiday Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional notes"
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                    >
                      {submitting ? 'Adding...' : 'Save Holiday'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HRHolidayListPage;
