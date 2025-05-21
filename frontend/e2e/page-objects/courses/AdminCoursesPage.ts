import {type Page} from '@playwright/test';
import {BaseCourses} from './BaseCourses';

/**
 * Page object for admin view of courses
 */
export class AdminCoursesPage extends BaseCourses {
    // Admin-specific selectors
    private readonly adminControls = '[data-testid="admin-controls"]';
    private readonly instructorFilter = '[data-testid="instructor-filter"]';
    private readonly bulkActions = '[data-testid="bulk-actions"]';
    private readonly systemSettings = '[data-testid="system-settings"]';

    constructor(page: Page, basePath: string = '/admin/courses') {
        super(page, basePath);
    }

    /**
     * Filter courses by instructor
     */
    async filterByInstructor(instructorId: string): Promise<void> {
        const filter = this.page.locator(this.instructorFilter);
        await filter.selectOption(instructorId);
        await this.waitForSearchResults();
        console.log(`Filtered courses by instructor: ${instructorId}`);
    }

    /**
     * Check if admin-specific UI elements are visible
     */
    async hasAdminControls(): Promise<boolean> {
        try {
            const adminPanel = await this.page.locator(this.adminControls).isVisible();
            const bulkActionsMenu = await this.page.locator(this.bulkActions).isVisible();
            const settings = await this.page.locator(this.systemSettings).isVisible();

            return adminPanel && bulkActionsMenu && settings;
        } catch (error) {
            console.error('Error checking admin controls:', error);
            return false;
        }
    }

    /**
     * Perform bulk action on selected courses
     */
    async performBulkAction(action: 'publish' | 'unpublish' | 'delete'): Promise<void> {
        const bulkMenu = this.page.locator(this.bulkActions);
        await bulkMenu.click();

        await this.page.locator(`[data-testid="bulk-action-${action}"]`).click();
        await this.page.locator('[data-testid="confirm-bulk-action"]').click();

        await this.waitForSearchResults();
        console.log(`Performed bulk action: ${action}`);
    }
}
