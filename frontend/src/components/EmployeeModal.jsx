import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle, Loader2 } from 'lucide-react';

const VALID_DEPARTMENTS = [
  'IT',
  'QA',
  'HR',
  'Finance',
  'Engineering',
  'Operations',
  'Marketing',
];

const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

export default function EmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  employee = null,
  isSubmitting = false,
  apiError = null,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'IT',
    salary: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const isEditMode = Boolean(employee);

  // Pre-fill form when editing
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        department: employee.department || 'IT',
        salary: employee.salary !== undefined ? String(employee.salary) : '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        department: 'IT',
        salary: '',
      });
    }
    setErrors({});
    setTouched({});
  }, [employee, isOpen]);

  // Handle ESC key close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Validate form fields on the client
  const validate = (values = formData) => {
    const newErrors = {};

    // Name validation
    if (!values.name || !values.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (values.name.trim().length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters.';
    }

    // Email validation
    if (!values.email || !values.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(values.email.trim())) {
      newErrors.email = 'Please enter a valid email format (e.g. user@example.com).';
    }

    // Department validation
    if (!values.department) {
      newErrors.department = 'Please select a department.';
    } else if (!VALID_DEPARTMENTS.includes(values.department)) {
      newErrors.department = 'Invalid department selected.';
    }

    // Salary validation
    if (values.salary === '' || values.salary === null || values.salary === undefined) {
      newErrors.salary = 'Salary is required.';
    } else {
      const numSalary = Number(values.salary);
      if (isNaN(numSalary)) {
        newErrors.salary = 'Salary must be a valid numeric amount.';
      } else if (numSalary < 0) {
        newErrors.salary = 'Salary cannot be negative.';
      } else if (numSalary > 1_000_000_000) {
        newErrors.salary = 'Salary exceeds realistic threshold.';
      }
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (touched[name]) {
      const validationErrors = validate(updated);
      setErrors((prev) => ({
        ...prev,
        [name]: validationErrors[name] || undefined,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const validationErrors = validate(formData);
    setErrors((prev) => ({
      ...prev,
      [name]: validationErrors[name] || undefined,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      department: true,
      salary: true,
    });

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Payload formatted for backend
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      department: formData.department,
      salary: Number(formData.salary),
    };

    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              {isEditMode ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditMode ? 'Edit Employee Record' : 'Add New Employee'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditMode ? `Updating employee #${employee.id}` : 'Fill in the information below to add a new staff member.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global API Error Alert (e.g. 409 conflict or server 500) */}
        {apiError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">{apiError}</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="employee-name-input"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:outline-hidden focus:ring-2 transition-colors ${
                errors.name
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-300 focus:border-sky-500 focus:ring-sky-200'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              id="employee-email-input"
              placeholder="e.g. rahul.sharma@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:outline-hidden focus:ring-2 transition-colors ${
                errors.email
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-300 focus:border-sky-500 focus:ring-sky-200'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Department & Salary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                name="department"
                id="employee-dept-input"
                value={formData.department}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
                className={`w-full px-3.5 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:outline-hidden focus:ring-2 transition-colors cursor-pointer ${
                  errors.department
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-sky-500 focus:ring-sky-200'
                }`}
              >
                {VALID_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.department}</p>
              )}
            </div>

            {/* Annual Salary */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Salary (USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-semibold">
                  $
                </span>
                <input
                  type="number"
                  step="any"
                  name="salary"
                  id="employee-salary-input"
                  placeholder="50000"
                  value={formData.salary}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  className={`w-full pl-8 pr-3.5 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:outline-hidden focus:ring-2 transition-colors ${
                    errors.salary
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-slate-300 focus:border-sky-500 focus:ring-sky-200'
                  }`}
                />
              </div>
              {errors.salary && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.salary}</p>
              )}
            </div>

          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-employee-form"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-5 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEditMode ? 'Update Record' : 'Save Employee'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
