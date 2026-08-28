import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { hrOperationsService } from '../../../services/hr_operations.service';
import { HRDashboardKPIs } from '../../../types/hr_operations';
import { Users, CheckCircle, Clock, Calendar, AlertCircle, CalendarRange, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';

const HRDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<HRDashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrOperationsService.getDashboardKPIs();
      setKpis(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load HR metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="HR Operations & Plant Workforce Dashboard"
        subtitle="Manage employee shifts, real-time attendance, leave requests, and workforce analytics"
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/secure-kolmeks-x0y0/my-hr')}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-all"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Employee Self-Service (My HR)
            </button>
          </div>
        }
      />

      {loading ? (
        <LoadingState message="Loading HR Operations telemetry..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchMetrics} />
      ) : (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm font-medium">Total Plant Employees</span>
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-bold text-white">{kpis?.totalEmployees || 0}</span>
                <span className="text-xs text-slate-400 block mt-1">Active manufacturing staff</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm font-medium">Present Today</span>
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-bold text-emerald-400">{kpis?.presentToday || 0}</span>
                <span className="text-xs text-slate-400 block mt-1">Checked-in on shift</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm font-medium">Late Arrivals</span>
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-bold text-amber-400">{kpis?.lateToday || 0}</span>
                <span className="text-xs text-slate-400 block mt-1">Beyond shift grace time</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm font-medium">Pending Leave Requests</span>
                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg">
                  <CalendarRange className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-bold text-purple-400">{kpis?.pendingLeaveRequests || 0}</span>
                <span className="text-xs text-slate-400 block mt-1">Awaiting manager approval</span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-cyan-400" />
                HR Management Workspaces
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => navigate('/secure-kolmeks-x0y0/hr/attendance')}
                  className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-4 cursor-pointer transition-all hover:border-cyan-500/50 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-base">Attendance Logs</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Monitor check-in/out timestamps, late minutes, worked hours, and corrections.</p>
                </div>

                <div
                  onClick={() => navigate('/secure-kolmeks-x0y0/hr/leave/requests')}
                  className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-4 cursor-pointer transition-all hover:border-cyan-500/50 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-base">Leave Requests Queue</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Review pending leave applications, approve entitlements, or reject with comments.</p>
                </div>

                <div
                  onClick={() => navigate('/secure-kolmeks-x0y0/hr/shifts')}
                  className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-4 cursor-pointer transition-all hover:border-cyan-500/50 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-base">Shift Management</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Configure factory working shifts (Shift A/B/Night) and assign employees.</p>
                </div>

                <div
                  onClick={() => navigate('/secure-kolmeks-x0y0/hr/leave/types')}
                  className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-4 cursor-pointer transition-all hover:border-cyan-500/50 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-base">Leave Policies & Balances</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Configure Casual, Sick, Paid Annual leave policies and allocate yearly quotas.</p>
                </div>
              </div>
            </div>

            {/* Upcoming Factory Holidays */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-emerald-400" />
                  Upcoming Holidays
                </h3>
                <button
                  onClick={() => navigate('/secure-kolmeks-x0y0/hr/holidays')}
                  className="text-xs text-cyan-400 hover:underline font-medium"
                >
                  View All
                </button>
              </div>

              {kpis?.upcomingHolidays && kpis.upcomingHolidays.length > 0 ? (
                <div className="space-y-3">
                  {kpis.upcomingHolidays.map((h) => (
                    <div key={h.id} className="p-3 bg-slate-800/50 border border-slate-700/40 rounded-lg flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-white">{h.name}</h4>
                        <p className="text-xs text-slate-400">{h.description || 'Statutory company holiday'}</p>
                      </div>
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
                        {h.holiday_date}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No upcoming holidays scheduled in the system calendar.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboardPage;
