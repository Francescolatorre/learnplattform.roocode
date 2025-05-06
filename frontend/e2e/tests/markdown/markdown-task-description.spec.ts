import {test, expect} from '@playwright/test';
import {MarkdownTestUtils} from '../../utils/markdown-test-utils';
import {loginAsInstructor, loginAsStudent} from '../../utils/auth-helpers';
import {TEST_USERS} from '../../setupTests';
import {
    LoginPage,
    InstructorDashboardPage,
    CourseCreationPage,
    MarkdownEditorPage,
    InstructorCoursesPage
} from '../../page-objects';

test.describe('Learning Task Description Markdown Rendering', () => {
    let courseId: string;
    let taskId: string;

    test.beforeAll(async ({browser}) => {
        // Setup test data: Create a course and task with markdown content
        const context = await browser.newContext();
        const page = await context.newPage();

        // Login as instructor using page object
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo();
        await loginPage.login(
            TEST_USERS.lead_instructor.username,
            TEST_USERS.lead_instructor.password
        );

        // Create a test course using page objects
        const instructorDashboard = new InstructorDashboardPage(page);
        await instructorDashboard.waitForPageLoad();
        await instructorDashboard.navigateToInstructorCourses();

        const coursesPage = new InstructorCoursesPage(page);
        await coursesPage.waitForPageLoad();
        await coursesPage.navigateToCreateCourse();

        const courseCreationPage = new CourseCreationPage(page);
        await courseCreationPage.waitForPageLoad();
        await courseCreationPage.fillTitle('Task Markdown Test Course');
        await courseCreationPage.fillDescription('Course for testing task markdown rendering');
        await courseCreationPage.submitForm();

        // Get the course ID from URL
        const url = page.url();
        courseId = url.split('/').pop() || '';

        // Create a test task with markdown
        // Note: We don't have a TaskCreationPage page object yet, so using direct selectors
        await page.goto(`/instructor/courses/${courseId}/tasks/create`);
        await page.locator('#task-title').fill('Markdown Task Test');

        // Use MarkdownEditorPage for the description
        const markdownEditor = new MarkdownEditorPage(page);
        await markdownEditor.enterMarkdown(MarkdownTestUtils.getTestMarkdownContent());

        await page.locator('#task-is_published').check();
        await page.getByRole('button', {name: 'Save'}).click();

        // Get task ID from the redirect URL
        const taskUrl = page.url();
        taskId = taskUrl.split('/').pop() || '';

        await context.close();
    });

    test('instructor can create a learning task with markdown description', async ({page}) => {
        // Login as instructor using page object
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo();
        await loginPage.login(
            TEST_USERS.lead_instructor.username,
            TEST_USERS.lead_instructor.password
        );

        // Navigate to course tasks page
        await page.goto(`/instructor/courses/${courseId}/tasks`);

        // Open task creation form
        await page.getByRole('button', {name: 'Add Task'}).click();

        // Fill in task details with markdown using the markdown editor page object
        await page.locator('#title').fill('Another Markdown Task');

        const markdownEditor = new MarkdownEditorPage(page);
        await markdownEditor.enterMarkdown(MarkdownTestUtils.getTestMarkdownContent());

        // Check preview tab using the page object
        await markdownEditor.switchToPreview();

        // Verify markdown is rendered correctly in the preview
        await MarkdownTestUtils.verifyMarkdownRendering(
            page,
            '.markdown-preview',
            {
                headers: true,
                paragraphs: true,
                lists: true,
                codeBlocks: true,
                links: true,
                emphasis: true
            }
        );

        // Switch back and save using the page object
        await markdownEditor.switchToEdit();
        await page.locator('select[name="is_published"]').selectOption('true');
        await page.getByRole('button', {name: 'Save'}).click();

        // Verify success message
        await expect(page.getByText('Task created successfully')).toBeVisible();
    });

    test('task list shows markdown preview correctly', async ({page}) => {
        // Login as instructor using page object
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo();
        await loginPage.login(
            TEST_USERS.lead_instructor.username,
            TEST_USERS.lead_instructor.password
        );

        // Navigate to course tasks page
        await page.goto(`/instructor/courses/${courseId}/tasks`);

        // Find the task item
        const taskItem = page.locator('.task-item').filter({hasText: 'Markdown Task Test'});

        // Verify the description shows rendered markdown
        const renderedContent = taskItem.locator('.task-description');
        await expect(renderedContent.locator('h1, h2, strong, em, code, li')).toHaveCount({min: 1});
    });

    test('student can view learning task with markdown description', async ({page}) => {
        // Login as student using page object
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo();
        await loginPage.login(
            TEST_USERS.student.username,
            TEST_USERS.student.password
        );

        // Navigate to the course
        await page.goto(`/courses/${courseId}`);

        // Enroll if not already enrolled
        const enrollButton = page.getByRole('button', {name: 'Enroll in Course'});
        if (await enrollButton.isVisible()) {
            await enrollButton.click();
            await expect(page.getByText('Enrolled successfully')).toBeVisible();
        }

        // Click on the task
        await page.locator('.task-item').filter({hasText: 'Markdown Task Test'}).click();

        // Verify markdown is rendered correctly
        await MarkdownTestUtils.verifyMarkdownRendering(
            page,
            '.task-description',
            {
                headers: true,
                paragraphs: true,
                lists: true,
                codeBlocks: true,
                links: true,
                emphasis: true
            }
        );

        // Verify sanitization is working properly
        await MarkdownTestUtils.verifySanitization(page, '.task-description');
    });

    test('unsafe markdown content is sanitized', async ({page}) => {
        // Login as instructor using page object
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo();
        await loginPage.login(
            TEST_USERS.lead_instructor.username,
            TEST_USERS.lead_instructor.password
        );

        // Navigate to course tasks page
        await page.goto(`/instructor/courses/${courseId}/tasks`);

        // Open task creation form
        await page.getByRole('button', {name: 'Add Task'}).click();

        // Fill in task details with potentially unsafe markdown using the markdown editor
        await page.locator('#title').fill('Unsafe Markdown Test');

        const markdownEditor = new MarkdownEditorPage(page);
        await markdownEditor.enterMarkdown(MarkdownTestUtils.getUnsafeMarkdownContent());

        // Save the task
        await page.locator('select[name="is_published"]').selectOption('true');
        await page.getByRole('button', {name: 'Save'}).click();

        // View the task
        await page.locator('.task-item').filter({hasText: 'Unsafe Markdown Test'}).click();

        // Verify sanitization is working properly
        await MarkdownTestUtils.verifySanitization(page, '.task-description');
    });
});
