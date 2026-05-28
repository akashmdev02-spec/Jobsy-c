const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${path}`, config);
    
    // Handle delete/void responses
    if (response.status === 204 || response.status === 200 && response.headers.get('Content-Length') === '0') {
      return null;
    }

    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = text;
      }
    }

    if (!response.ok) {
      const errorMsg = data && (data.message || data.error) || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${path}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  // User Profile
  getMe: () => request('/users/me'),
  updateMe: (data) => request('/users/me', { method: 'PUT', body: JSON.stringify(data) }),

  // Companies
  getCompanies: () => request('/companies'),
  getCompany: (id) => request(`/companies/${id}`),
  createCompany: (data) => request('/companies', { method: 'POST', body: JSON.stringify(data) }),
  getMyCompanies: () => request('/companies/mine'),

  // Jobs
  getJobs: (params = {}) => {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.location) query.append('location', params.location);
    if (params.type) query.append('type', params.type);
    if (params.page !== undefined) query.append('page', params.page);
    if (params.size !== undefined) query.append('size', params.size);
    return request(`/jobs?${query.toString()}`);
  },
  getJob: (id) => request(`/jobs/${id}`),
  createJob: (data) => request('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  updateJob: (id, data) => request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),
  getRecruiterJobs: () => request('/recruiter/jobs'),

  // Applications
  applyJob: (jobId, data = {}) => request(`/applications/jobs/${jobId}`, { method: 'POST', body: JSON.stringify(data) }),
  getMyApplications: () => request('/applications/me'),
  getApplicationsForJob: (jobId) => request(`/applications/jobs/${jobId}`),
  updateApplicationStatus: (id, status) => request(`/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  // Saved Jobs
  saveJob: (jobId) => request(`/saved-jobs/${jobId}`, { method: 'POST' }),
  unsaveJob: (jobId) => request(`/saved-jobs/${jobId}`, { method: 'DELETE' }),
  getSavedJobs: () => request('/saved-jobs'),

  // Admin APIs
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: () => request('/admin/users'),
  updateAdminUser: (id, data) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  getAdminCompanies: () => request('/admin/companies'),
  updateAdminCompany: (id, data) => request(`/admin/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminCompany: (id) => request(`/admin/companies/${id}`, { method: 'DELETE' }),
  getAdminJobs: () => request('/admin/jobs'),
  updateAdminJob: (id, data) => request(`/admin/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminJob: (id) => request(`/admin/jobs/${id}`, { method: 'DELETE' }),
  getAdminApplications: () => request('/admin/applications'),
  deleteAdminApplication: (id) => request(`/admin/applications/${id}`, { method: 'DELETE' }),
};
