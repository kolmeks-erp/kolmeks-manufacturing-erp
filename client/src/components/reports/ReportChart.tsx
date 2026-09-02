import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface ReportChartProps {
  title: string;
  type?: 'bar' | 'line' | 'area' | 'pie';
  data: any[];
  dataKey: string;
  categoryKey: string;
  height?: number;
  color?: string;
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

export const ReportChart: React.FC<ReportChartProps> = ({
  title,
  type = 'bar',
  data,
  dataKey,
  categoryKey,
  height = 300,
  color = '#3b82f6'
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">{title}</h3>

      {data.length === 0 ? (
        <div style={{ height }} className="flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm italic">
          No chart data available for the selected parameters.
        </div>
      ) : (
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey={categoryKey} stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : type === 'line' ? (
              <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey={categoryKey} stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            ) : type === 'area' ? (
              <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey={categoryKey} stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            ) : (
              <PieChart>
                <Pie data={data} dataKey={dataKey} nameKey={categoryKey} cx="50%" cy="50%" outerRadius={90} label>
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend wrapperStyle={{ color: '#64748b', fontSize: '12px' }} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
