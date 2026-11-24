import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL;
  // `vite preview` serves the production build on localhost, where the app calls /api; send that to the live backend.
  const previewApiTarget = (apiUrl || 'https://dd-mystery-production.up.railway.app').replace(/\/api\/?$/, '').replace(/\/$/, '');

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
    },
    preview: {
      proxy: {
        '/api': {
          target: previewApiTarget,
          changeOrigin: true
        }
      }
    }
  };
});
