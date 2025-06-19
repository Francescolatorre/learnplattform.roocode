// @ts-check
import { defineConfig } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const config = {
  // Your Playwright configuration options go here
  // For example:
  // use: {
  //     browserName: 'chromium',
  //     headless: false,
  // },
  // testDir: './tests',
  // timeout: 30000,
};

module.exports = defineConfig(config);
