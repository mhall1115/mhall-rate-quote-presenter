import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  // 👇 Required for GitHub Pages – must match your repo name
  base: '/mhall-rate-quote-presenter/',
  server: {
    port: 4173,
  },
});
