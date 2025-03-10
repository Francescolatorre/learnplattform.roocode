import { defineConfig, devices } from '@playwright/test';
import type { Config } from '@playwright/test';

// API-only config that doesn't start a web server
const config: Config = defineConfig({
  testDir: './tests',
  testMatch: '**/api-only.spec.ts',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: false,
  forbidOnly: process.env.CI === 'true',
  retries: process.env.CI === 'true' ? 2 : 0,
  workers: process.env.CI === 'true' ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'] 
      },
    }
  ],
});

export default config;