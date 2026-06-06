import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lf_token');
      localStorage.removeItem('lf_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);


export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');


export const getSheets = () => api.get('/sheets');
export const createSheet = (data) => api.post('/sheets', data);
export const deleteSheet = (id) => api.delete(`/sheets/${id}`);


export const getLeads = (sheetId, params) => api.get(`/sheets/${sheetId}/leads`, { params });
export const createLead = (sheetId, data) => api.post(`/sheets/${sheetId}/leads`, data);
export const updateLead = (id, data) => api.put(`/leads/${id}`, data);
export const deleteLead = (id) => api.delete(`/leads/${id}`);
export const getKanbanLeads = (sheetId) => api.get(`/sheets/${sheetId}/kanban`);


export const getStats = (sheetId) => api.get(`/sheets/${sheetId}/stats`);


export const importLeads = (sheetId, rows) => api.post(`/sheets/${sheetId}/import`, { rows });
export const getExportUrl = (sheetId) => `${api.defaults.baseURL}/sheets/${sheetId}/export`;

export default api;
