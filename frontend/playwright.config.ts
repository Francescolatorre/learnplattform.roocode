import type { Config } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PerformanceOptimizer } from './e2e/utils/performanceOptimization';

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
  timeout: 60 * 1000, // Increased timeout for stability
  globalSetup: './e2e/utils/globalSetup.ts',

  expect: {
    timeout: 10000, // Increased for stability
    toMatchTimeout: 5000, // Increased for stability
  },
  fullyParallel: false,
  forbidOnly: process.env.CI === 'true',
  retries: process.env.CI === 'true' ? 2 : 1, // Added 1 retry for local development
  workers: process.env.CI === 'true' ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: path.join(outputDir, 'playwright-report'), open: 'never' }],
    ['junit', { outputFile: path.join(outputDir, 'junit-report.xml') }],
  ],

  // Configure outputDir for all test artifacts including screenshots
  outputDir: path.join(outputDir, 'test-artifacts'),
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'retain-on-failure', // Only keep traces on failure for performance
    video: 'retain-on-failure', // Only keep video on failure for performance
    screenshot: 'only-on-failure', // Only screenshot on failure for performance
    actionTimeout: 15000, // Increased timeout for stability
    navigationTimeout: 30000, // Increased timeout for navigation stability
    testIdAttribute: 'data-testid', // Explicitly set testId attribute
    // Performance optimization: Set optimal viewport
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
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
