import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],

  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,

    rollupOptions: {
      output: {
        manualChunks(id) {

          if (
            id.includes('three') ||
            id.includes('@react-three')
          ) {
            return 'three-vendor';
          }

          if (
            id.includes('react') ||
            id.includes('react-dom')
          ) {
            return 'react-vendor';
          }

          if (
            id.includes('lucide-react')
          ) {
            return 'icons';
          }

        },
      },
    },
  },
});