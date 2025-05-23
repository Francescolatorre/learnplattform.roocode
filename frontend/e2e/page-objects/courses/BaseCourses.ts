import {type Locator, type Page} from '@playwright/test';
import {BasePage} from '../BasePage';

/**
 * Base class for all course pages providing common functionality
 */
export class BaseCourses extends BasePage {
    protected readonly courseSearchInput = '[data-testid="course-search-input"]';

    protected readonly statusFilterSelectors = [
        '[data-testid="course-status-filter"]',
        '[data-testid="course-status-select"]'
    ];

    protected readonly courseCardSelectors = [
        '[data-testid^="course-card-"]',
        '.course-card'
    ];

    protected readonly courseGridSelectors = [
        '[data-testid="courses-grid"]',
        '.courses-grid'
    ];

    protected readonly courseListSelectors = [
        '[data-testid="courses-list"]',
        '.courses-list',
        '.MuiGrid-container'
    ];

    protected readonly emptyStateSelectors = [
        '[data-testid="empty-state"]',
        '.empty-state',
        '.no-courses',
        'text="No courses found"',
        'text="No courses available"'
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
        try {
            // Look for the search input using more specific selectors
            const searchInput = this.page.locator('input[data-testid="course-search-input"]').first();
            await searchInput.waitFor({state: 'visible', timeout: 5000});
            await searchInput.fill(searchTerm);
            await this.page.keyboard.press('Enter');
            await this.waitForSearchResults();
        } catch (error) {
            console.error('Error during search:', error);
            throw error;
        }
    }/**
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
    }    /**
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
    }/**
     * Filter courses by status
     * @param status The status to filter by ('draft', 'published', 'archived' or '')
     */
    async filterByStatus(status: '' | 'draft' | 'published' | 'archived'): Promise<void> {
        try {
            // First try to find the filter using our preferred selector
            let filter = this.page.locator(this.statusFilterSelectors[0]);
            let isVisible = await filter.isVisible({timeout: 1000}).catch(() => false);

            // If not found, try alternate selector
            if (!isVisible) {
                filter = this.page.locator(this.statusFilterSelectors[1]);
                isVisible = await filter.isVisible({timeout: 1000}).catch(() => false);
            }

            if (!isVisible) {
                throw new Error('Could not find status filter');
            }

            const optionText = status || 'All';

            // Try Material UI select dropdown with explicit wait for dropdown
            await filter.click();
            await this.page.waitForSelector('.MuiMenu-list', {timeout: 2000});

            // Try to find and click the option
            const option = this.page.locator(`.MuiMenu-list [data-value="${status}"], .MuiMenuItem-root[data-value="${status}"]`);
            await option.click();

            // Wait for results to update
            await this.waitForSearchResults();
            console.log(`Successfully filtered by status: ${status}`);
        } catch (error) {
            console.error('Error filtering by status:', error);
            await this.takeScreenshot(`filter-status-error-${status}`);
            throw error;
        }
    }    /**
     * Get current status filter value
     */
    async getCurrentStatusFilter(): Promise<string> {
        try {
            // Wait for the filter to be visible
            const filter = this.page.locator('[data-testid="course-status-filter"]');
            await filter.waitFor({state: 'attached', timeout: 2000});

            // Get selected value
            const value = await filter.getAttribute('data-value').catch(() => '');
            console.log('Current status filter value:', value);
            return value || '';
        } catch (error) {
            console.error('Error getting current status filter:', error);
            return '';
        }
    }

    /**
     * Verify that all visible courses have the given status
     */
    async verifyVisibleCourseStatuses(expectedStatus: string): Promise<boolean> {
        if (!expectedStatus) return true;

        const cards = this.page.locator('[data-testid^="course-card-"]');
        const count = await cards.count();

        for (let i = 0; i < count; i++) {
            const card = cards.nth(i);
            const statusElement = card.locator('[data-testid="course-status"]');
            const status = await statusElement.getAttribute('data-value');

            if (status?.toLowerCase() !== expectedStatus.toLowerCase()) {
                console.error(`Course status mismatch: expected ${expectedStatus}, got ${status}`);
                return false;
            }
        }
        return true;
    }
}
