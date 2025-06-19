import { test, expect } from '@playwright/test';

import { login, TEST_USERS, waitForGlobalLoadingToDisappear } from '../setupTests'; // Import the login helper function and TEST_USERS

test.describe('Frontend Views', () => {
  test('Dashboard view renders correctly', async ({ page }) => {
    // Log in first
    const instructor = TEST_USERS.lead_instructor;
    await login(page, instructor.username, instructor.password);

    await page.goto('/instructor/dashboard');
    await waitForGlobalLoadingToDisappear(page);

    // Verbesserte Selektoren mit verschiedenen Varianten für höhere Stabilität
    const dashboardTitle = await page
      .locator(
        'h1:has-text("Dashboard"), h2:has-text("Dashboard"), h3:has-text("Dashboard"), h4:has-text("Dashboard"), h4:has-text("Instructor Dashboard"), [data-testid="dashboard-title"]'
      )
      .first();
    await expect(dashboardTitle).toBeVisible({ timeout: 5000 });

    const titleText = await dashboardTitle.textContent();
    expect(titleText).toBeTruthy();
    expect(titleText?.toLowerCase()).toContain('dashboard');
  });

  test('Profile view renders correctly', async ({ page }) => {
    // Log in first
    const instructor = TEST_USERS.lead_instructor;
    await login(page, instructor.username, instructor.password);

    await page.goto('/profile');
    await waitForGlobalLoadingToDisappear(page);

    // Verbesserte Selektoren für den Profil-Titel
    const profileTitle = await page
      .locator(
        'h1:has-text("Profile"), h2:has-text("Profile"), h3:has-text("Profile"), h4:has-text("User Profile"), h4:has-text("Profile"), [data-testid="profile-title"]'
      )
      .first();
    await expect(profileTitle).toBeVisible({ timeout: 5000 });

    const titleText = await profileTitle.textContent();
    expect(titleText).toBeTruthy();
    expect(titleText?.toLowerCase()).toContain('profile');
  });

  test('Courses view renders correctly', async ({ page }) => {
    // Log in first
    const instructor = TEST_USERS.lead_instructor;
    await login(page, instructor.username, instructor.password);

    await page.goto('/courses');
    await waitForGlobalLoadingToDisappear(page);

    // Überprüfen Sie auf verschiedene Überschriftenvarianten
    // Entweder spezifische Überschriften für Kurse oder allgemeine Kursseiten-Elemente
    const courseElements = [
      'h1:has-text("Course"), h2:has-text("Course"), h3:has-text("Course"), h4:has-text("Course")',
      'h1:has-text("Available Courses"), h4:has-text("Available Courses")',
      'h1:has-text("My Enrolled Courses"), h4:has-text("My Enrolled Courses")',
      '[data-testid="courses-title"]',
      '.MuiCard-root', // Fallback: Auf Kurs-Karten prüfen, wenn keine spezifische Überschrift vorhanden ist
    ];

    let elementFound = false;
    for (const selector of courseElements) {
      const element = page.locator(selector).first();
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        console.log(`Courses page element found with selector: ${selector}`);
        elementFound = true;
        break;
      }
    }

    expect(elementFound).toBe(true);
  });

  test('Unauthorized access redirects to login', async ({ page }) => {
    // Clear cookies to ensure we're logged out
    await page.context().clearCookies();

    const protectedRoutes = ['/dashboard', '/profile', '/courses'];
    for (const route of protectedRoutes) {
      await page.goto(route);
      await waitForGlobalLoadingToDisappear(page);
      await page.waitForURL('/login', { timeout: 5000 });
      expect(page.url()).toContain('/login');
    }
  });
});
