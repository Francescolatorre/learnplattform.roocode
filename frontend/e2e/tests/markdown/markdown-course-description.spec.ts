import {test, expect} from '@playwright/test';
import {MarkdownTestUtils} from '../../utils/markdown-test-utils';
import {loginAsInstructor, loginAsStudent} from '../../utils/auth-helpers';
import {TEST_USERS} from '../../setupTests';
import {
    LoginPage,
    InstructorDashboardPage,
    CourseCreationPage,
    InstructorCoursesPage,
    StudentCoursesPage
} from '../../page-objects';
import {CourseMarkdownEditorPage} from '../../page-objects/CourseMarkdownEditorPage';

test.describe('Course Description Markdown Rendering', () => {
    test('instructor can create a course with markdown description', async ({page}) => {
        // Login as instructor using the LoginPage page object
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo();
        await loginPage.login(
            TEST_USERS.lead_instructor.username,
            TEST_USERS.lead_instructor.password
        );

        // Navigate to instructor dashboard then to course creation
        const instructorDashboard = new InstructorDashboardPage(page);
        await instructorDashboard.waitForPageLoad();

        // Navigate to course creation page
        const coursesPage = new InstructorCoursesPage(page);
        await instructorDashboard.navigateToInstructorCourses();
        await coursesPage.waitForPageLoad();
        await coursesPage.navigateToCreateCourse();

        // Use CourseCreationPage to interact with the form
        const courseCreationPage = new CourseCreationPage(page);
        await courseCreationPage.waitForPageLoad();
        await courseCreationPage.fillTitle('Test Markdown Course');

        // Use CourseMarkdownEditorPage to interact with the markdown editor
        const markdownEditor = new CourseMarkdownEditorPage(page);
        const markdownContent = MarkdownTestUtils.getTestMarkdownContent();
        await markdownEditor.enterMarkdown(markdownContent);

        // Check preview tab works using the markdown editor page object
        await markdownEditor.switchToPreview();

        // Verify markdown is rendered correctly in the preview
        await MarkdownTestUtils.verifyMarkdownRendering(
            page,
            '.markdown-editor-preview',
            {
                headers: true,
                paragraphs: true,
                lists: true,
                codeBlocks: true,
                links: true,
                emphasis: true
            }
        );

        // Switch back to write tab to continue
        // await markdownEditor.switchToEdit(); // Method not present on CourseMarkdownEditorPage

        // Submit the form using the page object
        await courseCreationPage.submitForm();

        // Verify success message and URL
        await expect(page.getByText('Course created successfully')).toBeVisible();
        await expect(page).toHaveURL(/\/instructor\/courses\/\d+/);

        // Verify markdown is rendered on the course page
        await MarkdownTestUtils.verifyMarkdownRendering(
            page,
            '.course-description-container',
            {
                headers: true,
                paragraphs: true,
                lists: true,
                codeBlocks: true,
                links: true,
                emphasis: true
            }
        );
    });

    test('course list shows markdown preview correctly', async ({page}) => {
        // Login as instructor using the LoginPage page object
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo();
        await loginPage.login(
            TEST_USERS.lead_instructor.username,
            TEST_USERS.lead_instructor.password
        );

        // Navigate to courses list using page objects
        const instructorDashboard = new InstructorDashboardPage(page);
        await instructorDashboard.waitForPageLoad();
        await instructorDashboard.navigateToInstructorCourses();

        // Use the CoursesPage page object
        const coursesPage = new InstructorCoursesPage(page);
        await coursesPage.waitForPageLoad();

        // Check for markdown elements in course cards
        const markdownResult = await coursesPage.checkForMarkdownInCards();
        expect(markdownResult.hasMarkdownElements).toBeTruthy();

        // Find the test course we created
        const hasCourse = await coursesPage.hasCourse('Test Markdown Course');
        expect(hasCourse).toBeTruthy();

        // Verify no images in cards (as they should be hidden in list view)
        expect(markdownResult.elementCounts['images'] || 0).toBe(0);
    });

    test('student can view course with markdown description', async ({page}) => {
        // Login as student using the LoginPage page object
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo();
        await loginPage.login(
            TEST_USERS.student.username,
            TEST_USERS.student.password
        );

        // Navigate to courses page using page objects
        const studentCoursesPage = new StudentCoursesPage(page);
        await studentCoursesPage.navigateTo();
        await studentCoursesPage.waitForPageLoad();

        // Find and click on the test course
        await studentCoursesPage.clickCourse('Test Markdown Course');

        // Verify markdown is rendered correctly
        await MarkdownTestUtils.verifyMarkdownRendering(
            page,
            '.course-description',
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
        await MarkdownTestUtils.verifySanitization(page, '.course-description');
    });
});
