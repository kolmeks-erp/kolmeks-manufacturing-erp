import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Building2, Filter, RefreshCw } from 'lucide-react';
import { DateRangePreset, GlobalReportFilters } from '../../types/reports';
import { settingsService } from '../../services/settings.service';
import { LocationSetting, DepartmentSetting } from '../../types/settings';

interface GlobalReportFilterBarProps {
  filters: GlobalReportFilters;
  onChange: (filters: GlobalReportFilters) => void;
  onRefresh?: () => void;
  showStatusFilter?: boolean;
  statuses?: string[];
}

export const GlobalReportFilterBar: React.FC<GlobalReportFilterBarProps> = ({
  filters,
  onChange,
  onRefresh,
  showStatusFilter = false,
  statuses = []
}) => {
  const [locations, setLocations] = useState<LocationSetting[]>([]);
  const [departments, setDepartments] = useState<DepartmentSetting[]>([]);

  useEffect(() => {
    settingsService.getLocations().then(setLocations).catch(console.error);
    settingsService.getDepartments().then(setDepartments).catch(console.error);
  }, []);

  const handleRangeChange = (preset: DateRangePreset) => {
    onChange({
      ...filters,
      date_range: preset
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Date Range Buttons & Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase mr-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Time Horizon:</span>
          </div>

          <select
            value={filters.date_range}
            onChange={(e) => handleRangeChange(e.target.value as DateRangePreset)}
            aria-label="Time Horizon"
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="this_month">This Month</option>
            <option value="previous_month">Previous Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_year">This Year</option>
            <option value="custom">Custom Range</option>
            <option value="all">All Time</option>
          </select>

          {filters.date_range === 'custom' && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={filters.start_date || ''}
                onChange={(e) => onChange({ ...filters, start_date: e.target.value })}
                aria-label="Start Date"
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={filters.end_date || ''}
                onChange={(e) => onChange({ ...filters, end_date: e.target.value })}
                aria-label="End Date"
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Location & Department Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Location */}
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <select
              value={filters.location_id || ''}
              onChange={(e) => onChange({ ...filters, location_id: e.target.value || undefined })}
              aria-label="Filter by Location"
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.code})
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <select
              value={filters.department_id || ''}
              onChange={(e) => onChange({ ...filters, department_id: e.target.value || undefined })}
              aria-label="Filter by Department"
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status optional */}
          {showStatusFilter && (
            <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <Filter className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <select
                value={filters.status || ''}
                onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
                aria-label="Filter by Status"
                className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none capitalize"
              >
                <option value="">All Statuses</option>
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              aria-label="Refresh Report Data"
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition flex items-center justify-center"
              title="Refresh Report Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
