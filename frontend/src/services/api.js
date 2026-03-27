import axios from 'axios';

// ─── Base Client ────────────────────────────────────────────
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ──────────────────────────────────────────────────
export const authAPI = {
  loginFreelancer: (email, password) =>
    api.post('/auth/login', { email, password, role: 'freelancer' }),

  loginClient: (email, password) =>
    api.post('/auth/login', { email, password, role: 'client' }),

  registerFreelancer: (data) =>
    api.post('/auth/register-freelancer', data),

  registerClient: (data) =>
    api.post('/auth/register-client', data),
};

// ─── Projects ──────────────────────────────────────────────
export const projectsAPI = {
  // All open projects (browse feed)
  getAll: () => api.get('/projects'),

  // Projects owned by this client
  getForClient: (clientId) => api.get(`/projects/client/${clientId}`),

  // Create a new project
  create: (data) => api.post('/projects', data),
};

// ─── Applications (Apply + Hire) ───────────────────────────
export const applyAPI = {
  // Freelancer submits application
  apply: (data) => api.post('/apply', data),

  // Client fetches all applications for a project
  getApplications: (projectId) =>
    api.get('/applications', { params: { project_id: projectId } }),

  // Client hires a freelancer
  hire: (data) => api.post('/hire', data),

  // Freelancer views their assigned / applied projects
  getFreelancerProjects: (freelancerId) =>
    api.get('/freelancer/projects', { params: { freelancer_id: freelancerId } }),
};

// ─── Stats ─────────────────────────────────────────────────
export const statsAPI = {
  getDashboard: (userId, role = 'freelancer') =>
    api.get(`/stats/dashboard/${userId}`, { params: { role } }),
};

export const paymentsAPI = {
  getForUser: (userId) => api.get(`/payments/history/${userId}`),
  release: (escrowAccountId, amount) => api.post('/payments/release', { escrowAccountId, amount }),
};

// Keep bidsAPI as alias for backward compatibility
export const bidsAPI = {
  submit: (data) => applyAPI.apply(data),
};

export default api;
