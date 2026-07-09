import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy API calls to the FastAPI backend during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Bind on 0.0.0.0 so phones on the LAN (and tunnels) can reach the dev
    // server. Allow the common tunnel domains through Vite's host check.
    host: true,
    allowedHosts: ['.ngrok-free.app', '.ngrok.io', '.trycloudflare.com'],
    proxy: {
      '/api': {
        // Vite proxies /api to the backend on the Mac, so only this dev server
        // needs to be tunnelled — the backend stays on localhost.
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
