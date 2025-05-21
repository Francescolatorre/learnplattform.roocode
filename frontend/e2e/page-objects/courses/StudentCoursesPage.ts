import {type Page} from '@playwright/test';
import {BaseCourses} from './BaseCourses';

/**
 * Page object for student view of courses
 */
export class StudentCoursesPage extends BaseCourses {
    constructor(page: Page, basePath: string = '/courses') {
        super(page, basePath);
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
     * Find a test course from a list of possible course titles
     */
    async findTestCourseWithSearch(possibleCourses: string[]): Promise<{title: string}> {
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
                return {title: courseName};
            }
        }

        throw new Error('Could not find any test course');
    }
}
