import { type Locator, type Page } from '@playwright/test';
import { takeScreenshot } from '../setupTests';
import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class CoursesPage extends BasePage {
  // Course related selectors
  readonly courseTitleSelectors = ['[data-testid^="courses-title-"]'];

  readonly courseCardSelectors = [
    '[data-testid^="course-card-"]',
    '[data-testid="course-list-item"]',
  ];

  readonly courseGridSelectors = [
    '.course-grid',
    '.courses-container',
    '.MuiGrid-container',
    '[data-testid="courses-grid"]',
  ];

  readonly courseListSelectors = [
    '.course-list',
    'ul.courses-list',
    '[data-testid^="courses-list"]',
    '.MuiList-root',
  ];

  readonly courseDescriptionSelectors = [
    '.course-description',
    '[data-testid="course-description"]',
    '.course-summary',
    '.MuiCardContent-root p',
    '.MuiCardContent-root .MuiTypography-root',
    '.course-card-description',
  ];

  // UI control selectors
  readonly paginationSelectors = [
    'nav[aria-label="pagination"]',
    '.MuiPagination-root',
    '.pagination',
    '[data-testid="pagination"]',
    '[data-testid="course-pagination"]',
  ];

  readonly viewSwitchSelectors = [
    '.view-switch',
    '[data-testid="view-switch"]',
    '.view-mode-toggle',
  ];

  readonly searchFieldSelectors = [
    '[data-testid="search-courses-input"]',
    '[data-testid="course-search-field"]',
    'input[aria-label="Search courses"]',
    'input[placeholder*="Search courses"]',
    '.MuiInputBase-input[type="text"]',
    '.course-search input',
  ];

  readonly emptyStateSelectors = [
    '.empty-state',
    '.no-courses',
    '[data-testid="empty-state"]',
    'text="No courses found"',
    'text="No courses available"',
  ];
  constructor(page: Page, basePath: string) {
    super(page, basePath);
  }

  /**
   * Navigate to the courses page
   */ async navigateTo(): Promise<void> {
    await this.page.goto(this.basePath);
    await this.waitForPageLoad();
    console.log('Navigated to courses page');
  }

  /**
   * Check if the courses page has loaded properly
   */
  async isCoursesPageLoaded(): Promise<boolean> {
    console.log('Checking if courses page is loaded...');

    await this.page.waitForLoadState('networkidle').catch(() => {
      console.log('Network did not reach idle state, continuing...');
    });

    try {
      // First check for any error states
      const errorSelectors = [
        '[data-testid="error-message"]',
        '.error-state',
        'text="Error loading courses"',
      ];

      for (const selector of errorSelectors) {
        const error = this.page.locator(selector);
        if (await error.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.error(`Error state detected: ${selector}`);
          await this.takeScreenshot('courses-page-error');
          return false;
        }
      }

      // Look for courses container or list
      const containerSelectors = [...this.courseGridSelectors, ...this.courseListSelectors];

      for (const selector of containerSelectors) {
        const container = this.page.locator(selector);
        if (await container.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log(`Found courses container: ${selector}`);
          return true;
        }
      }

      // If no container found, check for empty state
      for (const selector of this.emptyStateSelectors) {
        const empty = this.page.locator(selector);
        if (await empty.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log(`Empty state detected: ${selector}`);
          return true;
        }
      }

      await this.takeScreenshot('courses-page-not-loaded');
      return false;
    } catch (err) {
      console.error('Error while checking courses page loaded:', err);
      await this.takeScreenshot('courses-page-exception');
      return false;
    }
  }

  /**
   * Get all course cards visible on the page
   */
  protected async getCourseCards(): Promise<Locator> {
    for (const selector of this.courseCardSelectors) {
      const cards = this.page.locator(selector);
      const count = await cards.count();

      if (count > 0) {
        console.log(`Found ${count} course cards with selector: ${selector}`);
        return cards;
      }
    }

    throw new Error('No course cards found on the page');
  }

  /**
   * Count how many courses are displayed
   */
  async getCourseCount(): Promise<number> {
    try {
      const cards = await this.getCourseCards();
      return await cards.count();
    } catch (error) {
      // Check for empty state
      for (const selector of this.emptyStateSelectors) {
        const emptyState = this.page.locator(selector);
        const isVisible = await emptyState.isVisible({ timeout: 1000 });

        if (isVisible) {
          console.log('No courses found (empty state detected)');
          return 0;
        }
      }

      console.error('Error getting course count:', error);
      return 0;
    }
  }

  /**
   * Check if any courses are displayed
   */
  async hasAnyCourses(): Promise<boolean> {
    try {
      const count = await this.getCourseCount();
      return count > 0;
    } catch (error) {
      console.error('Error checking for courses:', error);
      return false;
    }
  }

  /**
   * Get all course titles from the page
   */
  async getCoursesTitles(): Promise<string[]> {
    const titles: string[] = [];

    try {
      // Check for list items first (student view)
      const listItems = this.page.locator('.MuiListItem-root');
      const listCount = await listItems.count();

      if (listCount > 0) {
        console.log(`Found ${listCount} course list items`);
        // Get title from each list item
        for (let i = 0; i < listCount; i++) {
          const item = listItems.nth(i);
          const titleElement = item.locator('.MuiListItemText-primary').first();
          const titleText = await titleElement.textContent();
          if (titleText?.trim()) {
            titles.push(titleText.trim());
          }
        }
      } else {
        // Fallback to card view (instructor view)
        const cards = this.page.locator('.MuiCard-root');
        const cardCount = await cards.count();
        console.log(`Found ${cardCount} course cards`);

        // Get title from each card
        for (let i = 0; i < cardCount; i++) {
          const card = cards.nth(i);
          const titleElement = card
            .locator('h2, h3, h4, h5, .MuiTypography-h5, .MuiTypography-h6')
            .first();
          const titleText = await titleElement.textContent();
          if (titleText?.trim()) {
            titles.push(titleText.trim());
          }
        }
      }

      console.log(`Found ${titles.length} course titles:`, titles);
      return titles;
    } catch (error) {
      console.error('Error getting course titles:', error);
      return titles;
    }
  }

  /**
   * Search for a specific course name
   */
  async searchForCourse(searchTerm: string): Promise<void> {
    console.log(`Attempting to search for course: "${searchTerm}"`);
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        for (const selector of this.searchFieldSelectors) {
          const searchField = this.page.locator(selector);
          const isVisible = await searchField.isVisible({ timeout: 1000 }).catch(() => false);
          if (isVisible) {
            await searchField.clear();
            await searchField.type(searchTerm, { delay: 50 });
            await this.waitForSearchResults();
            return;
          }
        }

        if (attempt < maxAttempts) {
          await this.page.waitForTimeout(1000 * attempt);
          continue;
        }
      } catch (error) {
        console.error(`Search attempt ${attempt} failed:`, error);
        if (attempt < maxAttempts) {
          await this.page.waitForTimeout(1000 * attempt);
          continue;
        }
        throw error;
      }
    }

    throw new Error(`Could not find search field after ${maxAttempts} attempts`);
  }

  /**
   * Wait for search results to load
   */
  protected async waitForSearchResults(): Promise<void> {
    console.log('Waiting for search results...');
    try {
      // Wait for any loading indicators to disappear
      const loadingSelectors = [
        '[data-testid="loading-indicator"]',
        '.loading-spinner',
        '.MuiCircularProgress-root',
      ];

      for (const selector of loadingSelectors) {
        await this.page
          .locator(selector)
          .waitFor({ state: 'detached', timeout: 5000 })
          .catch(() => {});
      }

      // Wait for network requests to settle
      await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
        console.log('Network did not reach idle state, continuing...');
      });

      await this.page.waitForTimeout(300);
      console.log('Search results loaded');
    } catch (error) {
      console.warn('Error waiting for search results:', error);
    }
  }

  /**
   * Click the first course in the list/grid
   */
  async clickFirstCourse(): Promise<void> {
    try {
      const cards = await this.getCourseCards();
      const firstCard = cards.first();
      await firstCard.click();
      await this.waitForPageLoad();
      console.log('Clicked first course card');
    } catch (error) {
      console.error('Failed to click first course:', error);
    }
  }

  /**
   * Switch between grid and list view modes
   */
  async switchViewMode(mode: 'grid' | 'list'): Promise<boolean> {
    try {
      for (const selector of this.viewSwitchSelectors) {
        const switchElement = this.page.locator(selector);
        const isVisible = await switchElement.isVisible({ timeout: 1000 }).catch(() => false);

        if (isVisible) {
          const modeButton = switchElement.locator(
            `button:has-text("${mode === 'grid' ? 'Grid' : 'List'}")`
          );
          const isModeButtonVisible = await modeButton
            .isVisible({ timeout: 1000 })
            .catch(() => false);

          if (isModeButtonVisible) {
            await modeButton.click();
            await this.waitForPageLoad();
            console.log(`Switched to ${mode} view`);
            return true;
          }
        }
      }

      console.warn(`Could not find ${mode} view switch`);
      return false;
    } catch (error) {
      console.error(`Error switching to ${mode} view:`, error);
      return false;
    }
  }

  /**
   * Get search results after performing a search
   */
  async getSearchResults(): Promise<string[]> {
    console.log('Getting search results...');
    try {
      await this.waitForSearchResults();
      const titles = await this.getCoursesTitles();
      console.log(`Found ${titles.length} search results`);
      return titles;
    } catch (error) {
      console.error('Error getting search results:', error);
      return [];
    }
  }

  /**
   * Find a test course from a list of possible course titles
   * @param possibleCourses List of course titles to try finding
   * @returns Object containing found course title or undefined if none found
   */
  async findTestCourseWithSearch(possibleCourses: string[]): Promise<{ title: string }> {
    await this.navigateTo();
    await this.isCoursesPageLoaded();

    console.log('Attempting to find a test course...');

    for (const courseName of possibleCourses) {
      console.log(`Trying to find course: ${courseName}`);
      await this.searchForCourse(courseName);
      await this.page.waitForTimeout(500);

      const results = await this.getSearchResults();
      if (results.includes(courseName)) {
        console.log(`Found test course: ${courseName}`);
        return { title: courseName };
      }
    }

    throw new Error('Could not find any test course');
  }

  /**
   * Click a course by its title
   */
  async clickCourse(courseTitle: string): Promise<void> {
    try {
      // Try to find course in both grid and list views
      const titleSelectors = [
        `text="${courseTitle}"`,
        `h2:text("${courseTitle}")`,
        `h3:text("${courseTitle}")`,
        `.MuiTypography-root:text("${courseTitle}")`,
        `[data-testid*="course"]:has-text("${courseTitle}")`,
      ];

      for (const selector of titleSelectors) {
        const element = this.page.locator(selector).first();
        const isVisible = await element.isVisible({ timeout: 1000 }).catch(() => false);

        if (isVisible) {
          await element.click();
          await this.waitForPageLoad();
          console.log(`Clicked course: ${courseTitle}`);
          return;
        }
      }

      throw new Error(`Could not find clickable element for course: ${courseTitle}`);
    } catch (error) {
      console.error(`Failed to click course ${courseTitle}:`, error);
      throw error;
    }
  }
}
