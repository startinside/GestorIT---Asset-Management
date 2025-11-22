import axios from 'axios';

// Default to localhost if env var is not set
// Using optional chaining for import.meta.env to prevent runtime errors if it is undefined
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    
    if (status === 401) {
      console.warn('Unauthorized access - redirecting to login...');
      // Future: Trigger logout action or redirect
    } else if (status === 403) {
      console.warn('Forbidden access - insufficient permissions.');
    } else if (status >= 500) {
      console.error('Server error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;