import axios from 'axios';

// Resolve base URL from environment or default to local development API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s timeout
});

// Response interceptor for centralized error response formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error message extraction
    const customError = {
      message: 'Network error or server unreachable. Please check backend connection.',
      status: error.response ? error.response.status : null,
      errors: null,
    };

    if (error.response && error.response.data) {
      const data = error.response.data;
      customError.message = data.error || data.message || customError.message;
      customError.errors = data.errors || null;
    }

    return Promise.reject(customError);
  }
);

export const apiService = {
  /**
   * Health check to verify backend connectivity
   */
  async checkHealth() {
    const response = await apiClient.get('/health');
    return response.data;
  },

  /**
   * Retrieve all employees with optional search & department filters
   */
  async getEmployees({ search = '', department = '' } = {}) {
    const params = {};
    if (search && search.trim()) params.search = search.trim();
    if (department && department.trim()) params.department = department.trim();

    const response = await apiClient.get('/employees', { params });
    return response.data;
  },

  /**
   * Retrieve single employee details by ID
   */
  async getEmployee(id) {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  },

  /**
   * Create a new employee record
   */
  async createEmployee(employeeData) {
    const response = await apiClient.post('/employees', employeeData);
    return response.data;
  },

  /**
   * Update an existing employee record by ID
   */
  async updateEmployee(id, employeeData) {
    const response = await apiClient.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  /**
   * Delete an employee record by ID
   */
  async deleteEmployee(id) {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  },
};

export default apiService;
