import type {Config} from '@playwright/test';
import {defineConfig, devices} from '@playwright/test';

// Declare process to avoid TypeScript errors
declare const process: {
  env: {
    CI?: string;
    BASE_URL?: string;
  };
};

const config: Config = defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  forbidOnly: process.env.CI === 'true',
  retries: process.env.CI === 'true' ? 2 : 0,
  workers: process.env.CI === 'true' ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: process.env.BASE_URL || 'http://localhost:5173',
    reuseExistingServer: process.env.CI !== 'true',
    timeout: 120 * 1000,
  },
});

export default config;
