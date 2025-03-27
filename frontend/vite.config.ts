import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': '/src',
      '@features': '/src/features',
      '@components': '/src/components',
      '@hooks': '/src/hooks',
      '@theme': '/src/theme',
      '@utils': '/src/utils',
      '@pages': '/src/pages',
      '@services': '/src/services',
      '@types': '/src/types',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
