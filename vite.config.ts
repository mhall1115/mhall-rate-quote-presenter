import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  // This is important for GitHub Pages deployment.
  // It must match the repository name.
  base: '/mhall-rate-quote-presenter/', 
  server: {
    https: {
      // FIX: Removed `__dirname` as it's not available in ES modules. `path.resolve` will resolve from the project root.
      key: fs.readFileSync(path.resolve('localhost-key.pem')),
      cert: fs.readFileSync(path.resolve('localhost.pem'))
    },
    port: 4173,
  }
});