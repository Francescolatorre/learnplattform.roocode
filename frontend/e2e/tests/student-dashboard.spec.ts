import {test, expect} from '@playwright/test';
import {LoginPage} from '../page-objects/LoginPage';
import {StudentDashboardPage} from '../page-objects/DashboardPage';
import {TEST_USERS, takeScreenshot, UserSession} from '../setupTests';

test.describe('Student Dashboard', () => {
    let dashboardPage: StudentDashboardPage;

    test.beforeAll(async ({request}) => {
        // Use TEST_USERS for credentials
        const {lead_instructor, student} = TEST_USERS;

        // 1. Login as instructor to get JWT
        const loginResp = await request.post('http://localhost:8000/auth/login/', {
            data: {
                username: lead_instructor.username,
                password: lead_instructor.password
            }
        });
        if (!loginResp.ok()) {
            const text = await loginResp.text();
            console.error('Login failed:', text);
            throw new Error(`Failed to login as instructor: ${loginResp.status()} ${text}`);
        }
        const loginData = await loginResp.json();
        const token = loginData.access || loginData.token || loginData.access_token;
        if (!token) throw new Error('Failed to get instructor JWT for seeding test data');

        // 2. Get the student user ID from the backend
        const userResp = await request.get(`http://localhost:8000/api/v1/users/?username=${encodeURIComponent(student.username)}`, {
            headers: {Authorization: `Bearer ${token}`}
        });
        if (!userResp.ok()) {
            const text = await userResp.text();
            console.error('User fetch failed:', text);
            throw new Error(`Failed to fetch student user: ${userResp.status()} ${text}`);
        }
        const userList = await userResp.json();
        const studentUser = Array.isArray(userList) ? userList[0] : (userList.results ? userList.results[0] : null);
        if (!studentUser || !studentUser.id) throw new Error('Failed to fetch student user ID from backend');
        const studentId = studentUser.id;

        // 3. Create a course
        const courseResp = await request.post('http://localhost:8000/api/v1/courses/', {
            headers: {Authorization: `Bearer ${token}`},
            data: {
                title: 'E2E Test Course',
                description: 'Course for E2E dashboard test',
                status: 'published',
                visibility: 'public',
                creator: studentUser.id // Use the instructor's user ID if available
            }
        });
        if (!courseResp.ok()) {
            const text = await courseResp.text();
            console.error('Course creation failed:', text);
            throw new Error(`Failed to create test course: ${courseResp.status()} ${text}`);
        }
        const courseData = await courseResp.json();
        const courseId = courseData.id;
        if (!courseId) throw new Error('Failed to create test course');

        // 4. Enroll the student in the course
        const enrollResp = await request.post('http://localhost:8000/api/enrollments/', {
            headers: {Authorization: `Bearer ${token}`},
            data: {
                user: studentId,
                course: courseId,
                status: 'active'
            }
        });
        if (enrollResp.status() !== 201 && enrollResp.status() !== 200) {
            const text = await enrollResp.text();
            console.error('Enrollment failed:', text);
            throw new Error('Failed to enroll student in test course');
        }
    });

    test.beforeEach(async ({page}) => {
        // Login as student
        const userSession = new UserSession(page);
        await userSession.loginAs('student');

        // Initialize dashboard page object
        dashboardPage = new StudentDashboardPage(page);
        await dashboardPage.waitForPageLoad();
    });

    test('displays dashboard components correctly', async ({page}) => {
        // Check presence of key dashboard elements
        await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
        await expect(page.locator('[data-testid="learning-overview"]')).toBeVisible();

        // Verify enrolled courses section exists
        const hasEnrolledCourses = await dashboardPage.hasEnrolledCourses();
        expect(hasEnrolledCourses).toBeTruthy();

        // Verify progress section exists
        const hasProgressSection = await dashboardPage.hasProgressSection();
        expect(hasProgressSection).toBeTruthy();

        // Take a screenshot for visual verification
        await takeScreenshot(page, 'student-dashboard-components');
    });

    test('shows course progress correctly', async ({page}) => {
        // Get enrolled courses
        const enrolledCourses = await dashboardPage.getEnrolledCourses();
        expect(enrolledCourses.length).toBeGreaterThan(0);

        // Verify progress indicators exist for each course
        for (const courseElement of await page.locator('.course-card').all()) {
            const progressBar = courseElement.locator('.MuiLinearProgress-root');
            await expect(progressBar).toBeVisible();

            // Verify progress percentage is within valid range
            const progressText = await courseElement.locator('[data-testid="course-progress"]').textContent();
            const percentage = parseFloat(progressText?.replace('%', '') || '0');
            expect(percentage).toBeGreaterThanOrEqual(0);
            expect(percentage).toBeLessThanOrEqual(100);
        }
    });

    test('displays correct statistics', async ({page}) => {
        // Check overall statistics
        const stats = await page.locator('[data-testid="dashboard-summary"] .MuiCard-root').all();
        expect(stats.length).toBeGreaterThan(0);

        // Verify statistics values are numbers
        for (const stat of stats) {
            const value = await stat.locator('h3, h4').textContent();
            expect(Number.isNaN(parseInt(value || '0', 10))).toBeFalsy();
        }
    });

    test('navigation to courses works', async ({page}) => {
        // Click on a course card
        const courseCards = page.locator('.course-card');
        const firstCard = courseCards.first();

        if (await firstCard.isVisible()) {
            await firstCard.click();

            // Verify navigation to course detail page
            await expect(page).toHaveURL(/\/courses\/\d+/);

            // Verify course detail page loads
            await expect(page.locator('[data-testid="course-title"]')).toBeVisible();
        }
    });

    test.afterAll(async ({request}) => {
        // Cleanup: Delete the test course and enrollment
        const {lead_instructor} = TEST_USERS;

        // 1. Login as instructor to get JWT
        const loginResp = await request.post('http://localhost:8000/auth/login/', {
            data: {
                username: lead_instructor.username,
                password: lead_instructor.password
            }
        });
        const loginData = await loginResp.json();
        const token = loginData.access || loginData.token || loginData.access_token;
        if (!token) throw new Error('Failed to get instructor JWT for cleanup');

        // 2. Delete the test course
        const courseId = 'E2E Test Course'; // Replace with actual course ID if needed
        await request.delete(`http://localhost:8000/api/v1/courses/${courseId}/`, {
            headers: {Authorization: `Bearer ${token}`}
        });
    });
});
