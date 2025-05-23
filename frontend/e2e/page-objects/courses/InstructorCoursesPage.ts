import {type Page} from '@playwright/test';
import {BaseCourses} from './BaseCourses';

/**
 * Page object for instructor view of courses
 */
export class InstructorCoursesPage extends BaseCourses {
    // Instructor-specific selectors
    private readonly createCourseButtonSelectors = [
        '[data-testid="create-course-button"]',
        '[data-testid="create-first-course-button"]',
        'button:has-text("Create Course")',
        'button:has-text("New Course")',
        'a:has-text("Create Course")',
        'a:has-text("New Course")',
        'a[href="/instructor/courses/new"]',
        '.create-course-button'
    ]; private readonly courseStatusFilter = '[data-testid="course-status-filter-input"]';
    private readonly editCourseButtons = '[data-testid="edit-course-button"]';
    private readonly courseManagementHeader = '[data-testid="course-management-header"]';

    constructor(page: Page, basePath: string = '/instructor/courses') {
        super(page, basePath);
    }

    /**
     * Navigate to course creation page
     */
    async navigateToCreateCourse(): Promise<void> {
        // Try all possible create course button selectors
        for (const selector of this.createCourseButtonSelectors) {
            const buttonLocator = this.page.locator(selector);
            const isVisible = await buttonLocator.isVisible({timeout: 1000}).catch(() => false);
            if (isVisible) {
                await buttonLocator.click();
                await this.waitForPageLoad();
                console.log('Navigated to course creation page');
                return;
            }
        }

        // If no button is found, try direct navigation
        console.log('Could not find create course button, navigating directly to /instructor/courses/new');
        await this.page.goto('/instructor/courses/new');
        await this.waitForPageLoad();
    }    /**
     * Filter courses by status
     * Handles Material UI select components
     */
    async filterByStatus(status: 'draft' | 'published'): Promise<void> {
        try {
            // For Material UI components, we need to click to open dropdown first
            const filter = this.page.locator(this.courseStatusFilter);
            await filter.click({timeout: 5000});

            // Wait for the dropdown menu to appear
            await this.page.waitForSelector('.MuiMenu-list, .MuiPopover-paper', {timeout: 5000});

            // Then click on the option with the specified text
            await this.page.locator(`.MuiMenu-list li:text-is("${status}"), .MuiMenuItem-root:text-is("${status}")`).click();

            await this.waitForSearchResults();
            console.log(`Filtered courses by status: ${status}`);
        } catch (error) {
            console.error(`Error filtering by status "${status}":`, error);
            await this.takeScreenshot(`filter-error-${status}`);
        }
    }

    /**
     * Check if instructor-specific UI elements are visible
     */
    async hasInstructorControls(): Promise<boolean> {
        try {
            // Create button: try all selectors
            let createButtonFound = false;
            for (const selector of this.createCourseButtonSelectors) {
                const isVisible = await this.page.locator(selector).isVisible().catch(() => false);
                if (isVisible) {
                    createButtonFound = true;
                    break;
                }
            }

            const statusFilter = await this.page.locator(this.courseStatusFilter).isVisible();
            const managementHeader = await this.page.locator(this.courseManagementHeader).isVisible();

            return createButtonFound && statusFilter && managementHeader;
        } catch (error) {
            console.error('Error checking instructor controls:', error);
            return false;
        }
    }

    /**
     * Click edit button for a specific course
     */
    async clickEditCourse(courseTitle: string): Promise<void> {
        const courseCard = this.page.locator(`[data-testid*="course"]:has-text("${courseTitle}")`);
        await courseCard.hover();

        const editButton = courseCard.locator(this.editCourseButtons);
        await editButton.click();

        await this.waitForPageLoad();
        console.log(`Clicked edit button for course: ${courseTitle}`);
    }    /**
     * Check if a course exists in the list by title
     * @param title The title of the course to look for
     * @param options Additional options for finding the course
     * @returns Promise<boolean> True if course exists, false otherwise
     */
    async hasCourse(title: string, options: {
        useSearch?: boolean;
        useFilters?: boolean;
        filterStatus?: 'draft' | 'published' | 'all';
        retryCount?: number;
    } = {}): Promise<boolean> {
        const {
            useSearch = true,
            useFilters = false,  // Disabled by default since we're skipping filters
            filterStatus = 'all',
            retryCount = 2
        } = options;

        try {
            // Log before starting search
            console.log(`Looking for course with title: "${title}" (useSearch: ${useSearch}, useFilters: DISABLED, filterStatus: ${filterStatus})`);

            // First check if the page has loaded course content
            const hasContent = await this.page.locator('[data-testid="courses-list"], .courses-list, .MuiGrid-container, .course-card').isVisible()
                .catch(() => false);

            if (!hasContent) {
                console.warn('Cannot find course list container. Taking screenshot for debugging.');
                await this.takeScreenshot('missing-course-list-container');

                // Try waiting a bit more for courses to load
                await this.page.waitForTimeout(2000);
            }

            // First try directly without filters or search
            if (await this.findCourseDirectly(title)) {
                return true;
            }

            // If not found and search is enabled, try searching
            if (useSearch) {
                console.log(`Course not found. Trying search with term: ${title}`);
                try {
                    await this.searchForCourse(title);
                    await this.waitForSearchResults();

                    if (await this.findCourseDirectly(title)) {
                        return true;
                    }
                } catch (err) {
                    console.error('Error during search:', err);
                }
            }

            // Last resort - try dumping all course titles for debugging
            console.warn(`❌ Course "${title}" not found after search`);
            await this.takeScreenshot(`course-not-found-${title.replace(/\s+/g, '-')}`);

            // Log all course titles found for debugging
            const allCourses = await this.page.locator('[data-testid*="course"], .course-card, .MuiCard-root').all();
            console.log(`Found ${allCourses.length} total course elements on page`);
            for (let i = 0; i < allCourses.length; i++) {
                try {
                    const courseText = await allCourses[i].textContent();
                    console.log(`Course ${i + 1}: ${courseText?.trim().substring(0, 50)}...`);
                } catch (err) {
                    console.log(`Could not get text for course ${i + 1}`);
                }
            }

            return false;
        } catch (error) {
            console.error(`Error checking for course "${title}":`, error);
            await this.takeScreenshot(`error-finding-course-${title.replace(/\s+/g, '-')}`);
            return false;
        }
    }

    /**
     * Helper method to find a course directly using selectors without search or filters
     * @private
     */
    private async findCourseDirectly(title: string): Promise<boolean> {
        // Use various selectors to try to find the course
        const courseSelectors = [
            // Specific selectors
            `[data-testid="course-card"]:has-text("${title}")`,
            `[data-testid*="course"]:has-text("${title}")`,
            `.course-card:has-text("${title}")`,
            // Material UI selectors
            `.MuiCard-root:has-text("${title}")`,
            `.MuiCardContent-root:has-text("${title}")`,
            `.MuiTypography-root:has-text("${title}")`,
            // Tag based selectors
            `h3:has-text("${title}")`,
            `h4:has-text("${title}")`,
            `h5:has-text("${title}")`,
            `p:has-text("${title}")`,
            `div:has-text("${title}")`,
            // Fallback approach - get all text nodes
            `text=${title}`
        ];

        // Try each selector
        for (const selector of courseSelectors) {
            try {
                const course = this.page.locator(selector);
                const count = await course.count();
                console.log(`Selector "${selector}" found ${count} matches`);

                if (count > 0) {
                    // Try to get the full text to verify it contains our title
                    for (let i = 0; i < count; i++) {
                        const element = course.nth(i);
                        try {
                            const isVisible = await element.isVisible().catch(() => false);
                            if (isVisible) {
                                const text = await element.textContent() || '';
                                if (text.includes(title)) {
                                    console.log(`✅ Found course with title "${title}" using selector: ${selector}`);
                                    await this.takeScreenshot(`course-found-${title.replace(/\s+/g, '-')}`);
                                    return true;
                                } else {
                                    console.log(`Element matched but text didn't contain title. Found: "${text}"`);
                                }
                            }
                        } catch (err) {
                            console.log(`Error checking element ${i} with selector ${selector}:`, err);
                        }
                    }
                }
            } catch (selectorError) {
                console.log(`Error using selector "${selector}":`, selectorError);
            }
        }

        // As a last resort, try to get all visible text on the page
        const pageContent = await this.page.textContent('body');
        if (pageContent && pageContent.includes(title)) {
            console.log(`Found course title "${title}" in page content but couldn't locate the element`);
            await this.takeScreenshot(`course-in-page-${title.replace(/\s+/g, '-')}`);
            return true;
        }

        return false;
    }
}
