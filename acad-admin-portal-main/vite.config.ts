import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Admin authentication and routes to port 3002
      '/api/login': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/api/admin': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/api/pending-credits': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      // POC authentication and routes to API3 (port 3003)
      '/api/poc': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
      },
      // BPRND-specific routes to API3 (port 3003)
      '/api/bprnd/students': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
      },
      '/api/bprnd/disciplines/count': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
      },
      '/api/bprnd/pending-credits/student': {
        target: 'http://localhost:3004',
        changeOrigin: true,
        secure: false,
      },
      '/api/bprnd/pending-credits': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
      },
      '/api/bprnd/claims': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
      },
      // BPRND student authentication and routes to API4 (port 3004)
      '/api/bprnd/student': {
        target: 'http://localhost:3004',
        changeOrigin: true,
        secure: false,
      },
      '/api/bprnd/students/upload': {
        target: 'http://localhost:3004',
        changeOrigin: true,
        secure: false,
      },
      // Student routes to API4 (with rewrite)
      '/api/student': {
        target: 'http://localhost:3004',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/student/, '/student'),
      },
      // API4 routes
      '/api/umbrellas': {
        target: 'http://localhost:3004',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
