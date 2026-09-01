import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrOperationsService } from '../../../services/hr_operations.service';
import { WorkingCalendarSettings } from '../../../types/hr_operations';
import { Calendar, Clock, Save, ShieldCheck, CheckCircle } from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const WorkingCalendarPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<WorkingCalendarSettings>({
    year: 2026,
    weekly_off_days: ['Sunday'],
    work_start_time: '09:00:00',
    work_end_time: '18:00:00',
    grace_period_minutes: 15,
    overtime_multiplier: 1.5,
  });

  const [message, setMessage] = useState<string>('');

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['workingCalendarSettings'],
    queryFn: hrOperationsService.getWorkingCalendarSettings,
  });

  useEffect(() => {
    if (settingsData) {
      setFormData(settingsData);
    }
  }, [settingsData]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<WorkingCalendarSettings>) =>
      hrOperationsService.updateWorkingCalendarSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workingCalendarSettings'] });
      setMessage('Working Calendar Settings saved successfully!');
      setTimeout(() => setMessage(''), 4000);
    },
  });

  const toggleDay = (day: string) => {
    const current = [...formData.weekly_off_days];
    const index = current.indexOf(day);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(day);
    }
    setFormData({ ...formData, weekly_off_days: current });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          Working Calendar & Shift Policy Configuration
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure weekly off days, standard office hours, late grace limits, and overtime multipliers for automated payroll & attendance rules.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          {message}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-sm">
        {/* Calendar Year */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Target Calendar Year
          </label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value, 10) || 2026 })}
            className="w-48 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
          />
        </div>

        {/* Weekly Off Days */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Weekly Off Days
          </label>
          <div className="flex flex-wrap gap-3">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = formData.weekly_off_days.includes(day);
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Working Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Standard Work Start Time
            </label>
            <input
              type="time"
              value={formData.work_start_time}
              onChange={(e) => setFormData({ ...formData, work_start_time: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Standard Work End Time
            </label>
            <input
              type="time"
              value={formData.work_end_time}
              onChange={(e) => setFormData({ ...formData, work_end_time: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Grace Period & Overtime Multiplier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Late Check-In Grace Period (Minutes)
            </label>
            <input
              type="number"
              value={formData.grace_period_minutes}
              onChange={(e) => setFormData({ ...formData, grace_period_minutes: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-500 mt-1">Arrivals within grace period will not mark employee LATE.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Overtime Pay Rate Multiplier
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.overtime_multiplier}
              onChange={(e) => setFormData({ ...formData, overtime_multiplier: parseFloat(e.target.value) || 1.0 })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-500 mt-1">e.g. 1.5x hourly rate for extra hours worked.</p>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm gap-2"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
