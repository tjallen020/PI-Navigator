import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:4000',
      '/tools': 'http://localhost:4000',
      '/packages': 'http://localhost:4000',
      '/nodes': 'http://localhost:4000',
      '/sessions': 'http://localhost:4000',
      '/feedback': 'http://localhost:4000',
      '/dashboard': 'http://localhost:4000',
      '/export': 'http://localhost:4000'
    }
  }
});
