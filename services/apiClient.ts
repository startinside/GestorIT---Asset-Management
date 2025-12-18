import axios from 'axios';

const apiClient = axios.create({
	baseURL: '/api', // proxy do Vite resolve backend
	headers: {
		'Content-Type': 'application/json',
	},
});

// ==============================
// Request Interceptor
// ==============================
apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('gestorit_token');
		if (token) {
			config.headers = config.headers || {};
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// ==============================
// Response Interceptor
// ==============================
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		const status = error?.response?.status;

		if (status === 401) {
			localStorage.removeItem('gestorit_token');
			console.warn('Unauthorized – token removido');
		}

		return Promise.reject(error);
	}
);

export default apiClient;
