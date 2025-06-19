// vitest.config.ts
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-utils/setupTests.ts',
    include: ['src/**/*.test.ts', 'src/**/*.int.test.ts'],
    exclude: [
      'e2e/**',
      '**/e2e/**',
      '**/*.e2e.{ts,tsx,js,jsx}',
      'playwright.config.ts',
      'playwright-api.config.ts',
      'node_modules/**',
    ],
  },
});
