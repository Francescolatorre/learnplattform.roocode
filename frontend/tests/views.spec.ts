import { test, expect } from '@playwright/test';

// Mock login credentials
const TEST_EMAIL = 'lead_instructor';
const TEST_PASSWORD = 'testpass123';

test.describe('Frontend Views', () => {
  // Login helper function
  const login = async (page) => {
    console.log('Starting login process'); // Debug logging
    await page.goto('/login');
    console.log('Navigated to login page');
    
    await page.fill('input[name="username_or_email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    
    console.log('Filled login credentials');
    
    await page.click('button[type="submit"]');
    
    console.log('Clicked submit button');
    
    // Wait for navigation or dashboard to load with extended timeout
    try {
      await page.waitForURL('/dashboard', { timeout: 10000 });
      console.log('Successfully navigated to dashboard');
    } catch (error) {
      console.error('Navigation to dashboard failed:', error);
      // Take screenshot for debugging
      await page.screenshot({ path: 'login-error.png' });
      
      // Additional debugging: check current URL
      const currentUrl = page.url();
      console.log('Current URL:', currentUrl);
      
      // Check for any error messages
      const errorMessage = await page.textContent('.MuiAlert-message');
      console.log('Error message:', errorMessage);
    }
  };

  test.beforeEach(async ({ page }) => {
    try {
      await login(page);
    } catch (error) {
      console.error('Login setup failed:', error);
    }
  });

  test('Dashboard view renders correctly', async ({ page }) => {
    console.log('Starting dashboard view test');
    await page.goto('/dashboard');
    
    // Wait for the h4 element with extended timeout and more robust selection
    const dashboardTitle = await page.locator('h4:has-text("Dashboard")').textContent({ timeout: 10000 });
    console.log('Dashboard title:', dashboardTitle);
    expect(dashboardTitle).toContain('Dashboard');
  });

  test('Profile view renders correctly', async ({ page }) => {
    console.log('Starting profile view test');
    await page.goto('/profile');
    
    const profileTitle = await page.locator('h4:has-text("User Profile")').textContent({ timeout: 10000 });
    console.log('Profile title:', profileTitle);
    expect(profileTitle).toContain('User Profile');
  });

  test('Courses view renders correctly', async ({ page }) => {
    console.log('Starting courses view test');
    await page.goto('/courses');
    
    const coursesTitle = await page.locator('h4:has-text("My Courses")').textContent({ timeout: 10000 });
    console.log('Courses title:', coursesTitle);
    expect(coursesTitle).toContain('My Courses');
  });

  test('Unauthorized access redirects to login', async ({ page }) => {
    console.log('Starting unauthorized access test');
    // Clear local storage to simulate logout
    await page.evaluate(() => localStorage.clear());
    
    // Try to access protected routes
    const protectedRoutes = ['/dashboard', '/profile', '/courses'];
    
    for (const route of protectedRoutes) {
      console.log(`Checking route: ${route}`);
      await page.goto(route);
      await page.waitForURL('/login', { timeout: 5000 });
      console.log('Redirected to login page');
      expect(page.url()).toContain('/login');
    }
  });
});