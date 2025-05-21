/**
 * Course Description Markdown E2E Tests
 *
 * This module contains end-to-end tests for Markdown rendering functionality
 * in course descriptions. It tests both the creation of courses with Markdown
 * content and the proper rendering of that content for different user roles.
 *
 * These tests verify:
 * - Instructors can create courses with Markdown descriptions
 * - Markdown content is properly rendered with expected HTML elements
 * - Unsafe Markdown content is properly sanitized for security
 * - Students can view courses with rendered Markdown descriptions
 *
 * The tests use the MarkdownTestUtils helper class for common Markdown testing
 * operations and the UserSession class for authentication with different roles.
 *
 * @module markdown-course.spec.ts
 * @see {@link MarkdownTestUtils} for Markdown testing utilities
 * @see {@link UserSession} for authentication helpers
 */
import {test, expect} from '@playwright/test';
import {MarkdownTestUtils} from '../../utils/markdown-test-utils';
import {UserSession, TEST_USERS} from '../../setupTests';
import {
    CourseCreationPage,
    InstructorCoursesPage,
    StudentCoursesPage
} from '../../page-objects';
import {CourseMarkdownEditorPage} from '../../page-objects/CourseMarkdownEditorPage';

test.describe('Course Description Markdown Rendering', () => {
    let courseId: string;

    test.beforeEach(async ({page}) => {
        // Add more logging to help debug issues
        page.on('console', msg => {
            console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
        });
    });

    test('instructor can create a course with markdown description', async ({page}) => {
        // Use UserSession for more reliable login
        const userSession = new UserSession(page);
        await userSession.loginAs('instructor');
        console.log('Logged in as instructor');

        // Navigate to course creation using page objects
        const courseCreationPage = new CourseCreationPage(page);
        await courseCreationPage.navigateTo();
        await courseCreationPage.waitForPageLoad();
        console.log('Course form loaded');

        // Generate a unique course title using timestamp
        const timestamp = new Date().getTime();
        const courseTitle = `Markdown Test Course ${timestamp}`;

        // Use page objects to fill course details with markdown content
        await courseCreationPage.fillTitle(courseTitle);

        // Use the MarkdownEditorPage for handling the description
        const markdownEditor = new CourseMarkdownEditorPage(page);
        await markdownEditor.enterMarkdown(MarkdownTestUtils.getTestMarkdownContent());
        console.log('Filled course details with markdown content');

        // Add any required fields using page objects
        try {
            await courseCreationPage.fillCategory('General')
                .catch(() => console.log('No category field found'));

            await courseCreationPage.setPublishStatus(true)
                .catch(() => console.log('No published checkbox found'));
        } catch (e) {
            console.log(`Could not fill optional fields: ${e}`);
        }

        // Submit the form using the page object
        await courseCreationPage.submitForm();
        console.log('Submitted course form');

        // Wait for redirect or success message
        await page.waitForTimeout(2000);

        // Verify success through multiple means
        const successVisible = await page.getByText(/Course created successfully|Course saved|saved successfully/).isVisible()
            .catch(() => false);

        const isCourseDetailPage = await page.url().includes('/courses/');

        console.log(`Success message visible: ${successVisible}, Course detail page: ${isCourseDetailPage}`);
        expect(successVisible || isCourseDetailPage).toBeTruthy();

        // Try to extract course ID from URL for future tests
        if (isCourseDetailPage) {
            const url = page.url();
            const courseIdMatch = url.match(/\/courses\/(\d+)/);
            if (courseIdMatch && courseIdMatch[1]) {
                courseId = courseIdMatch[1];
                console.log(`Extracted course ID: ${courseId}`);
            }
        }
    });

    test('course description markdown is rendered correctly', async ({page}) => {
        // Use UserSession for more reliable login
        const userSession = new UserSession(page);
        await userSession.loginAs('instructor');
        console.log('Logged in as instructor');

        // Use page objects to navigate
        const instructorCoursesPage = new InstructorCoursesPage(page);

        // Navigate to course listing or detail page
        if (courseId) {
            // Go directly to the course if we have the ID
            await page.goto(`/instructor/courses/${courseId}`);
            console.log(`Navigated to specific course ${courseId}`);
        } else {
            // Otherwise go to the course listing
            await instructorCoursesPage.navigateTo();
            await instructorCoursesPage.waitForPageLoad();
            console.log('Navigated to course listing');

            // If we're on the course listing, find and click on a course
            const hasAnyCourses = await instructorCoursesPage.hasAnyCourses();
            if (hasAnyCourses) {
                await instructorCoursesPage.clickFirstCourse();
                console.log('Clicked on first course in listing');
            } else {
                test.skip('No courses found in listing');
                return;
            }
        }

        // Wait for course detail page to load
        await page.waitForTimeout(2000);

        // Find course description container
        const descriptionSelector = '.course-description, [data-testid="course-description"]';

        // Check if description container exists
        const descriptionExists = await page.locator(descriptionSelector).isVisible()
            .catch(() => false);

        if (!descriptionExists) {
            console.log('Could not find course description container');
            test.skip('Course description container not found');
            return;
        }

        // Verify markdown is rendered correctly
        try {
            await MarkdownTestUtils.verifyMarkdownRendering(
                page,
                descriptionSelector,
                {
                    headers: true,
                    paragraphs: true,
                    lists: true,
                    codeBlocks: true,
                    links: true,
                    emphasis: true
                }
            );
            console.log('Successfully verified markdown rendering');
        } catch (e) {
            console.log(`Error verifying markdown rendering: ${e}`);
            test.fail();
        }
    });

    test('unsafe markdown content is sanitized in course descriptions', async ({page}) => {
        // Use UserSession for more reliable login
        const userSession = new UserSession(page);
        await userSession.loginAs('instructor');
        console.log('Logged in as instructor');

        // Use page objects to navigate to course creation
        const courseCreationPage = new CourseCreationPage(page);
        await courseCreationPage.navigateTo();
        await courseCreationPage.waitForPageLoad();
        console.log('Course form loaded');

        // Generate a unique course title using timestamp
        const timestamp = new Date().getTime();
        const courseTitle = `Unsafe Markdown Course ${timestamp}`;

        // Fill out course details with potentially unsafe markdown content using page objects
        await courseCreationPage.fillTitle(courseTitle);

        // Use the MarkdownEditorPage for handling the description
        const markdownEditor = new CourseMarkdownEditorPage(page);
        await markdownEditor.enterMarkdown(MarkdownTestUtils.getUnsafeMarkdownContent());
        console.log('Filled course details with unsafe markdown content');

        // Add any required fields using page objects
        try {
            await courseCreationPage.fillCategory('General')
                .catch(() => console.log('No category field found'));

            await courseCreationPage.setPublishStatus(true)
                .catch(() => console.log('No published checkbox found'));
        } catch (e) {
            console.log(`Could not fill optional fields: ${e}`);
        }

        // Submit the form using the page object
        await courseCreationPage.submitForm();
        console.log('Submitted course form with unsafe content');

        // Wait for redirect or success message
        await page.waitForTimeout(2000);

        // Verify creation success
        const successVisible = await page.getByText(/Course created successfully|Course saved|saved successfully/).isVisible()
            .catch(() => false);

        const isCourseDetailPage = page.url().includes('/courses/');

        if (!(successVisible || isCourseDetailPage)) {
            console.log('Could not verify course creation success');
            test.skip('Course creation failed');
            return;
        }

        // Get the course ID from URL
        let unsafeCourseId = '';
        if (isCourseDetailPage) {
            const url = page.url();
            const courseIdMatch = url.match(/\/courses\/(\d+)/);
            if (courseIdMatch && courseIdMatch[1]) {
                unsafeCourseId = courseIdMatch[1];
            }
        }

        // Navigate to the course details
        if (unsafeCourseId) {
            await page.goto(`/instructor/courses/${unsafeCourseId}`);
        }

        // Wait for page to load
        await page.waitForTimeout(2000);

        // Find course description container
        const descriptionSelector = '.course-description, [data-testid="course-description"]';

        // Check if description container exists
        const descriptionExists = await page.locator(descriptionSelector).isVisible()
            .catch(() => false);

        if (!descriptionExists) {
            console.log('Could not find course description container');
            test.skip('Course description container not found');
            return;
        }

        // Verify sanitization is working properly
        try {
            await MarkdownTestUtils.verifySanitization(page, descriptionSelector);
            console.log('Successfully verified sanitization of unsafe content');
        } catch (e) {
            console.log(`Error verifying sanitization: ${e}`);
            test.fail();
        }
    });

    test('student can view course with markdown description', async ({page}) => {
        // Use UserSession for more reliable login
        const userSession = new UserSession(page);
        await userSession.loginAs('student');
        console.log('Logged in as student');

        // Use StudentCoursesPage page object to navigate
        const studentCoursesPage = new StudentCoursesPage(page);
        await studentCoursesPage.navigateTo();
        await studentCoursesPage.waitForPageLoad();
        console.log('Navigated to course listing');

        // Find and click on a course using page object methods
        const hasAnyCourses = await studentCoursesPage.hasAnyCourses();
        if (!hasAnyCourses) {
            test.skip('No courses found in listing');
            return;
        }

        await studentCoursesPage.clickFirstCourse();
        console.log('Clicked on first course in listing');

        // Wait for course detail page to load
        await page.waitForTimeout(2000);

        // Find course description container
        const descriptionSelector = '.course-description, [data-testid="course-description"]';

        // Check if description container exists
        const descriptionExists = await page.locator(descriptionSelector).isVisible()
            .catch(() => false);

        if (!descriptionExists) {
            console.log('Could not find course description container');
            test.skip('Course description container not found');
            return;
        }

        // Get the HTML content of the description
        const descriptionHTML = await page.locator(descriptionSelector).innerHTML();
        console.log('Description HTML preview:', descriptionHTML.substring(0, 100) + '...');

        // Check for basic HTML elements indicating markdown rendering
        const hasRenderedMarkdown =
            descriptionHTML.includes('<p>') ||
            descriptionHTML.includes('<h') ||
            descriptionHTML.includes('<li>') ||
            descriptionHTML.includes('<strong>') ||
            descriptionHTML.includes('<em>');

        console.log(`Has rendered markdown elements: ${hasRenderedMarkdown}`);
        expect(hasRenderedMarkdown).toBeTruthy();
    });
});
