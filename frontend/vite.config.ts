import {resolve} from 'path';

import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';


const customPaths = {
  '@components': resolve(__dirname, './src/components'),
  '@utils': resolve(__dirname, './src/utils'),
  '@routes': resolve(__dirname, './src/routes'),
  '@assets': resolve(__dirname, './src/assets'),
  '@hooks': resolve(__dirname, './src/hooks'),
  '@styles': resolve(__dirname, './src/styles'),
  '@context': resolve(__dirname, './src/context'),
  '@constants': resolve(__dirname, './src/constants'),
  '@services': resolve(__dirname, './src/services'), // Ensure this path is correct
  '@types': resolve(__dirname, './src/types'),
  '@store': resolve(__dirname, './src/store'),
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
