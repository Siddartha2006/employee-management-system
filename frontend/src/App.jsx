import React, { useState, useEffect, useCallback } from 'react';
import apiService from './services/api';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import EmployeeTable from './components/EmployeeTable';
import EmployeeModal from './components/EmployeeModal';
import EmployeeDetailModal from './components/EmployeeDetailModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import QADashboard from './components/QADashboard';
import Toast from './components/Toast';

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Backend Health State
  const [healthStatus, setHealthStatus] = useState('healthy');
  const [isHealthChecking, setIsHealthChecking] = useState(false);

  // Modals & Panels State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEmployee, setModalEmployee] = useState(null); // null for Add, employee object for Edit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalApiError, setModalApiError] = useState(null);

  const [detailEmployee, setDetailEmployee] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [deleteEmployee, setDeleteEmployee] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showQAPanel, setShowQAPanel] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Check Backend Health
  const checkBackendHealth = useCallback(async () => {
    setIsHealthChecking(true);
    try {
      const data = await apiService.checkHealth();
      if (data && data.status === 'healthy') {
        setHealthStatus('healthy');
      } else {
        setHealthStatus('unhealthy');
      }
    } catch {
      setHealthStatus('unhealthy');
    } finally {
      setIsHealthChecking(false);
    }
  }, []);

  // Fetch Employees from API
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getEmployees({
        search: searchTerm,
        department: selectedDepartment,
      });
      setEmployees(data.employees || []);
    } catch (err) {
      setError(err.message || 'Unable to connect to employee API server.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedDepartment]);

  // Initial Load & Debounced Search Filter Effect
  useEffect(() => {
    checkBackendHealth();
  }, [checkBackendHealth]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 250); // 250ms debounce for search input

    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  // Handlers for Add / Edit Modal
  const handleOpenAddModal = () => {
    setModalEmployee(null);
    setModalApiError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setModalEmployee(emp);
    setModalApiError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setModalEmployee(null);
      setModalApiError(null);
    }
  };

  const handleModalSubmit = async (formData) => {
    setIsSubmitting(true);
    setModalApiError(null);
    try {
      if (modalEmployee) {
        // Edit Mode (PUT)
        const res = await apiService.updateEmployee(modalEmployee.id, formData);
        showToast(res.message || 'Employee record updated successfully.', 'success');
      } else {
        // Create Mode (POST)
        const res = await apiService.createEmployee(formData);
        showToast(res.message || 'New employee created successfully.', 'success');
      }
      setIsModalOpen(false);
      setModalEmployee(null);
      fetchEmployees();
    } catch (err) {
      setModalApiError(err.message || 'Operation failed. Please review your input.');
      if (err.errors) {
        const firstErrorKey = Object.keys(err.errors)[0];
        setModalApiError(err.errors[firstErrorKey] || err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for Employee Detail Modal
  const handleOpenDetailModal = (emp) => {
    setDetailEmployee(emp);
    setIsDetailOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailOpen(false);
    setDetailEmployee(null);
  };

  // Handlers for Delete Confirmation Modal
  const handleOpenDeleteModal = (emp) => {
    setDeleteEmployee(emp);
    setIsDeleteOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setIsDeleteOpen(false);
      setDeleteEmployee(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteEmployee) return;
    setIsDeleting(true);
    try {
      const res = await apiService.deleteEmployee(deleteEmployee.id);
      showToast(res.message || 'Employee record deleted successfully.', 'success');
      setIsDeleteOpen(false);
      setDeleteEmployee(null);
      fetchEmployees();
    } catch (err) {
      showToast(err.message || 'Failed to delete employee.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Application Header */}
      <Header
        onAddClick={handleOpenAddModal}
        healthStatus={healthStatus}
        onRefreshHealth={checkBackendHealth}
        isHealthChecking={isHealthChecking}
        showQAPanel={showQAPanel}
        setShowQAPanel={setShowQAPanel}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* QA Testing Matrix Section (Toggleable or Visible) */}
        {showQAPanel && <QADashboard />}

        {/* Dynamic Metric / Summary Cards */}
        <SummaryCards employees={employees} />

        {/* Main Employee Data Table */}
        <EmployeeTable
          employees={employees}
          isLoading={isLoading}
          error={error}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          onRefresh={fetchEmployees}
          onAddEmployee={handleOpenAddModal}
          onViewEmployee={handleOpenDetailModal}
          onEditEmployee={handleOpenEditModal}
          onDeleteEmployee={handleOpenDeleteModal}
        />

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Employee Management System &bull; Production Architecture (Flask REST API + React)
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-mono text-slate-400">Render (Backend) &bull; Vercel (Frontend)</span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        employee={modalEmployee}
        isSubmitting={isSubmitting}
        apiError={modalApiError}
      />

      {/* View Detail Modal */}
      <EmployeeDetailModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetailModal}
        employee={detailEmployee}
        onEdit={(emp) => {
          handleCloseDetailModal();
          handleOpenEditModal(emp);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        employee={deleteEmployee}
        isDeleting={isDeleting}
      />

      {/* Global Toast Alerts */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

    </div>
  );
}
