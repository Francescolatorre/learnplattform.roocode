import type { Config } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

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
  timeout: 120 * 1000, // Increased timeout to 120s for slower operations

  expect: {
    timeout: 30000, // Increased to 30s for element expectations
    toMatchTimeout: 5000, // Increased to 10s for text match
  },
  fullyParallel: false,
  forbidOnly: process.env.CI === 'true',
  retries: process.env.CI === 'true' ? 2 : 0, // Added 1 retry for local development
  workers: process.env.CI === 'true' ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: path.join(outputDir, 'playwright-report'), open: 'never' }],
    ['junit', { outputFile: path.join(outputDir, 'junit-report.xml') }],
  ],

  // Configure outputDir for all test artifacts including screenshots
  outputDir: path.join(outputDir, 'test-artifacts'),
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'retain-on-failure', // Changed to retain traces on failure
    video: 'retain-on-failure', // Changed to retain videos on failure
    screenshot: 'only-on-failure',
    actionTimeout: 15000, // Added timeout for actions like click
    navigationTimeout: 30000, // Added timeout for navigation
    testIdAttribute: 'data-testid', // Explicitly set testId attribute
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
