import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': '/src',
      '@features': path.resolve(__dirname, './src/features'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': '/src/hooks',
      '@theme': path.resolve(__dirname, './src/theme'),
      '@utils': '/src/utils',
      '@pages': '/src/pages',
      '@services': '/src/services',
      '@types': '/src/types',
      '@config': path.resolve(__dirname, './src/config'), // Add this alias
    },
  },
  define: {
    'process.env.REACT_ROUTER_FUTURE': JSON.stringify({
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/swagger': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

// Move test config outside defineConfig
export const testConfig = {
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
};
