// vitest.integration.config.ts
import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        environment: 'node',
        setupFiles: './src/test-utils/setupIntegrationTests.ts',
        include: ['src/**/*.int.test.ts'],
    },
});
