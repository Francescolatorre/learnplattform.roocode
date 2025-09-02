import { Page } from '@playwright/test';

/**
 * Wait for network to be idle and add a small buffer
 */
export async function waitForNetworkIdle(page: Page, timeout: number = 5000): Promise<void> {
  try {
    await page.waitForLoadState('networkidle', { timeout });
    // Add a small buffer to ensure everything is truly settled
    await page.waitForTimeout(500);
  } catch (error) {
    console.log('Network did not reach idle state within timeout, continuing...');
  }
}

/**
 * Retry an operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.log(`Operation failed (attempt ${i + 1}/${maxRetries}): ${lastError.message}`);

      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i); // Exponential backoff
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Wait for any of the given selectors to be visible
 */
export async function waitForAnySelector(
  page: Page,
  selectors: string[],
  timeout: number = 10000
): Promise<string | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    for (const selector of selectors) {
      try {
        const element = page.locator(selector);
        const isVisible = await element.isVisible({ timeout: 500 }).catch(() => false);

        if (isVisible) {
          console.log(`Found visible element: ${selector}`);
          return selector;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    // Small delay before next attempt
    await page.waitForTimeout(100);
  }

  return null;
}

/**
 * Enhanced dashboard loading check with multiple fallback strategies
 */
export async function waitForDashboardLoad(page: Page, timeout: number = 15000): Promise<boolean> {
  console.log('Waiting for dashboard to load...');

  // Primary dashboard indicators
  const primarySelectors = [
    '[data-testid="dashboard-title"]',
    '[data-testid="learning-overview"]',
    '[data-testid="dashboard-summary"]',
    'h1:has-text("Dashboard")',
    'h2:has-text("Dashboard")',
  ];

  // Secondary fallback selectors
  const fallbackSelectors = [
    '.dashboard-container',
    '.dashboard-content',
    '[data-testid*="dashboard"]',
    '.MuiContainer-root:has(.MuiTypography-h4)',
    '.MuiPaper-root:has([data-testid*="enrolled"])',
  ];

  // Check for loading states first
  const loadingSelectors = [
    '[data-testid="dashboard-loading-spinner"]',
    '.loading-spinner',
    '.MuiCircularProgress-root',
  ];

  // Wait for loading indicators to disappear
  for (const selector of loadingSelectors) {
    try {
      await page
        .locator(selector)
        .waitFor({ state: 'detached', timeout: 5000 })
        .catch(() => {});
    } catch {
      // Ignore if not found
    }
  }

  // Try primary selectors first
  const foundPrimary = await waitForAnySelector(page, primarySelectors, timeout / 2);
  if (foundPrimary) {
    console.log('Dashboard loaded (primary indicator found)');
    return true;
  }

  // Try fallback selectors
  const foundFallback = await waitForAnySelector(page, fallbackSelectors, timeout / 2);
  if (foundFallback) {
    console.log('Dashboard loaded (fallback indicator found)');
    return true;
  }

  console.error('Dashboard did not load within timeout');
  return false;
}

/**
 * Wait for course cards to be visible with multiple selector strategies
 */
export async function waitForCourseCards(page: Page, timeout: number = 10000): Promise<boolean> {
  const courseSelectors = [
    '[data-testid^="course-card-"]',
    '[data-testid="course-list-item"]',
    '.course-card',
    '.MuiCard-root:has(.MuiCardContent-root)',
    '.MuiListItem-root:has(.MuiListItemText-root)',
  ];

  const foundSelector = await waitForAnySelector(page, courseSelectors, timeout);
  return foundSelector !== null;
}

/**
 * Extract course titles with multiple strategies
 */
export async function extractCourseTitles(page: Page): Promise<string[]> {
  const titles: string[] = [];

  // Strategy 1: Try list items (student view)
  const listItems = page.locator('.MuiListItem-root');
  const listCount = await listItems.count();

  if (listCount > 0) {
    for (let i = 0; i < listCount; i++) {
      const item = listItems.nth(i);
      const titleElement = item.locator('.MuiListItemText-primary').first();
      const titleText = await titleElement.textContent().catch(() => null);
      if (titleText?.trim()) {
        titles.push(titleText.trim());
      }
    }
  }

  // Strategy 2: Try cards (instructor view)
  if (titles.length === 0) {
    const cards = page.locator('.MuiCard-root');
    const cardCount = await cards.count();

    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      const titleSelectors = [
        'h2',
        'h3',
        'h4',
        'h5',
        '.MuiTypography-h5',
        '.MuiTypography-h6',
        '.course-title',
        '[data-testid="course-title"]',
      ];

      for (const selector of titleSelectors) {
        const titleElement = card.locator(selector).first();
        const titleText = await titleElement.textContent().catch(() => null);
        if (titleText?.trim()) {
          titles.push(titleText.trim());
          break; // Found title for this card, move to next card
        }
      }
    }
  }

  // Strategy 3: Generic title extraction
  if (titles.length === 0) {
    const genericTitleSelectors = [
      '[data-testid="course-title"]',
      '.course-title',
      'h3.MuiTypography-root',
      'h4.MuiTypography-root',
    ];

    for (const selector of genericTitleSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();

      for (let i = 0; i < count; i++) {
        const titleText = await elements
          .nth(i)
          .textContent()
          .catch(() => null);
        if (titleText?.trim() && !titles.includes(titleText.trim())) {
          titles.push(titleText.trim());
        }
      }
    }
  }

  return titles;
}

/**
 * Click element with retry and multiple selector strategies
 */
export async function clickWithRetry(
  page: Page,
  selectors: string[],
  elementName: string,
  maxRetries: number = 3
): Promise<void> {
  await retryOperation(async () => {
    for (const selector of selectors) {
      try {
        const element = page.locator(selector).first();
        const isVisible = await element.isVisible({ timeout: 1000 }).catch(() => false);

        if (isVisible) {
          await element.click();
          console.log(`Clicked ${elementName} using selector: ${selector}`);
          return;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    throw new Error(`Could not find clickable ${elementName}`);
  }, maxRetries);
}

/**
 * Fill input field with retry
 */
export async function fillWithRetry(
  page: Page,
  selectors: string[],
  value: string,
  fieldName: string,
  maxRetries: number = 3
): Promise<void> {
  await retryOperation(async () => {
    for (const selector of selectors) {
      try {
        const element = page.locator(selector);
        const isVisible = await element.isVisible({ timeout: 1000 }).catch(() => false);

        if (isVisible) {
          await element.clear();
          await element.fill(value);
          console.log(`Filled ${fieldName} using selector: ${selector}`);
          return;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    throw new Error(`Could not find ${fieldName} input field`);
  }, maxRetries);
}

/**
 * Clear browser memory by triggering garbage collection
 */
export async function clearMemory(page: Page): Promise<void> {
  try {
    await page.evaluate(() => {
      // Try to trigger garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
        console.log('Garbage collection triggered');
      }

      // Clear any cached data
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
    });

    console.log('Memory cleanup attempted');
  } catch (error) {
    console.warn('Could not clear memory:', error);
  }
}

/**
 * Limit DOM elements to prevent memory issues
 */
export async function limitDOMElements(
  page: Page,
  selector: string = '.course-card',
  maxElements: number = 10
): Promise<void> {
  try {
    const removed = await page.evaluate(
      ({ sel, max }) => {
        const elements = document.querySelectorAll(sel);
        let count = 0;

        Array.from(elements)
          .slice(max)
          .forEach(el => {
            el.remove();
            count++;
          });

        return count;
      },
      { sel: selector, max: maxElements }
    );

    if (removed > 0) {
      console.log(`Removed ${removed} DOM elements to prevent memory issues`);
    }
  } catch (error) {
    console.warn('Could not limit DOM elements:', error);
  }
}

/**
 * Wait for and dismiss any modals or overlays that might interfere
 */
export async function dismissModals(page: Page): Promise<void> {
  const modalSelectors = [
    '[role="dialog"] button[aria-label="close"]',
    '.MuiModal-root button.close',
    '[data-testid="modal-close"]',
    '.modal-close-button',
    'button:has-text("Close")',
    'button:has-text("Cancel")',
  ];

  for (const selector of modalSelectors) {
    try {
      const modal = page.locator(selector);
      const isVisible = await modal.isVisible({ timeout: 500 }).catch(() => false);

      if (isVisible) {
        await modal.click();
        console.log(`Dismissed modal using selector: ${selector}`);
        await page.waitForTimeout(500);
      }
    } catch {
      // Continue if modal not found
    }
  }
}

/**
 * Optimize page for testing by disabling animations and reducing resource usage
 */
export async function optimizePage(page: Page): Promise<void> {
  try {
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });

    // Disable smooth scrolling
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
    });

    console.log('Page optimized for testing');
  } catch (error) {
    console.warn('Could not optimize page:', error);
  }
}

/**
 * Safe navigation with memory cleanup
 */
export async function safeNavigate(page: Page, url: string): Promise<void> {
  // Clear memory before navigation
  await clearMemory(page);

  // Navigate
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Optimize the new page
  await optimizePage(page);

  // Wait for network to settle
  await waitForNetworkIdle(page, 5000);
}

/**
 * Wait for role-specific dashboard elements to load
 */
export async function waitForRoleDashboard(
  page: Page,
  role: 'instructor' | 'admin' | 'student',
  timeout: number = 20000
): Promise<boolean> {
  console.log(`Waiting for ${role} dashboard to load...`);

  const roleSpecificSelectors = {
    instructor: [
      'h4:has-text("Instructor Dashboard")',
      'text="Teaching Overview"',
      'text="Active Courses"',
      'text="Total Students"',
      'text="Create New Course"',
      'text="Welcome"',
      'text="Course Activity"',
      '[data-testid="instructor-dashboard"]',
    ],
    admin: [
      '[data-testid="admin-dashboard"]',
      '[data-testid="user-management-link"]',
      '[data-testid="admin-stats"]',
      'text="User Management"',
      'text="Admin Dashboard"',
      'h1:has-text("Admin Dashboard")',
      'h2:has-text("Admin Dashboard")',
      'a[href*="/admin/users"]',
    ],
    student: [
      '[data-testid="student-dashboard"]',
      '[data-testid="enrolled-courses"]',
      '[data-testid="progress-section"]',
      'text="My Courses"',
      'text="Enrolled Courses"',
      'h1:has-text("Dashboard")',
      'h2:has-text("Dashboard")',
      '.enrolled-courses',
    ],
  };

  // First check URL pattern
  const currentUrl = page.url();
  const expectedUrlPattern = role === 'student' ? '/dashboard' : `/${role}/dashboard`;

  if (!currentUrl.includes(expectedUrlPattern)) {
    console.log(`URL doesn't match expected pattern: ${currentUrl} vs ${expectedUrlPattern}`);
    return false;
  }

  // Wait for any loading indicators to disappear
  const loadingSelectors = [
    '[data-testid="loading-spinner"]',
    '.loading-spinner',
    '.MuiCircularProgress-root',
    '[role="progressbar"]',
  ];

  for (const selector of loadingSelectors) {
    const loader = page.locator(selector);
    const isVisible = await loader.isVisible({ timeout: 1000 }).catch(() => false);
    if (isVisible) {
      await loader.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {
        console.log(`Loading indicator ${selector} did not disappear`);
      });
    }
  }

  // Try role-specific selectors
  const selectors = roleSpecificSelectors[role];
  const foundSelector = await waitForAnySelector(page, selectors, timeout);

  if (foundSelector) {
    console.log(`${role} dashboard loaded with selector: ${foundSelector}`);

    // Wait for network to settle after finding element
    await waitForNetworkIdle(page, 3000);

    return true;
  }

  console.log(`${role} dashboard did not load within timeout`);
  return false;
}

/**
 * Enhanced dashboard loading check with API waiting
 */
export async function waitForDashboardWithAPI(
  page: Page,
  role: 'instructor' | 'admin' | 'student'
): Promise<boolean> {
  console.log(`Waiting for ${role} dashboard with API responses...`);

  try {
    // Wait for the dashboard-specific API calls to complete
    const apiPatterns = {
      instructor: ['/api/v1/courses/', '/api/v1/instructor'],
      admin: ['/api/v1/users/', '/api/v1/admin', '/api/v1/courses/'],
      student: ['/api/v1/enrollments/', '/api/v1/courses/'],
    };

    // Wait for at least one API response
    let apiResponseReceived = false;
    const apiPromises = apiPatterns[role].map(pattern =>
      page
        .waitForResponse(response => response.url().includes(pattern) && response.status() < 400, {
          timeout: 10000,
        })
        .then(() => {
          apiResponseReceived = true;
          console.log(`API response received for: ${pattern}`);
        })
        .catch(() => {
          console.log(`No API response for: ${pattern}`);
        })
    );

    // Wait for either API responses or timeout
    await Promise.race([
      Promise.all(apiPromises),
      new Promise(resolve => setTimeout(resolve, 8000)),
    ]);

    // Wait for role-specific dashboard elements
    return await waitForRoleDashboard(page, role, 15000);
  } catch (error) {
    console.error(`Error waiting for ${role} dashboard with API:`, error);
    return false;
  }
}
