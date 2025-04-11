import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true, // Enable global test APIs like `describe`, `it`, etc.
    environment: 'jsdom', // Use jsdom for testing React components
    setupFiles: './src/test-utils/setupTests.ts', // Load global setup file
    coverage: {
      provider: 'istanbul', // Use Istanbul for code coverage
      reporter: ['text', 'html'], // Generate text and HTML coverage reports
    },
  },
});
