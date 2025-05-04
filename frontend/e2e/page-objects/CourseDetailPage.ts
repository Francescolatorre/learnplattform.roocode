// filepath: c:\DEVELOPMENT\projects\learnplatfom2\frontend\e2e\page-objects\CourseDetailPage.ts
import {Page, Locator} from '@playwright/test';
import {BasePage} from './BasePage';

/**
 * Page object model for Course Detail view
 * Handles course enrollment and unenrollment operations
 */
export class CourseDetailPage extends BasePage {
    // Selectors for course content elements
    readonly courseTitleSelectors = [
        'h1.course-title',
        'h1:has-text("Course:")',
        '[data-testid="course-title"]'
    ];

    readonly courseDescriptionSelectors = [
        '.course-description',
        '[data-testid="course-description"]',
        '.MuiPaper-root .MuiBox-root'
    ];

    readonly enrollButtonSelectors = [
        'button:has-text("Enroll in Course")',
        '[data-testid="enroll-button"]'
    ];

    readonly unenrollButtonSelectors = [
        'button:has-text("Unenroll")',
        '[data-testid="unenroll-button"]'
    ];

    readonly confirmUnenrollButtonSelectors = [
        'button:has-text("Unenroll")',
        '.MuiDialogActions-root button[color="error"]',
        '[data-testid="confirm-unenroll"]'
    ];

    readonly cancelUnenrollButtonSelectors = [
        'button:has-text("Cancel")',
        '.MuiDialogActions-root button:not([color="error"])',
        '[data-testid="cancel-unenroll"]'
    ];

    readonly enrollmentStatusSelectors = [
        '.MuiAlert-root',
        '[data-testid="enrollment-status"]'
    ];

    readonly viewTasksButtonSelectors = [
        'button:has-text("View Course Tasks")',
        '[data-testid="view-tasks-button"]'
    ];

    readonly courseStatusSelectors = [
        '.MuiChip-root',
        '[data-testid="course-status"]'
    ];

    constructor(page: Page, courseId?: string) {
        // If no courseId is provided, we'll use a generic URL
        const url = courseId ? `/courses/${courseId}` : '/courses';
        super(page, url);
    }

    /**
     * Navigate to a specific course by ID
     */
    async navigateToCourse(courseId: string): Promise<void> {
        await this.navigate(`/courses/${courseId}`);
    }

    /**
     * Check if course detail page is loaded
     */
    async isCourseDetailPageLoaded(): Promise<boolean> {
        try {
            // Try to find the course title
            for (const selector of this.courseTitleSelectors) {
                const titleElement = this.page.locator(selector);
                const isVisible = await titleElement.isVisible({timeout: 2000});
                if (isVisible) {
                    console.log('Course detail page loaded: title found');
                    return true;
                }
            }

            // If title not found, look for course description
            for (const selector of this.courseDescriptionSelectors) {
                const descElement = this.page.locator(selector);
                const isVisible = await descElement.isVisible({timeout: 1000});
                if (isVisible) {
                    console.log('Course detail page loaded: description found');
                    return true;
                }
            }

            console.warn('Course detail page might not be fully loaded');
            await this.takeScreenshot('course-detail-page-loading-check');
            return false;
        } catch (error) {
            console.error('Error checking if course detail page is loaded:', error);
            return false;
        }
    }

    /**
     * Get the course title
     */
    async getCourseTitle(): Promise<string> {
        for (const selector of this.courseTitleSelectors) {
            const titleElement = this.page.locator(selector);
            const isVisible = await titleElement.isVisible({timeout: 1000});
            if (isVisible) {
                const text = await titleElement.textContent();
                return text ? text.trim() : '';
            }
        }
        return '';
    }

    /**
     * Get the course description
     */
    async getCourseDescription(): Promise<string> {
        for (const selector of this.courseDescriptionSelectors) {
            const descElement = this.page.locator(selector);
            const isVisible = await descElement.isVisible({timeout: 1000});
            if (isVisible) {
                const text = await descElement.textContent();
                return text ? text.trim() : '';
            }
        }
        return '';
    }

    /**
     * Check if user is enrolled in this course
     */
    async isEnrolled(): Promise<boolean> {
        try {
            // Look for the View Tasks button which indicates enrollment
            for (const selector of this.viewTasksButtonSelectors) {
                const viewTasksButton = this.page.locator(selector);
                const isVisible = await viewTasksButton.isVisible({timeout: 1000});
                if (isVisible) {
                    console.log('User is enrolled (View Tasks button found)');
                    return true;
                }
            }

            // Look for unenroll button which also indicates enrollment
            for (const selector of this.unenrollButtonSelectors) {
                const unenrollButton = this.page.locator(selector);
                const isVisible = await unenrollButton.isVisible({timeout: 1000});
                if (isVisible) {
                    console.log('User is enrolled (Unenroll button found)');
                    return true;
                }
            }

            // Check for enrollment status text
            for (const selector of this.enrollmentStatusSelectors) {
                const statusElement = this.page.locator(selector);
                const isVisible = await statusElement.isVisible({timeout: 1000});
                if (isVisible) {
                    const text = await statusElement.textContent();
                    if (text && (text.includes('enrolled') || text.includes('active'))) {
                        console.log('User is enrolled (status text indicates enrollment)');
                        return true;
                    }
                }
            }

            console.log('User is not enrolled in this course');
            return false;
        } catch (error) {
            console.error('Error checking enrollment status:', error);
            return false;
        }
    }

    /**
     * Enroll in the course
     */
    async enrollInCourse(): Promise<boolean> {
        try {
            // Check if already enrolled
            const alreadyEnrolled = await this.isEnrolled();
            if (alreadyEnrolled) {
                console.log('Already enrolled in this course');
                return true;
            }

            // Find and click the enroll button
            for (const selector of this.enrollButtonSelectors) {
                const enrollButton = this.page.locator(selector);
                const isVisible = await enrollButton.isVisible({timeout: 1000});
                if (isVisible) {
                    await enrollButton.click();
                    console.log('Clicked enroll button');
                    await this.waitForPageLoad();

                    // Verify enrollment was successful
                    const nowEnrolled = await this.isEnrolled();
                    return nowEnrolled;
                }
            }

            console.warn('Enroll button not found');
            await this.takeScreenshot('enroll-button-not-found');
            return false;
        } catch (error) {
            console.error('Error enrolling in course:', error);
            return false;
        }
    }

    /**
     * Unenroll from the course
     */
    async unenrollFromCourse(): Promise<boolean> {
        try {
            // Check if enrolled (can't unenroll if not enrolled)
            const isEnrolled = await this.isEnrolled();
            if (!isEnrolled) {
                console.log('Not enrolled in this course, cannot unenroll');
                return false;
            }

            // Find and click the unenroll button
            for (const selector of this.unenrollButtonSelectors) {
                const unenrollButton = this.page.locator(selector);
                const isVisible = await unenrollButton.isVisible({timeout: 1000});
                if (isVisible) {
                    await unenrollButton.click();
                    console.log('Clicked unenroll button');

                    // Wait for confirmation dialog
                    const dialogVisible = await this.page.locator('.MuiDialog-root, [role="dialog"]').isVisible({timeout: 3000});
                    if (!dialogVisible) {
                        console.warn('Unenroll confirmation dialog not displayed');
                        return false;
                    }

                    // Find and click the confirmation button
                    for (const selector of this.confirmUnenrollButtonSelectors) {
                        const confirmButton = this.page.locator(selector);
                        const isConfirmVisible = await confirmButton.isVisible({timeout: 1000});
                        if (isConfirmVisible) {
                            await confirmButton.click();
                            console.log('Confirmed unenrollment');
                            await this.waitForPageLoad();

                            // Verify unenrollment was successful (should no longer be enrolled)
                            const stillEnrolled = await this.isEnrolled();
                            return !stillEnrolled;
                        }
                    }

                    console.warn('Confirm unenroll button not found');
                    return false;
                }
            }

            console.warn('Unenroll button not found');
            await this.takeScreenshot('unenroll-button-not-found');
            return false;
        } catch (error) {
            console.error('Error unenrolling from course:', error);
            return false;
        }
    }

    /**
     * Cancel an unenrollment attempt
     */
    async cancelUnenrollment(): Promise<boolean> {
        try {
            // First, click the unenroll button
            for (const selector of this.unenrollButtonSelectors) {
                const unenrollButton = this.page.locator(selector);
                const isVisible = await unenrollButton.isVisible({timeout: 1000});
                if (isVisible) {
                    await unenrollButton.click();
                    console.log('Clicked unenroll button');

                    // Wait for confirmation dialog
                    const dialogVisible = await this.page.locator('.MuiDialog-root, [role="dialog"]').isVisible({timeout: 3000});
                    if (!dialogVisible) {
                        console.warn('Unenroll confirmation dialog not displayed');
                        return false;
                    }

                    // Find and click the cancel button
                    for (const selector of this.cancelUnenrollButtonSelectors) {
                        const cancelButton = this.page.locator(selector);
                        const isCancelVisible = await cancelButton.isVisible({timeout: 1000});
                        if (isCancelVisible) {
                            await cancelButton.click();
                            console.log('Canceled unenrollment');

                            // Wait for dialog to disappear
                            await this.page.waitForSelector('.MuiDialog-root, [role="dialog"]', {state: 'hidden', timeout: 3000})
                                .catch(e => console.log('Dialog might still be visible:', e));

                            // Should still be enrolled
                            const stillEnrolled = await this.isEnrolled();
                            return stillEnrolled;
                        }
                    }

                    console.warn('Cancel button not found in dialog');
                    return false;
                }
            }

            console.warn('Unenroll button not found');
            return false;
        } catch (error) {
            console.error('Error canceling unenrollment:', error);
            return false;
        }
    }

    /**
     * Check enrollment status text
     */
    async getEnrollmentStatusText(): Promise<string> {
        for (const selector of this.enrollmentStatusSelectors) {
            const statusElement = this.page.locator(selector);
            const isVisible = await statusElement.isVisible({timeout: 1000});
            if (isVisible) {
                const text = await statusElement.textContent();
                return text ? text.trim() : '';
            }
        }
        return '';
    }

    /**
     * Navigate to course tasks (only available if enrolled)
     */
    async navigateToCourseTasks(): Promise<boolean> {
        try {
            for (const selector of this.viewTasksButtonSelectors) {
                const viewTasksButton = this.page.locator(selector);
                const isVisible = await viewTasksButton.isVisible({timeout: 1000});
                if (isVisible) {
                    await viewTasksButton.click();
                    console.log('Clicked View Course Tasks button');
                    await this.waitForPageLoad();
                    return true;
                }
            }

            console.warn('View Tasks button not found');
            return false;
        } catch (error) {
            console.error('Error navigating to course tasks:', error);
            return false;
        }
    }
}
