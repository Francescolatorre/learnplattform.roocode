import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('http://localhost:5173/login');
  });

  test('admin user can login and logout', async ({ page }) => {
    // Fill in admin credentials
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'test');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Verify successful login
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verify admin user info is displayed
    const userInfo = await page.textContent('.MuiDrawer-paper');
    expect(userInfo).toContain('admin');
    
    // Click logout button
    await page.click('button:has-text("Logout")');
    
    // Verify redirect to login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('test user can login and logout', async ({ page }) => {
    // Fill in test user credentials
    await page.fill('input[type="text"]', 'testuser');
    await page.fill('input[type="password"]', 'testpassword123');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Verify successful login
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verify test user info is displayed
    const userInfo = await page.textContent('.MuiDrawer-paper');
    expect(userInfo).toContain('testuser');
    
    // Click logout button
    await page.click('button:has-text("Logout")');
    
    // Verify redirect to login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('displays error with invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.fill('input[type="text"]', 'invalid');
    await page.fill('input[type="password"]', 'invalid');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for and verify error message in helper text
    const helperText = page.locator('.MuiFormHelperText-root');
    await expect(helperText).toBeVisible({ timeout: 5000 });
    const errorMessage = await helperText.textContent();
    expect(errorMessage).toContain('Invalid credentials');
    
    // Verify still on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('shows loading state during login', async ({ page }) => {
    // Fill in admin credentials
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'test');
    
    // Click login button and immediately look for loading indicator
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForSelector('.MuiCircularProgress-root')
    ]);
    
    // Verify loading state was shown
    await expect(page.locator('.MuiCircularProgress-root')).toBeVisible();
    
    // Wait for navigation to complete
    await expect(page).toHaveURL(/.*dashboard/);
  });
});