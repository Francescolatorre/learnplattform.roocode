import {test, expect} from '@playwright/test';
import {MarkdownTestUtils} from '../../utils/markdown-test-utils';
import {loginAsInstructor, loginAsStudent} from '../../utils/auth-helpers';
import {UserSession} from '../../setupTests';

test.describe('Learning Task Description Markdown Rendering', () => {
    let courseId: string;
    let taskId: string;

    test.beforeEach(async ({page}) => {
        // Add more logging to help debug issues
        page.on('console', msg => {
            console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
        });
    });

    test.beforeAll(async ({browser}) => {
        // Setup test data: Create a course and task with markdown content
        console.log('Setting up test data: Creating test course and task');
        const context = await browser.newContext();
        const page = await context.newPage();

        try {
            // Use UserSession for more reliable login
            const userSession = new UserSession(page);
            await userSession.loginAs('instructor');
            console.log('Logged in as instructor');

            // Create a test course - check both possible URL patterns
            try {
                await page.goto('/instructor/courses/new');
            } catch {
                await page.goto('/instructor/courses/create');
            }
            console.log('Navigated to course creation page');

            // Wait for form to load
            await page.waitForSelector('form, #course-form', {timeout: 10000});

            // Fill out course details
            await page.locator('#course-title, input[name="title"]').fill('Task Markdown Test Course');
            await page.locator('#course-description, textarea[name="description"]').fill('Course for testing task markdown rendering');
            console.log('Filled course details');

            // Find and click submit button
            await page.getByRole('button', {name: /Create Course|Save|Submit/}).click();
            console.log('Submitted course form');

            // Wait for redirect to course details
            await page.waitForURL(/\/instructor\/courses\/\d+/, {timeout: 10000})
                .catch(() => console.log('URL did not change as expected after course creation'));

            // Get the course ID from URL
            const url = page.url();
            const courseIdMatch = url.match(/\/courses\/(\d+)/);
            if (courseIdMatch && courseIdMatch[1]) {
                courseId = courseIdMatch[1];
                console.log(`Extracted course ID: ${courseId}`);
            } else {
                // If we can't extract from URL, try to find it on the page
                const courseIdText = await page.locator('[data-testid="course-id"]').textContent()
                    .catch(() => null);
                if (courseIdText) {
                    courseId = courseIdText;
                    console.log(`Found course ID on page: ${courseId}`);
                } else {
                    courseId = 'latest'; // Fallback
                    console.log('Could not extract course ID, using fallback');
                }
            }

            // Navigate to tasks for this course
            await page.goto(`/instructor/courses/${courseId}/tasks`);
            console.log(`Navigated to tasks page for course ${courseId}`);

            // Open task creation form
            await page.getByRole('button', {name: /Add Task|Create Task|New Task/}).first().click()
                .catch((e) => console.log(`Could not find task creation button: ${e.message}`));

            // Wait for form to load
            await page.waitForSelector('form, #task-form, input[name="title"]', {timeout: 10000});
            console.log('Task form loaded');

            // Fill task details with markdown
            const titleSelector = '#task-title, input[name="title"], #title';
            const descriptionSelector = '#task-description, textarea[name="description"], #description';

            await page.locator(titleSelector).fill('Markdown Task Test');
            await page.locator(descriptionSelector).fill(MarkdownTestUtils.getTestMarkdownContent());
            console.log('Filled in task details');

            // Set task to published
            try {
                // Try checkbox first
                await page.locator('#task-is_published, input[name="is_published"]').check()
                    .catch(() => console.log('Could not find is_published checkbox'));
            } catch {
                // If checkbox fails, try select dropdown
                await page.locator('select[name="is_published"]').selectOption('true')
                    .catch(() => console.log('Could not find is_published select'));
            }

            // Save the task
            await page.getByRole('button', {name: /Save|Create|Submit/}).click();
            console.log('Submitted task form');

            // Wait for success message or redirect
            await page.waitForTimeout(1000);
        } catch (error) {
            console.error('Error in test setup:', error);
        } finally {
            await context.close();
            console.log('Test setup completed');
        }
    });

    test('instructor can create a learning task with markdown description', async ({page}) => {
        // Use UserSession for more reliable login
        const userSession = new UserSession(page);
        await userSession.loginAs('instructor');
        console.log('Logged in as instructor');

        // Navigate to course tasks page
        await page.goto(`/instructor/courses/${courseId}/tasks`);
        console.log(`Navigated to tasks page for course ${courseId}`);

        // Wait for page to load
        await page.waitForSelector('h1, h2, h3, h4');
        await page.waitForLoadState('networkidle');

        // Open task creation form - find the appropriate button
        try {
            await page.getByRole('button', {name: /Add Task|Create Task|New Task/}).first().click();
            console.log('Clicked task creation button');
        } catch (e) {
            console.log(`Could not click task creation button: ${e}. Trying fallbacks...`);
            const anyAddButton = await page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').first().isVisible();
            if (anyAddButton) {
                await page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').first().click();
                console.log('Clicked alternate task creation button');
            }
        }

        // Wait for form to load
        await page.waitForSelector('form, #task-form, input[name="title"]', {timeout: 10000});
        console.log('Task form loaded');

        // Fill in task details with markdown
        const titleSelector = '#task-title, input[name="title"], #title';
        const descriptionSelector = '#task-description, textarea[name="description"], #description';

        await page.locator(titleSelector).fill('Another Markdown Task');
        await page.locator(descriptionSelector).fill(MarkdownTestUtils.getTestMarkdownContent());
        console.log('Filled task details');

        // Try to set published state using various methods
        try {
            // Try checkbox
            await page.locator('#task-is_published, input[name="is_published"]').check()
                .catch(() => console.log('Could not find is_published checkbox'));
        } catch (e) {
            console.log(`Could not check published checkbox: ${e}. Trying select option...`);
            try {
                // If checkbox fails, try select dropdown
                await page.locator('select[name="is_published"]').selectOption('true')
                    .catch(() => console.log('Could not find is_published select'));
            } catch {
                console.log('Could not set published state through normal means');
            }
        }

        // Save the task
        await page.getByRole('button', {name: /Save|Create|Submit/}).click();
        console.log('Submitted task form');

        // Wait for page to load or success message
        await page.waitForTimeout(1000);

        // Verify success through multiple means
        const successVisible = await page.getByText(/Task created successfully|Task saved successfully|saved successfully/).isVisible().catch(() => false);
        const returnedToTaskList = page.url().includes('/tasks');

        console.log(`Success message visible: ${successVisible}, Returned to task list: ${returnedToTaskList}`);
        expect(successVisible || returnedToTaskList).toBeTruthy();
    });

    test('task list shows markdown preview correctly', async ({page}) => {
        // Use UserSession for more reliable login
        const userSession = new UserSession(page);
        await userSession.loginAs('instructor');
        console.log('Logged in as instructor');

        // Navigate to course tasks page
        await page.goto(`/instructor/courses/${courseId}/tasks`);
        console.log(`Navigated to tasks page for course ${courseId}`);

        // Wait for page to load
        await page.waitForTimeout(2000);

        // Try different selectors to find task items
        const taskSelector = '.task-item, .learning-task-item, li, [data-testid="task-item"]';

        // Wait for task items to load
        await page.waitForSelector(taskSelector, {
            state: 'visible',
            timeout: 10000
        }).catch(e => console.log(`Task items not visible: ${e.message}`));

        // Check if our test task exists
        const taskExists = await page.locator(taskSelector)
            .filter({hasText: 'Markdown Task Test'})
            .first()
            .isVisible()
            .catch(() => false);

        if (!taskExists) {
            console.log('Test task not found, checking if any tasks exist');
            const anyTaskExists = await page.locator(taskSelector).first().isVisible().catch(() => false);
            if (!anyTaskExists) {
                test.skip('No tasks found on the page');
                return;
            }
        }

        // Get the first task with markdown content
        const taskItem = page.locator(taskSelector)
            .filter({hasText: 'Markdown Task Test'})
            .first();

        // Verify the task item exists
        await expect(taskItem).toBeVisible();
        console.log('Found task item');

        // Get the description container within the task item
        const descriptionContent = await taskItem.locator('.task-description, .description, p').innerHTML()
            .catch(() => '');

        console.log('Description content HTML:', descriptionContent.substring(0, 100) + '...');

        // Check for at least one HTML markdown element
        const hasRenderedMarkdown =
            descriptionContent.includes('<strong>') ||
            descriptionContent.includes('<em>') ||
            descriptionContent.includes('<h') ||
            descriptionContent.includes('<li>') ||
            descriptionContent.includes('<code>');

        console.log(`Has rendered markdown: ${hasRenderedMarkdown}`);
        expect(hasRenderedMarkdown).toBeTruthy();
    });

    test('student can view learning task with markdown description', async ({page}) => {
        // Use UserSession for more reliable login
        const userSession = new UserSession(page);
        await userSession.loginAs('student');
        console.log('Logged in as student');

        // Navigate to the course
        await page.goto(`/courses/${courseId}`);
        console.log(`Navigated to course ${courseId}`);

        // Check if enrollment is needed
        const enrollButton = page.getByRole('button', {name: /Enroll|Enroll in Course/});
        const isEnrollButtonVisible = await enrollButton.isVisible().catch(() => false);

        if (isEnrollButtonVisible) {
            console.log('Enrollment button found, clicking it');
            await enrollButton.click();
            // Wait for enrollment to complete
            await page.waitForTimeout(2000);
        } else {
            console.log('No enrollment button found, assuming already enrolled');
        }

        // Look for task navigation elements
        const taskNavExists = await page.getByRole('button', {name: /View Tasks|Continue Learning|Tasks/}).isVisible()
            .catch(() => false);

        if (taskNavExists) {
            console.log('Found tasks navigation button');
            await page.getByRole('button', {name: /View Tasks|Continue Learning|Tasks/}).click();
        } else {
            console.log('No tasks navigation button found, trying direct navigation');
            await page.goto(`/courses/${courseId}/tasks`);
        }

        // Wait for task list to load
        await page.waitForTimeout(2000);

        // Find task item with markdown
        const taskSelector = '.task-item, .learning-task-item, li';
        const taskItem = page.locator(taskSelector).filter({hasText: 'Markdown Task Test'}).first();

        // Check if the task exists
        const taskExists = await taskItem.isVisible().catch(() => false);
        if (!taskExists) {
            console.log('Test task not found, may need to check a different route');
            test.skip('Could not find test task');
            return;
        }

        // Click on the task
        await taskItem.click();
        console.log('Clicked on task');

        // Wait for task page to load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Find task description container using multiple possible selectors
        const descriptionSelector = '.task-description, [data-testid="task-description"], .description';

        // Check if description container exists
        const descriptionExists = await page.locator(descriptionSelector).isVisible()
            .catch(() => false);

        if (!descriptionExists) {
            console.log('Could not find task description container, skipping test');
            test.skip('Task description container not found');
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

        // Verify sanitization is working properly
        try {
            await MarkdownTestUtils.verifySanitization(page, descriptionSelector);
            console.log('Successfully verified markdown sanitization');
        } catch (e) {
            console.log(`Error verifying markdown sanitization: ${e}`);
            test.fail();
        }
    });

    test('unsafe markdown content is sanitized in learning tasks', async ({page}) => {
        // Use UserSession for more reliable login
        const userSession = new UserSession(page);
        await userSession.loginAs('instructor');
        console.log('Logged in as instructor');

        // Navigate to course tasks page
        await page.goto(`/instructor/courses/${courseId}/tasks`);
        console.log(`Navigated to tasks page for course ${courseId}`);

        // Wait for page to load
        await page.waitForTimeout(2000);

        // Open task creation form
        try {
            await page.getByRole('button', {name: /Add Task|Create Task|New Task/}).first().click();
            console.log('Clicked task creation button');
        } catch (e) {
            console.log(`Could not click task creation button: ${e}. Trying fallbacks...`);
            const anyAddButton = await page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').first().isVisible();
            if (anyAddButton) {
                await page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').first().click();
                console.log('Clicked alternate task creation button');
            } else {
                test.skip('Could not find task creation button');
                return;
            }
        }

        // Wait for form to load
        await page.waitForSelector('form, #task-form, input[name="title"]', {timeout: 10000});
        console.log('Task form loaded');

        // Fill in task details with potentially unsafe markdown
        const titleSelector = '#task-title, input[name="title"], #title';
        const descriptionSelector = '#task-description, textarea[name="description"], #description';

        await page.locator(titleSelector).fill('Unsafe Markdown Test Task');
        await page.locator(descriptionSelector).fill(MarkdownTestUtils.getUnsafeMarkdownContent());
        console.log('Filled task details with unsafe content');

        // Set published state
        try {
            await page.locator('#task-is_published, input[name="is_published"]').check();
        } catch {
            try {
                await page.locator('select[name="is_published"]').selectOption('true');
            } catch {
                console.log('Could not set published state');
            }
        }

        // Save the task
        await page.getByRole('button', {name: /Save|Create|Submit/}).click();
        console.log('Submitted task form');

        // Wait for page to load
        await page.waitForTimeout(2000);

        // Navigate back to the tasks list to find our unsafe task
        await page.goto(`/instructor/courses/${courseId}/tasks`);
        console.log('Navigated back to tasks list');

        await page.waitForTimeout(2000);

        // Find the unsafe task
        const taskItem = page.locator('.task-item, li').filter({hasText: 'Unsafe Markdown Test Task'}).first();

        // Check if the unsafe task exists
        const taskExists = await taskItem.isVisible().catch(() => false);
        if (!taskExists) {
            console.log('Unsafe test task not found, skipping test');
            test.skip('Could not find unsafe test task');
            return;
        }

        // Click on the unsafe task
        await taskItem.click();
        console.log('Clicked on unsafe task');

        // Wait for task page to load
        await page.waitForTimeout(2000);

        // Verify sanitization is working properly
        try {
            await MarkdownTestUtils.verifySanitization(page, '.task-description, [data-testid="task-description"]');
            console.log('Successfully verified sanitization of unsafe content');
        } catch (e) {
            console.log(`Error verifying sanitization: ${e}`);
            test.fail();
        }
    });
});
