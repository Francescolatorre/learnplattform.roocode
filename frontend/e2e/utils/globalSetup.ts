import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  // Start browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the server to be ready
    await page.goto(baseURL || 'http://localhost:5173', { waitUntil: 'networkidle' });
    console.log(`✅ Server is ready at ${baseURL}`);
  } catch (error) {
    console.error('❌ Server setup failed:', error);
    throw error;
  } finally {
    await page.close();
    await browser.close();
  }
}

export default globalSetup;