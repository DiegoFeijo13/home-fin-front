import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      strict: false
    }
  },
  build: {
    target: ['es2015', 'firefox60', 'chrome61', 'safari11'],
    cssTarget: ['firefox60', 'chrome61', 'safari11'],
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    include: ['lucide-react'],
    force: true
  }
});
