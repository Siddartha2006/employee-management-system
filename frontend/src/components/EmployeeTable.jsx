import React from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Edit2, 
  Trash2, 
  UserX, 
  Plus,
  ArrowUpDown,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const DEPARTMENT_BADGES = {
  IT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  QA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  HR: 'bg-rose-50 text-rose-700 border-rose-200',
  Finance: 'bg-amber-50 text-amber-700 border-amber-200',
  Engineering: 'bg-sky-50 text-sky-700 border-sky-200',
  Operations: 'bg-purple-50 text-purple-700 border-purple-200',
  Marketing: 'bg-pink-50 text-pink-700 border-pink-200',
};

const ALL_DEPARTMENTS = [
  'IT',
  'QA',
  'HR',
  'Finance',
  'Engineering',
  'Operations',
  'Marketing'
];

export default function EmployeeTable({
  employees = [],
  isLoading,
  error,
  searchTerm,
  setSearchTerm,
  selectedDepartment,
  setSelectedDepartment,
  onRefresh,
  onAddEmployee,
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee,
}) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'E';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Controls Bar: Search, Department Filter, Refresh */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="search-input"
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right: Filters & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Department Filter */}
            <div className="relative min-w-[160px]">
              <select
                id="department-filter"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-white text-sm text-slate-700 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium transition-colors cursor-pointer"
              >
                <option value="">All Departments</option>
                {ALL_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              id="btn-refresh-table"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium border border-slate-300 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              title="Refresh employee data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Clear All Filters Button (if filtered) */}
            {(searchTerm || selectedDepartment) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDepartment('');
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Main Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">ID</th>
              <th className="py-3.5 px-4 sm:px-6">Employee</th>
              <th className="py-3.5 px-4 sm:px-6">Department</th>
              <th className="py-3.5 px-4 sm:px-6">Annual Salary</th>
              <th className="py-3.5 px-4 sm:px-6 hidden md:table-cell">Created Date</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            
            {/* Loading Skeletons */}
            {isLoading && (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="h-4 bg-slate-200 rounded w-8"></div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200"></div>
                        <div className="space-y-1.5">
                          <div className="h-4 bg-slate-200 rounded w-32"></div>
                          <div className="h-3 bg-slate-200 rounded w-48"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="h-4 bg-slate-200 rounded w-20"></div>
                    </td>
                    <td className="py-4 px-4 sm:px-6 hidden md:table-cell">
                      <div className="h-4 bg-slate-200 rounded w-24"></div>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="inline-flex space-x-2">
                        <div className="h-8 bg-slate-200 rounded w-8"></div>
                        <div className="h-8 bg-slate-200 rounded w-8"></div>
                        <div className="h-8 bg-slate-200 rounded w-8"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <tr>
                <td colSpan="6" className="py-12 px-4 text-center">
                  <div className="max-w-md mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mb-3">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">
                      Failed to Load Employees
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      {error}
                    </p>
                    <button
                      onClick={onRefresh}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty State */}
            {!isLoading && !error && employees.length === 0 && (
              <tr>
                <td colSpan="6" className="py-16 px-4 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
                      <UserX className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">
                      No Employees Found
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 mb-5">
                      {searchTerm || selectedDepartment
                        ? 'No records match your active search or filter criteria.'
                        : 'Get started by creating your first employee record.'}
                    </p>
                    {searchTerm || selectedDepartment ? (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedDepartment('');
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Reset Filter Criteria
                      </button>
                    ) : (
                      <button
                        onClick={onAddEmployee}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add First Employee</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {/* Data Rows */}
            {!isLoading && !error && employees.map((employee) => {
              const badgeClass = DEPARTMENT_BADGES[employee.department] || 'bg-slate-100 text-slate-700 border-slate-200';
              return (
                <tr 
                  key={employee.id} 
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* ID */}
                  <td className="py-4 px-4 sm:px-6 font-mono text-xs font-semibold text-slate-500">
                    #{employee.id}
                  </td>

                  {/* Name & Email */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 group-hover:border-sky-300 group-hover:bg-sky-50 group-hover:text-sky-700 transition-colors">
                        {getInitials(employee.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 leading-tight">
                          {employee.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-4 px-4 sm:px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}>
                      {employee.department}
                    </span>
                  </td>

                  {/* Salary */}
                  <td className="py-4 px-4 sm:px-6 font-semibold text-slate-900">
                    {formatCurrency(employee.salary)}
                  </td>

                  {/* Created Date */}
                  <td className="py-4 px-4 sm:px-6 hidden md:table-cell text-xs text-slate-500">
                    {formatDate(employee.created_at)}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="inline-flex items-center space-x-1">
                      
                      {/* View Button */}
                      <button
                        onClick={() => onViewEmployee(employee)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
                        title="View employee details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => onEditEmployee(employee)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        title="Edit employee"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDeleteEmployee(employee)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </td>
                </tr>
              );
            })}

          </tbody>
        </table>
      </div>

      {/* Footer Info / Row Count */}
      <div className="py-3 px-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-700">{employees.length}</span> employee records
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Real-time REST API Synchronization</span>
        </div>
      </div>

    </div>
  );
}
