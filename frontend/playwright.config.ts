import type { Config } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
// import { PerformanceOptimizer } from './e2e/utils/performanceOptimization';

// Get the directory name equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Declare process to avoid TypeScript errors
declare const process: {
  env: {
    CI?: string;
    BASE_URL?: string;
  };
};

// Define output directory for test artifacts
const outputDir = path.join(__dirname, 'test-results');

// Ensure directories exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const config: Config = defineConfig({
  testDir: './e2e/tests',
  testMatch: ['**/*.spec.ts'],
  timeout: 30 * 1000, // MVP: Reduced timeout for faster feedback
  globalTimeout: 15 * 60 * 1000, // MVP: 15 minute max for entire suite
  globalSetup: './e2e/utils/globalSetup.ts',

  expect: {
    timeout: 5000, // MVP: Reduced for faster feedback
    // toMatchTimeout: 3000, // MVP: Reduced for faster feedback - removed as not valid
  },
  fullyParallel: true, // MVP: Enable parallel execution
  forbidOnly: process.env.CI === 'true',
  retries: process.env.CI === 'true' ? 1 : 0, // MVP: Reduced retries
  workers: process.env.CI === 'true' ? 2 : undefined, // MVP: Allow 2 workers in CI
  reporter: [
    ['html', { outputFolder: path.join(outputDir, 'playwright-report'), open: 'never' }],
    ['junit', { outputFile: path.join(outputDir, 'junit-report.xml') }],
  ],

  // Configure outputDir for all test artifacts including screenshots
  outputDir: path.join(outputDir, 'test-artifacts'),
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000', // MVP: Match CI setup
    trace: 'retain-on-failure', // Only keep traces on failure for performance
    video: 'retain-on-failure', // Only keep video on failure for performance
    screenshot: 'only-on-failure', // Only screenshot on failure for performance
    actionTimeout: 10000, // MVP: Reduced timeout for faster feedback
    navigationTimeout: 15000, // MVP: Reduced timeout for faster feedback
    testIdAttribute: 'data-testid', // Explicitly set testId attribute
    // Performance optimization: Set optimal viewport
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // MVP: Firefox and WebKit disabled for faster pipeline
    // TODO: Re-enable post-MVP
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  webServer:
    process.env.CI === 'true'
      ? undefined
      : {
          // MVP: In CI, servers are started manually; locally use dev server
          command: 'npm run dev',
          url: process.env.BASE_URL || 'http://localhost:5173',
          reuseExistingServer: true,
          timeout: 60 * 1000, // MVP: Reduced timeout
        },
});

export default config;
