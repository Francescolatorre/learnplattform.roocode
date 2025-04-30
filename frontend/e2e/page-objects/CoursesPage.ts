import {Page, Locator} from '@playwright/test';
import {BasePage} from './BasePage';
import {takeScreenshot} from '../setupTests';

/**
 * Base page object for course listing functionality
 * Handles common course list elements regardless of role
 */
export class CoursesPage extends BasePage {
    // Common selectors for course lists
    readonly courseTitleSelectors = [
        'h1:has-text("Courses")',
        'h2:has-text("Courses")',
        'h3:has-text("Courses")',
        'h4:has-text("Courses")',
        '[data-testid="courses-title"]'
    ];

    readonly courseCardSelectors = [
        '.course-card',
        '.MuiCard-root',
        '[data-testid^="course-card-"]',
        '.course-item'
    ];

    readonly courseGridSelectors = [
        '.course-grid',
        '.courses-container',
        '.MuiGrid-container',
        '[data-testid="courses-grid"]'
    ];

    readonly courseListSelectors = [
        '.course-list',
        'ul.courses-list',
        '[data-testid="courses-list"]'
    ];

    readonly paginationSelectors = [
        'nav[aria-label="pagination"]',
        '.MuiPagination-root',
        '.pagination',
        '[data-testid="pagination"]'
    ];

    readonly emptyStateSelectors = [
        '.empty-state',
        '.no-courses',
        '[data-testid="empty-state"]'
    ];

    constructor(page: Page, url: string) {
        super(page, url);
    }

    /**
     * Check if the courses page has loaded properly
     */
    async isCoursesPageLoaded(): Promise<boolean> {
        try {
            // Look for the title
            for (const selector of this.courseTitleSelectors) {
                const titleLocator = this.page.locator(selector);
                const isVisible = await titleLocator.isVisible({timeout: 2000});
                if (isVisible) {
                    console.log('Courses page title found');
                    return true;
                }
            }

            // Look for course cards/list or empty state
            const elementSelectors = [
                ...this.courseCardSelectors,
                ...this.courseGridSelectors,
                ...this.courseListSelectors,
                ...this.emptyStateSelectors
            ];

            for (const selector of elementSelectors) {
                const elementLocator = this.page.locator(selector);
                const isVisible = await elementLocator.isVisible({timeout: 1000});
                if (isVisible) {
                    console.log(`Courses page element found: ${selector}`);
                    return true;
                }
            }

            console.warn('Courses page does not appear to be loaded - no course elements found');
            await this.takeScreenshot('courses-page-not-loaded');
            return false;
        } catch (error) {
            console.error('Error checking if courses page is loaded:', error);
            return false;
        }
    }

    /**
     * Get all course cards visible on the page
     */
    async getCourseCards(): Promise<Locator> {
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
                const isVisible = await emptyState.isVisible({timeout: 1000});

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
     * Get all course titles from the page
     */
    async getCoursesTitles(): Promise<string[]> {
        const titles: string[] = [];

        try {
            const cards = await this.getCourseCards();
            const count = await cards.count();

            for (let i = 0; i < count; i++) {
                const card = cards.nth(i);
                const titleLocators = [
                    card.locator('h2'),
                    card.locator('h3'),
                    card.locator('h4'),
                    card.locator('.course-title'),
                    card.locator('[data-testid="course-title"]')
                ];

                for (const titleLocator of titleLocators) {
                    if (await titleLocator.isVisible({timeout: 1000})) {
                        const titleText = await titleLocator.textContent();
                        if (titleText) {
                            titles.push(titleText.trim());
                            break;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error getting course titles:', error);
        }

        return titles;
    }

    /**
     * Check if a course with given title exists on the page
     */
    async hasCourse(title: string): Promise<boolean> {
        const titles = await this.getCoursesTitles();
        return titles.some(t => t.includes(title));
    }

    /**
     * Click on a course card by title
     */
    async clickCourse(title: string): Promise<void> {
        try {
            const cards = await this.getCourseCards();
            const count = await cards.count();

            for (let i = 0; i < count; i++) {
                const card = cards.nth(i);
                const cardTitle = await card.locator('h2, h3, h4, .course-title, [data-testid="course-title"]').textContent();

                if (cardTitle && cardTitle.includes(title)) {
                    await card.click();
                    console.log(`Clicked on course: ${title}`);
                    await this.waitForPageLoad();
                    return;
                }
            }

            throw new Error(`Could not find course with title: ${title}`);
        } catch (error) {
            console.error(`Failed to click course ${title}:`, error);
            throw error;
        }
    }

    /**
     * Navigate to a different page of courses if pagination is available
     */
    async goToPage(pageNumber: number): Promise<boolean> {
        try {
            for (const selector of this.paginationSelectors) {
                const paginationLocator = this.page.locator(selector);
                const isVisible = await paginationLocator.isVisible({timeout: 1000});

                if (isVisible) {
                    // Look for page button with the specified number
                    const pageButton = paginationLocator.locator(`button:has-text("${pageNumber}"), [aria-label="Go to page ${pageNumber}"]`);
                    const pageButtonVisible = await pageButton.isVisible({timeout: 1000});

                    if (pageButtonVisible) {
                        await pageButton.click();
                        console.log(`Navigated to page ${pageNumber}`);
                        await this.waitForPageLoad();
                        return true;
                    }
                }
            }

            console.warn(`Could not find page ${pageNumber} or pagination controls`);
            return false;
        } catch (error) {
            console.error(`Error navigating to page ${pageNumber}:`, error);
            return false;
        }
    }

    /**
     * Check if course cards contain markdown elements
     */
    async checkForMarkdownInCards(): Promise<{
        hasMarkdownElements: boolean;
        elementCounts: {[key: string]: number};
    }> {
        const result = {
            hasMarkdownElements: false,
            elementCounts: {} as {[key: string]: number}
        };

        try {
            const cards = await this.getCourseCards();
            const count = await cards.count();

            // Define markdown elements to look for
            const markdownSelectors = {
                headings: 'h1, h2, h3, h4, h5, h6',
                bold: 'strong, b',
                italic: 'em, i',
                code: 'code, pre',
                lists: 'ul, ol, li',
                links: 'a[href]',
                images: 'img'
            };

            // Initialize counts
            for (const key in markdownSelectors) {
                result.elementCounts[key] = 0;
            }

            // Check each card
            for (let i = 0; i < count; i++) {
                const card = cards.nth(i);

                for (const [key, selector] of Object.entries(markdownSelectors)) {
                    const elements = card.locator(selector);
                    const elemCount = await elements.count();
                    result.elementCounts[key] += elemCount;

                    if (elemCount > 0) {
                        result.hasMarkdownElements = true;
                    }
                }
            }

            console.log('Markdown element counts in course cards:', result.elementCounts);

        } catch (error) {
            console.error('Error checking for markdown in cards:', error);
        }

        return result;
    }
}

/**
 * Student-specific courses page
 */
export class StudentCoursesPage extends CoursesPage {
    readonly enrollButtonSelectors = [
        'button:has-text("Enroll")',
        'button:has-text("Join")',
        'button[data-testid="enroll-button"]'
    ];

    readonly enrolledBadgeSelectors = [
        '.enrolled-badge',
        '.MuiChip-root:has-text("Enrolled")',
        '[data-testid="enrolled-badge"]'
    ];

    constructor(page: Page) {
        super(page, '/courses');
    }

    /**
     * Enroll in a course by title
     */
    async enrollInCourse(title: string): Promise<boolean> {
        try {
            const cards = await this.getCourseCards();
            const count = await cards.count();

            for (let i = 0; i < count; i++) {
                const card = cards.nth(i);
                const cardTitle = await card.locator('h2, h3, h4, .course-title, [data-testid="course-title"]').textContent();

                if (cardTitle && cardTitle.includes(title)) {
                    // Check for enroll button in this card
                    for (const selector of this.enrollButtonSelectors) {
                        const enrollButton = card.locator(selector);
                        const isVisible = await enrollButton.isVisible({timeout: 1000});

                        if (isVisible) {
                            await enrollButton.click();
                            console.log(`Clicked enroll button for course: ${title}`);
                            await this.waitForPageLoad();
                            return true;
                        }
                    }

                    // If we found the card but no enroll button, check if already enrolled
                    for (const selector of this.enrolledBadgeSelectors) {
                        const enrolledBadge = card.locator(selector);
                        const isEnrolled = await enrolledBadge.isVisible({timeout: 1000});

                        if (isEnrolled) {
                            console.log(`Already enrolled in course: ${title}`);
                            return true;
                        }
                    }

                    console.warn(`Found course ${title} but no enroll button or enrolled badge`);
                    return false;
                }
            }

            throw new Error(`Could not find course with title: ${title}`);
        } catch (error) {
            console.error(`Failed to enroll in course ${title}:`, error);
            return false;
        }
    }

    /**
     * Check if student is enrolled in a course
     */
    async isEnrolledIn(title: string): Promise<boolean> {
        try {
            const cards = await this.getCourseCards();
            const count = await cards.count();

            for (let i = 0; i < count; i++) {
                const card = cards.nth(i);
                const cardTitle = await card.locator('h2, h3, h4, .course-title, [data-testid="course-title"]').textContent();

                if (cardTitle && cardTitle.includes(title)) {
                    // Check for enrolled badge in this card
                    for (const selector of this.enrolledBadgeSelectors) {
                        const enrolledBadge = card.locator(selector);
                        const isEnrolled = await enrolledBadge.isVisible({timeout: 1000});

                        if (isEnrolled) {
                            console.log(`Verified enrollment in course: ${title}`);
                            return true;
                        }
                    }

                    // Also check if there's a "Continue Learning" button instead of "Enroll"
                    const continueButton = card.locator('button:has-text("Continue"), button:has-text("View Course")');
                    const hasContinueButton = await continueButton.isVisible({timeout: 1000});

                    if (hasContinueButton) {
                        console.log(`Verified enrollment in course ${title} (has Continue/View button)`);
                        return true;
                    }

                    return false;
                }
            }

            console.warn(`Course not found: ${title}`);
            return false;
        } catch (error) {
            console.error(`Error checking enrollment for course ${title}:`, error);
            return false;
        }
    }
}

/**
 * Instructor-specific courses page
 */
export class InstructorCoursesPage extends CoursesPage {
    readonly createCourseButtonSelectors = [
        'a:has-text("Create Course")',
        'button:has-text("Create Course")',
        'a:has-text("New Course")',
        'button:has-text("New Course")',
        '.create-course-button',
        '[data-testid="create-course-button"]'
    ];

    readonly viewSwitchSelectors = [
        '.view-switch',
        '[role="group"]:has-button:has-text("Grid")',
        '[data-testid="view-mode-switch"]'
    ];

    constructor(page: Page) {
        super(page, '/instructor/courses');
    }

    /**
     * Navigate to course creation page
     */
    async navigateToCreateCourse(): Promise<void> {
        try {
            const createButton = await this.findElement(this.createCourseButtonSelectors, 'create course button');
            await createButton.click();
            console.log('Clicked create course button');
            await this.waitForPageLoad();
        } catch (error) {
            console.error('Failed to navigate to course creation:', error);
            throw error;
        }
    }

    /**
     * Switch view mode between grid and list
     */
    async switchViewMode(mode: 'grid' | 'list'): Promise<boolean> {
        try {
            for (const selector of this.viewSwitchSelectors) {
                const switchElement = this.page.locator(selector);
                const isVisible = await switchElement.isVisible({timeout: 1000});

                if (isVisible) {
                    const modeButton = switchElement.locator(`button:has-text("${mode === 'grid' ? 'Grid' : 'List'}")`);
                    const isModeButtonVisible = await modeButton.isVisible({timeout: 1000});

                    if (isModeButtonVisible) {
                        await modeButton.click();
                        console.log(`Switched to ${mode} view`);
                        await this.waitForPageLoad();
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
     * Edit a course by title
     */
    async editCourse(title: string): Promise<void> {
        try {
            const cards = await this.getCourseCards();
            const count = await cards.count();

            for (let i = 0; i < count; i++) {
                const card = cards.nth(i);
                const cardTitle = await card.locator('h2, h3, h4, .course-title, [data-testid="course-title"]').textContent();

                if (cardTitle && cardTitle.includes(title)) {
                    // Look for edit button or menu
                    const editButton = card.locator('button[aria-label="edit"], button:has-text("Edit"), [data-testid="edit-course"]');
                    const hasEditButton = await editButton.isVisible({timeout: 1000});

                    if (hasEditButton) {
                        await editButton.click();
                        console.log(`Clicked edit button for course: ${title}`);
                        await this.waitForPageLoad();
                        return;
                    }

                    // If no direct edit button, check for menu button
                    const menuButton = card.locator('button[aria-label="menu"], button[aria-label="more"], [data-testid="course-menu"]');
                    const hasMenuButton = await menuButton.isVisible({timeout: 1000});

                    if (hasMenuButton) {
                        await menuButton.click();
                        console.log(`Clicked menu button for course: ${title}`);

                        // Wait for menu to open and click edit option
                        const editOption = this.page.locator('li:has-text("Edit"), [role="menuitem"]:has-text("Edit")');
                        await editOption.isVisible({timeout: 3000});
                        await editOption.click();
                        console.log('Selected edit option from menu');
                        await this.waitForPageLoad();
                        return;
                    }

                    throw new Error(`No edit button or menu found for course: ${title}`);
                }
            }

            throw new Error(`Could not find course with title: ${title}`);
        } catch (error) {
            console.error(`Failed to edit course ${title}:`, error);
            throw error;
        }
    }

    /**
     * Delete a course by title
     */
    async deleteCourse(title: string, confirmDelete: boolean = true): Promise<boolean> {
        try {
            const cards = await this.getCourseCards();
            const count = await cards.count();

            for (let i = 0; i < count; i++) {
                const card = cards.nth(i);
                const cardTitle = await card.locator('h2, h3, h4, .course-title, [data-testid="course-title"]').textContent();

                if (cardTitle && cardTitle.includes(title)) {
                    // Look for delete button
                    const deleteButton = card.locator('button[aria-label="delete"], button:has-text("Delete"), [data-testid="delete-course"]');
                    const hasDeleteButton = await deleteButton.isVisible({timeout: 1000});

                    if (hasDeleteButton) {
                        await deleteButton.click();
                        console.log(`Clicked delete button for course: ${title}`);
                    } else {
                        // If no direct delete button, check for menu button
                        const menuButton = card.locator('button[aria-label="menu"], button[aria-label="more"], [data-testid="course-menu"]');
                        const hasMenuButton = await menuButton.isVisible({timeout: 1000});

                        if (hasMenuButton) {
                            await menuButton.click();
                            console.log(`Clicked menu button for course: ${title}`);

                            // Wait for menu to open and click delete option
                            const deleteOption = this.page.locator('li:has-text("Delete"), [role="menuitem"]:has-text("Delete")');
                            const hasDeleteOption = await deleteOption.isVisible({timeout: 3000});

                            if (hasDeleteOption) {
                                await deleteOption.click();
                                console.log('Selected delete option from menu');
                            } else {
                                console.warn('No delete option found in menu');
                                return false;
                            }
                        } else {
                            console.warn('No delete button or menu found');
                            return false;
                        }
                    }

                    // Handle confirmation dialog
                    if (confirmDelete) {
                        // Wait for confirmation dialog
                        const confirmDialog = this.page.locator('dialog, .MuiDialog-root, [role="dialog"]');
                        const hasDialog = await confirmDialog.isVisible({timeout: 3000});

                        if (hasDialog) {
                            // Click confirm/delete button in dialog
                            const confirmButton = confirmDialog.locator('button:has-text("Delete"), button:has-text("Confirm"), button.MuiButton-containedError');
                            const hasConfirmButton = await confirmButton.isVisible({timeout: 1000});

                            if (hasConfirmButton) {
                                await confirmButton.click();
                                console.log('Confirmed course deletion');
                                await this.waitForPageLoad();
                                return true;
                            } else {
                                console.warn('No confirm button found in dialog');
                                // Try to cancel if we can't find confirm button
                                const cancelButton = confirmDialog.locator('button:has-text("Cancel")');
                                await cancelButton.click().catch(() => { });
                                return false;
                            }
                        } else {
                            console.warn('No confirmation dialog appeared');
                            return false;
                        }
                    }

                    return true;
                }
            }

            console.warn(`Course not found: ${title}`);
            return false;
        } catch (error) {
            console.error(`Error deleting course ${title}:`, error);
            return false;
        }
    }
}
