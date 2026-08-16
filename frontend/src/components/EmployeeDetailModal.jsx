import React, { useEffect } from 'react';
import { X, User, Mail, Building2, DollarSign, Calendar, Edit2, Clock } from 'lucide-react';

const DEPARTMENT_BADGES = {
  IT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  QA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  HR: 'bg-rose-50 text-rose-700 border-rose-200',
  Finance: 'bg-amber-50 text-amber-700 border-amber-200',
  Engineering: 'bg-sky-50 text-sky-700 border-sky-200',
  Operations: 'bg-purple-50 text-purple-700 border-purple-200',
  Marketing: 'bg-pink-50 text-pink-700 border-pink-200',
};

export default function EmployeeDetailModal({
  isOpen,
  onClose,
  employee,
  onEdit,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !employee) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  const badgeClass = DEPARTMENT_BADGES[employee.department] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-xs font-bold">
              ID #{employee.id}
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              Employee Profile Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Banner */}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-sky-100">
              {employee.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {employee.name}
              </h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border mt-1 ${badgeClass}`}>
                {employee.department}
              </span>
            </div>
          </div>

          {/* Details List */}
          <div className="space-y-4 text-sm">
            
            {/* Email */}
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Email Address</p>
                <p className="text-sm font-semibold text-slate-800 break-all">{employee.email}</p>
              </div>
            </div>

            {/* Department */}
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Department Unit</p>
                <p className="text-sm font-semibold text-slate-800">{employee.department}</p>
              </div>
            </div>

            {/* Salary */}
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 mt-0.5">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Annual Compensation</p>
                <p className="text-base font-bold text-slate-900">{formatCurrency(employee.salary)}</p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="flex items-center space-x-1.5 text-slate-500 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-medium">Created On</span>
                </div>
                <span className="font-semibold text-slate-700">{formatDateTime(employee.created_at)}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="flex items-center space-x-1.5 text-slate-500 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-medium">Last Modified</span>
                </div>
                <span className="font-semibold text-slate-700">{formatDateTime(employee.updated_at)}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onEdit(employee);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Employee</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
