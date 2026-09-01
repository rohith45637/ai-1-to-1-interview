import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor for clear errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.response?.data?.message || error.message || 'Network error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  getProfile: () => apiClient.get('/api/auth/profile'),
  updateProfile: (data) => apiClient.put('/api/auth/profile', data),
  resetData: () => apiClient.post('/api/auth/reset-data'),
};

export const rolesApi = {
  getRoles: () => apiClient.get('/api/roles'),
  getRoleById: (id) => apiClient.get('/api/roles/' + id),
};

export const resumesApi = {
  uploadResume: (formData) => {
    return apiClient.post('/api/resumes/upload', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
  },
  getVersions: () => apiClient.get('/api/resumes/versions'),
  getLatest: () => apiClient.get('/api/resumes/latest'),
  getById: (id) => apiClient.get('/api/resumes/' + id),
};

export const interviewsApi = {
  createInterview: (data) => apiClient.post('/api/interviews/create', data),
  submitAnswer: (data) => apiClient.post('/api/interviews/answer', data),
  getReport: (id) => apiClient.get('/api/interviews/' + id + '/report'),
  getHistory: () => apiClient.get('/api/interviews/history'),
};

export const skillsApi = {
  getSkills: () => apiClient.get('/api/skills'),
  getWeakAreas: () => apiClient.get('/api/skills/weak-areas'),
};

export const analyticsApi = {
  getDashboard: () => apiClient.get('/api/analytics/dashboard'),
};

export default apiClient;
