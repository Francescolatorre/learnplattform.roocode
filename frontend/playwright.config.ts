import type {Config} from '@playwright/test';
import {defineConfig, devices} from '@playwright/test';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';

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
  fs.mkdirSync(outputDir, {recursive: true});
}

const config: Config = defineConfig({
  testDir: './e2e/tests',
  testMatch: ['**/*.spec.ts'],
  timeout: 60 * 1000, // Increased timeout from 30s to 60s
  expect: {
    timeout: 10000, // Increased from 5000ms to 10000ms
  },
  fullyParallel: false,
  forbidOnly: process.env.CI === 'true',
  retries: process.env.CI === 'true' ? 2 : 0,
  workers: process.env.CI === 'true' ? 1 : undefined,
  reporter: [
    ['html', {outputFolder: path.join(outputDir, 'playwright-report')}],
    ['junit', {outputFile: path.join(outputDir, 'junit-report.xml')}],
    //    ['./e2e/reporters/llm-reporter.ts'],
    //    ['./e2e/reporters/markdown-reporter.ts']
  ],

  // Configure outputDir for all test artifacts including screenshots
  outputDir: path.join(outputDir, 'test-artifacts'),
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
