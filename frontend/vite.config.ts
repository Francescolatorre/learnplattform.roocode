import {resolve} from 'path';

import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const customPaths = {
  '@assets': resolve(__dirname, './src/assets'),
  '@components': resolve(__dirname, './src/components'),
  '@config': resolve(__dirname, './src/config'),
  '@constants': resolve(__dirname, './src/constants'),
  '@context': resolve(__dirname, './src/context'),
  '@hooks': resolve(__dirname, './src/hooks'),
  '@pages': resolve(__dirname, './src/pages'),
  '@routes': resolve(__dirname, './src/routes'),
  '@services': resolve(__dirname, './src/services'),
  '@store': resolve(__dirname, './src/store'),
  '@styles': resolve(__dirname, './src/styles'),
  '@utils': resolve(__dirname, './src/utils'),
  '@test-utils': resolve(__dirname, './src/test-utils'),
};

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: customPaths,
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: process.env.NODE_ENV === 'production',
      },
      '/swagger': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setupTests.ts',
  },
});
