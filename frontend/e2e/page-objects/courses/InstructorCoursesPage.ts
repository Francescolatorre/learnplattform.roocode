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
    ];
    private readonly courseStatusFilter = '[data-testid="course-status-filter"]';
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
    }

    /**
     * Filter courses by status
     */
    async filterByStatus(status: 'draft' | 'published'): Promise<void> {
        const filter = this.page.locator(this.courseStatusFilter);
        await filter.selectOption(status);
        await this.waitForSearchResults();
        console.log(`Filtered courses by status: ${status}`);
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
    }

    /**
     * Check if a course exists in the list by title
     * @param title The title of the course to look for
     * @returns Promise<boolean> True if course exists, false otherwise
     */
    async hasCourse(title: string): Promise<boolean> {
        const courseSelector = `[data-testid="course-card"]:has-text("${title}")`;
        const course = this.page.locator(courseSelector);
        return await course.isVisible();
    }
}
