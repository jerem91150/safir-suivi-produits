import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (login: string, password: string) =>
    api.post('/auth/login', { login, password }),
  me: () => api.get('/auth/me'),
  register: (data: { login: string; password: string; nom: string; email?: string; role?: string }) =>
    api.post('/auth/register', data),
  getUsers: () => api.get('/auth/users'),
  updateUser: (id: number, data: any) => api.patch(`/auth/users/${id}`, data),
};

// Fiches API
export const fichesApi = {
  list: (params?: {
    gamme?: string;
    modele?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/fiches', { params }),
  getFilters: () => api.get('/fiches/filters'),
  get: (id: number) => api.get(`/fiches/${id}`),
  create: (data: {
    reference: string;
    gamme: string;
    modele: string;
    titre: string;
    description?: string;
    matricules?: string;
  }) => api.post('/fiches', data),
  update: (id: number, data: any) => api.put(`/fiches/${id}`, data),
  delete: (id: number) => api.delete(`/fiches/${id}`),
};

// Uploads API
export const uploadsApi = {
  upload: (ficheId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post(`/uploads/${ficheId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: number) => api.delete(`/uploads/${id}`),
  getDownloadUrl: (id: number) => `${API_URL}/uploads/${id}/download`,
};

// Users API (admin)
export const usersApi = {
  list: () => api.get('/users'),
  get: (id: number) => api.get(`/users/${id}`),
  create: (data: {
    login: string;
    password: string;
    nom: string;
    email?: string;
    role?: string;
  }) => api.post('/users', data),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

export default api;
