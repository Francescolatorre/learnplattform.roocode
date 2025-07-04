// vitest.unit.config.ts
import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-utils/setupTests.ts',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['src/**/*.int.test.ts'],
    reporters: ['default', 'json'],
    outputFile: {
      json: 'test-results/unit/vitest-unit-report.json',
    },

  },
});
