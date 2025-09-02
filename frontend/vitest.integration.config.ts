// vitest.integration.config.ts
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom', // Changed from 'node' to 'jsdom' to provide browser APIs
    setupFiles: './src/test-utils/setupIntegrationTests.ts',
    include: ['src/**/*.int.test.ts'],
    reporters: ['default'],
  },
});
