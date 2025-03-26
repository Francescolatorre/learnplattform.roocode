import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('Application loads successfully', async ({ page }) => {
    await page.goto('/');
    const url = page.url();
    expect(url).toMatch(/\/login|\/dashboard/);
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('Login form is accessible', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('form');
    const inputCount = await page.locator('input').count();
    expect(inputCount).toBeGreaterThan(0);
    const buttonCount = await page.locator('button').count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('Basic login attempt', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username_or_email"]', 'admin');
    await page.fill('input[name="password"]', 'adminpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dashboard');
  });
});
