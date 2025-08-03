import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gipoly-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('gipoly-token')) {
      localStorage.removeItem('gipoly-token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Workspace API functions
export const workspaceAPI = {
  // Get all workspaces for current user
  getWorkspaces: () => api.get('/api/workspaces/'),
  
  // Create new workspace
  createWorkspace: (data: any) => api.post('/api/workspaces/', data),
  
  // Update workspace
  updateWorkspace: (slug: string, data: any) => api.put(`/api/workspaces/${slug}`, data),
  
  // Delete workspace
  deleteWorkspace: (slug: string) => api.delete(`/api/workspaces/${slug}`),
  
  // Get specific workspace
  getWorkspace: (slug: string) => api.get(`/api/workspaces/${slug}`),
};

export default api; 