import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const TableContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge('w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs', className)} {...props}>
    {children}
  </div>
);

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ children, className, ...props }) => (
  <table className={twMerge('w-full text-left text-sm text-slate-700', className)} {...props}>
    {children}
  </table>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
  <thead className={twMerge('bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold', className)} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
  <tbody className={twMerge('divide-y divide-slate-100 bg-white', className)} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className, ...props }) => (
  <tr className={twMerge('hover:bg-slate-50/80 transition-colors', className)} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
  <th className={twMerge('px-6 py-3.5 font-semibold text-slate-700', className)} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
  <td className={twMerge('px-6 py-4 whitespace-nowrap text-slate-700', className)} {...props}>
    {children}
  </td>
);
