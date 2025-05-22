import {type Locator, type Page} from '@playwright/test';
import {BasePage} from '../BasePage';

/**
 * Base class for all course pages providing common functionality
 */
export class BaseCourses extends BasePage {
    // Common selectors used across all role-specific pages
    protected readonly courseTitleSelectors = ['[data-testid^="courses-title-"]'];

    protected readonly courseCardSelectors = [
        '[data-testid^="course-card-"]',
        '[data-testid="course-list-item"]'
    ];

    protected readonly courseGridSelectors = [
        '.course-grid',
        '.courses-container',
        '.MuiGrid-container',
        '[data-testid="courses-grid"]'
    ];

    protected readonly courseListSelectors = [
        '.course-list',
        'ul.courses-list',
        '[data-testid^="courses-list"]',
        '.MuiList-root'
    ];

    protected readonly searchFieldSelectors = [
        '[data-testid="search-courses-input"]',
        '[data-testid="course-search-field"]',
        'input[aria-label="Search courses"]',
        'input[placeholder*="Search courses"]',
        '.MuiInputBase-input[type="text"]',
        '.course-search input'
    ];

    protected readonly emptyStateSelectors = [
        '.empty-state',
        '.no-courses',
        '[data-testid="empty-state"]',
        'text="No courses found"',
        'text="No courses available"'
    ];

    protected readonly viewSwitchSelectors = [
        '.view-switch',
        '[data-testid="view-switch"]',
        '.view-mode-toggle'
    ];

    constructor(page: Page, basePath: string) {
        super(page, basePath);
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
                'text="Error loading courses"'
            ];

            for (const selector of errorSelectors) {
                const error = this.page.locator(selector);
                if (await error.isVisible({timeout: 1000}).catch(() => false)) {
                    console.error(`Error state detected: ${selector}`);
                    await this.takeScreenshot('courses-page-error');
                    return false;
                }
            }

            // Look for courses container or list
            const containerSelectors = [...this.courseGridSelectors, ...this.courseListSelectors];

            for (const selector of containerSelectors) {
                const container = this.page.locator(selector);
                if (await container.isVisible({timeout: 2000}).catch(() => false)) {
                    console.log(`Found courses container: ${selector}`);
                    return true;
                }
            }

            // If no container found, check for empty state
            for (const selector of this.emptyStateSelectors) {
                const empty = this.page.locator(selector);
                if (await empty.isVisible({timeout: 1000}).catch(() => false)) {
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
     * Search for a specific course name
     */
    async searchForCourse(searchTerm: string): Promise<void> {
        console.log(`Attempting to search for course: "${searchTerm}"`);
        const maxAttempts = 3;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                for (const selector of this.searchFieldSelectors) {
                    const searchField = this.page.locator(selector);
                    const isVisible = await searchField.isVisible({timeout: 1000}).catch(() => false);
                    if (isVisible) {
                        await searchField.clear();
                        await searchField.type(searchTerm, {delay: 50});
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
    }    /**
     * Wait for search results to load
     * Enhanced with better detection for network activity and UI state changes
     */
    protected async waitForSearchResults(): Promise<void> {
        console.log('Waiting for search results...');
        try {
            // First wait for any loading indicators to disappear
            const loadingSelectors = [
                '[data-testid="loading-indicator"]',
                '.loading-spinner',
                '.MuiCircularProgress-root',
                '[role="progressbar"]'
            ];

            // Note when search/filter started
            const startTime = Date.now();

            // Check for loading indicators
            let loadingIndicatorFound = false;
            for (const selector of loadingSelectors) {
                const visible = await this.page.locator(selector).isVisible().catch(() => false);
                if (visible) {
                    loadingIndicatorFound = true;
                    console.log(`Loading indicator found: ${selector}`);
                    // Wait for it to disappear
                    await this.page.locator(selector).waitFor({state: 'detached', timeout: 7000}).catch(() => {
                        console.log(`Loading indicator ${selector} did not disappear, continuing anyway`);
                    });
                }
            }

            // If we found and waited for a loading indicator, wait a bit longer for content to settle
            if (loadingIndicatorFound) {
                await this.page.waitForTimeout(500);
            }

            // Wait for network to be relatively quiet
            await this.page.waitForLoadState('networkidle', {timeout: 7000}).catch(() => {
                console.log('Network did not reach idle state, continuing...');
            });

            // Additional wait for DOM to settle after network activity
            await this.page.waitForTimeout(500);

            // Take screenshot for debugging
            await this.takeScreenshot('after-search-results-wait');

            const endTime = Date.now();
            console.log(`Search results loaded after ${endTime - startTime}ms`);
        } catch (error) {
            console.warn('Error waiting for search results:', error);
            await this.takeScreenshot('error-waiting-for-search-results');
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
     * Get all course titles from the page
     */
    async getCoursesTitles(): Promise<string[]> {
        const titles: string[] = [];

        try {
            // Check for list items first
            const listItems = this.page.locator('.MuiListItem-root');
            const listCount = await listItems.count();

            if (listCount > 0) {
                console.log(`Found ${listCount} course list items`);
                for (let i = 0; i < listCount; i++) {
                    const item = listItems.nth(i);
                    const titleElement = item.locator('.MuiListItemText-primary').first();
                    const titleText = await titleElement.textContent();
                    if (titleText?.trim()) {
                        titles.push(titleText.trim());
                    }
                }
            } else {
                // Fallback to card view
                const cards = this.page.locator('.MuiCard-root');
                const cardCount = await cards.count();
                console.log(`Found ${cardCount} course cards`);

                for (let i = 0; i < cardCount; i++) {
                    const card = cards.nth(i);
                    const titleElement = card.locator('h2, h3, h4, h5, .MuiTypography-h5, .MuiTypography-h6').first();
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
     * Click a course by its title
     */
    async clickCourse(courseTitle: string): Promise<void> {
        try {
            const titleSelectors = [
                `text="${courseTitle}"`,
                `h2:text("${courseTitle}")`,
                `h3:text("${courseTitle}")`,
                `.MuiTypography-root:text("${courseTitle}")`,
                `[data-testid*="course"]:has-text("${courseTitle}")`
            ];

            for (const selector of titleSelectors) {
                const element = this.page.locator(selector).first();
                const isVisible = await element.isVisible({timeout: 1000}).catch(() => false);

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
