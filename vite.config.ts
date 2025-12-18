import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, '.', '');

	return {
		plugins: [react()],

		server: {
			port: 3000,
			host: true,
			strictPort: true,
			allowedHosts: ['2ea5b19a8d07.ngrok-free.app'],
			proxy: {
				'/api': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
				'/static': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
			},
		},

		define: {
			'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
			'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
		},

		resolve: {
			alias: {
				'@': path.resolve(__dirname, '.'),
			},
		},
	};
});
