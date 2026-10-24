import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL;

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            lucide: ['lucide-react']
          }
        }
      }
    },
    server: {
      port: 5174,
      proxy: apiUrl ? {
        '/api': {
          target: apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, ''),
          changeOrigin: true
        }
      } : {}
    }
  };
});
