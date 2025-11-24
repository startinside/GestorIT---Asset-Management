
import axios from 'axios';

// Acesso seguro à variável de ambiente ou fallback para localhost
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Adiciona o Token JWT se existir
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gestorit_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Trata erros globais e evita truncamento
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      console.warn('Unauthorized access - redirecting to login...');
      localStorage.removeItem('gestorit_token');
      // Opcional: window.location.href = '/login';
    } else if (status === 403) {
      console.warn('Forbidden access - insufficient permissions.');
    } else if (status && status >= 500) {
      console.error('Server error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
