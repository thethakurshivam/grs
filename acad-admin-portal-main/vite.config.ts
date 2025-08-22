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
      '/api/poc': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
      },
      '/api/bprnd/student': {
        target: 'http://localhost:3004',
        changeOrigin: true,
        secure: false,
      },
      '/api/bprnd': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      }
    }
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
