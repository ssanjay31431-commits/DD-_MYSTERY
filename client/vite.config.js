import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
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
      port: 5173,
      proxy: apiUrl ? {
        '/api': {
          target: apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, ''),
          changeOrigin: true
        }
      } : {}
    }
  };
});
