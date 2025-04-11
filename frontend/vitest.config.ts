import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true, // Enable global test APIs like `describe`, `it`, etc.
    environment: 'jsdom', // Use jsdom for testing React components
    setupFiles: './src/test-utils/setupTests.ts', // Load global setup file
    exclude: [
      'e2e/**',
      '**/e2e/**',
      '**/*.e2e.{ts,tsx,js,jsx}',
      'playwright.config.ts',
      'playwright-api.config.ts',
      'node_modules/**'
    ],
    coverage: {
      provider: 'istanbul', // Use Istanbul for code coverage
      reporter: ['text', 'html'], // Generate text and HTML coverage reports
    },
  },
});
