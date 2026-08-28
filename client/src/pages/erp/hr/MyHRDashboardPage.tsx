import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ERPPageHeader from '../../../components/erp/ERPPageHeader';
import LoadingState from '../../../components/erp/LoadingState';
import ErrorState from '../../../components/erp/ErrorState';
import { hrOperationsService } from '../../../services/hr_operations.service';
import { MyProfileData } from '../../../types/hr_operations';
import { UserCheck, Clock, Calendar, CheckCircle2, LogIn, LogOut, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

const MyHRDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<MyProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrOperationsService.getMyProfile();
      setProfileData(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load employee profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      const res = await hrOperationsService.checkIn();
      alert(res.notes || 'Check-in recorded successfully!');
      fetchProfile();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Check-in failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      const res = await hrOperationsService.checkOut();
      alert(`Check-out recorded successfully! Worked: ${(res.worked_minutes / 60).toFixed(1)} Hours.`);
      fetchProfile();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAtt = profileData?.recentAttendance.find(a => a.attendance_date === todayStr);

  return (
    <div className="space-y-6">
      <ERPPageHeader
        title="Employee Self-Service Portal (My HR)"
        subtitle="Manage your profile, daily shift attendance, leave balances, and request submissions"
      />

      {loading ? (
        <LoadingState message="Loading your personal HR profile..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProfile} />
      ) : (
        <div className="space-y-6">
          {/* Profile & Shift Overview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-slate-700">
                  {profileData?.employee.first_name[0]}{profileData?.employee.last_name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">
                      {profileData?.employee.first_name} {profileData?.employee.last_name}
                    </h2>
                    <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 rounded-md border border-cyan-500/20">
                      {profileData?.employee.employee_code}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mt-0.5">
                    {profileData?.employee.designation} • <span className="text-slate-400">{profileData?.employee.department?.name || 'Manufacturing'}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Joining Date: {profileData?.employee.joining_date} • Shift: <span className="text-indigo-400 font-medium">{profileData?.employee.shift?.name || 'General Shift'} ({profileData?.employee.shift?.start_time?.substring(0, 5) || '09:00'} - {profileData?.employee.shift?.end_time?.substring(0, 5) || '18:00'})</span>
                  </p>
                </div>
              </div>

              {/* Attendance Clock Action Box */}
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex flex-col items-center justify-center min-w-[280px]">
                <span className="text-xs font-semibold text-slate-400 mb-2">TODAY'S SHIFT ATTENDANCE ({todayStr})</span>
                {todayAtt?.check_in ? (
                  <div className="text-center space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-bold justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                      Checked-In at {new Date(todayAtt.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {todayAtt.check_out ? (
                      <div className="text-cyan-400 font-mono text-sm font-bold">
                        Checked-Out at {new Date(todayAtt.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({(todayAtt.worked_minutes / 60).toFixed(1)} hrs)
                      </div>
                    ) : (
                      <button
                        onClick={handleCheckOut}
                        disabled={actionLoading}
                        className="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-lg shadow transition-all disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4 mr-1.5" />
                        {actionLoading ? 'Recording...' : 'Check-Out Now'}
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg shadow-lg transition-all disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {actionLoading ? 'Recording...' : 'Check-In Now'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Leave Entitlements Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-cyan-400" />
                My Leave Entitlements & Balances ({new Date().getFullYear()})
              </h3>
              <button
                onClick={() => navigate('/secure-kolmeks-x0y0/my-hr/leave')}
                className="text-xs text-cyan-400 hover:underline font-medium flex items-center"
              >
                Apply for Leave <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {profileData?.leaveBalances && profileData.leaveBalances.length > 0 ? (
                profileData.leaveBalances.map((b) => (
                  <div key={b.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{b.leave_type?.name}</span>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-2xl font-bold text-emerald-400">{b.remaining_days} <span className="text-xs font-normal text-slate-400">Left</span></span>
                      <span className="text-xs text-slate-400">{b.used_days} / {b.allocated_days} Used</span>
                    </div>
                    {b.pending_days > 0 && (
                      <span className="text-[11px] text-amber-400 font-medium block mt-1">({b.pending_days} days pending approval)</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-4 p-4 text-center text-xs text-slate-400 italic bg-slate-800/30 rounded-lg">
                  No leave quotas allocated for the current year yet.
                </div>
              )}
            </div>
          </div>

          {/* Self-Service Workspaces */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => navigate('/secure-kolmeks-x0y0/my-hr/attendance')}
              className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-xl p-5 cursor-pointer transition-all hover:border-cyan-500/50 group"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-white text-base flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-indigo-400" />
                  My Attendance Records
                </h4>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-400 mt-2">View monthly check-in history, late minutes, worked hours, and submit correction requests.</p>
            </div>

            <div
              onClick={() => navigate('/secure-kolmeks-x0y0/my-hr/leave')}
              className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-xl p-5 cursor-pointer transition-all hover:border-cyan-500/50 group"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-white text-base flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-emerald-400" />
                  My Leave Applications & History
                </h4>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-400 mt-2">Submit new leave requests, check approval progress, and view past leave history.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyHRDashboardPage;
