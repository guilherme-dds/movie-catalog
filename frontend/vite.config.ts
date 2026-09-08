import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const tmdbKey = process.env.VITE_TMDB_API_KEY || env.VITE_TMDB_API_KEY || '5a7fd3e2048345fa9ac13587d84cdb2a';

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_TMDB_API_KEY': JSON.stringify(tmdbKey),
    },
    server: {
      host: '0.0.0.0',
      allowedHosts: true,
      proxy: {
        '/api/auth': {
          target: process.env.VITE_AUTH_TARGET || 'http://auth-service:3334',
          changeOrigin: true,
        },
        '/api/create': {
          target: process.env.VITE_AUTH_TARGET || 'http://auth-service:3334',
          changeOrigin: true,
        },
        '/api': {
          target: process.env.VITE_BACKEND_TARGET || 'http://backend:3333',
          changeOrigin: true,
        },
      },
    },
  };
})