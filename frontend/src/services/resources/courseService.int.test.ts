import {describe, it, expect} from 'vitest';

import {CourseStatus} from 'src/types/common/entities';

import authService from '../auth/authService';

import courseService from './courseService';

const TEST_USERS = {
    student: {
        username: 'student',
        password: 'student123',
    },
};

describe('courseService Integration', () => {
    let accessToken: string;
    let userId: number;

    beforeAll(async () => {
        const loginData = await authService.login(TEST_USERS.student.username, TEST_USERS.student.password);
        accessToken = loginData.access;
        // Set Authorization header for all ApiService instances used by courseService
        courseService['apiCourse'].setAuthToken(accessToken);
        courseService['apiCourses'].setAuthToken(accessToken);
        courseService['apiVoid'].setAuthToken(accessToken);
        courseService['apiAny'].setAuthToken(accessToken);
        // Fetch user profile to get userId
        const userProfile = await authService.getUserProfile(accessToken);
        userId = userProfile.id;
    });

    it('fetchCourses returns paginated courses', async () => {
        const data = await courseService.fetchCourses();
        expect(data).toHaveProperty('results');
        expect(Array.isArray(data.results)).toBe(true);
    });

    let createdCourseId: number;

    it('createCourse creates a new course', async () => {
        const courseData = {
            title: 'Integration Test Course',
            description: 'Created by integration test',
            version: 1,
            status: 'published' as CourseStatus,
            visibility: 'public' as 'public',
            learning_objectives: 'Test objectives',
            prerequisites: 'None',
            creator: userId,
        };
        const created = await courseService.createCourse(courseData);
        expect(created).toHaveProperty('id');
        expect(created.title).toBe('Integration Test Course');
        createdCourseId = created.id;
    });

    it('getCourseDetails returns course details', async () => {
        const details = await courseService.getCourseDetails(String(createdCourseId));
        expect(details).toHaveProperty('id', createdCourseId);
        expect(details).toHaveProperty('title', 'Integration Test Course');
    });

    it('updateCourse updates the course title', async () => {
        const updated = await courseService.updateCourse(String(createdCourseId), {title: 'Updated Integration Test Course'});
        expect(updated).toHaveProperty('title', 'Updated Integration Test Course');
    });

    it('deleteCourse deletes the course', async () => {
        await courseService.deleteCourse(String(createdCourseId));
        // Optionally, try to fetch and expect an error
        try {
            await courseService.getCourseDetails(String(createdCourseId));
            expect(false).toBe(true); // Should not reach here
        } catch (error: any) {
            // Accept both "not found" and "status code 404" as valid not found errors
            expect(
                /not found/i.test(error.message) || /status code 404/i.test(error.message)
            ).toBe(true);
        }
    });
});
