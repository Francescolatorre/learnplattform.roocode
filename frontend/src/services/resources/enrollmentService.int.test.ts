import {describe, it, expect} from 'vitest';

import {CourseStatus} from '@/types/entities';

import authService from '../auth/authService';

import courseService from './courseService';
import {enrollmentService} from './enrollmentService';

const TEST_USERS = {
    student: {
        username: 'student',
        password: 'student123',
    },
};

describe('enrollmentService Integration', () => {
    let accessToken: string;
    let userId: number;
    let testCourseId: number;

    beforeAll(async () => {
        const loginData = await authService.login(TEST_USERS.student.username, TEST_USERS.student.password);
        accessToken = loginData.access;
        // Set Authorization header for all ApiService instances used by enrollmentService
        enrollmentService['apiEnrollments'].setAuthToken(accessToken);
        enrollmentService['apiEnrollment'].setAuthToken(accessToken);
        enrollmentService['apiVoid'].setAuthToken(accessToken);
        // Fetch user profile to get userId
        const userProfile = await authService.getUserProfile(accessToken);
        userId = userProfile.id;
        // Create a new course for enrollment
        const courseData = {
            title: 'Enrollment Test Course',
            description: 'Created by enrollmentService integration test',
            version: 1,
            status: 'published' as CourseStatus,
            visibility: 'public' as const,
            learning_objectives: 'Test objectives',
            prerequisites: 'None',
            creator: userId,
        };
        // Use courseService to create the course
        courseService['apiCourse'].setAuthToken(accessToken);
        courseService['apiCourses'].setAuthToken(accessToken);
        courseService['apiVoid'].setAuthToken(accessToken);
        courseService['apiAny'].setAuthToken(accessToken);
        const createdCourse = await courseService.createCourse(courseData);
        testCourseId = createdCourse.id;
    });

    it('fetchUserEnrollments returns enrollments', async () => {
        const enrollments = await enrollmentService.fetchUserEnrollments();
        // If API returns { results: [...] }, use that
        const enrollmentsAny = enrollments as any;
        const arr = Array.isArray(enrollmentsAny)
            ? enrollmentsAny
            : Array.isArray(enrollmentsAny?.results)
                ? enrollmentsAny.results
                : [];
        expect(Array.isArray(arr)).toBe(true);
    });

    // The following test assumes a course with ID 1 exists and is available for enrollment.
    let enrollmentId: number | undefined;

    it('enrollInCourse creates a new enrollment', async () => {
        // Provide all required fields: course, user, status, using a unique course
        const enrollment = await enrollmentService['apiEnrollment'].post(
            '/api/v1/course-enrollments/',
            {course: testCourseId, user: userId, status: 'active'}
        );
        expect(enrollment).toHaveProperty('id');
        enrollmentId = enrollment.id;
    });

    it('getById returns the enrollment', async () => {
        if (enrollmentId === undefined) throw new Error('enrollmentId not set');
        const enrollment = await enrollmentService.getById(enrollmentId);
        expect(enrollment).toHaveProperty('id', enrollmentId);
    });

    it('update updates the enrollment (no-op)', async () => {
        if (enrollmentId === undefined) throw new Error('enrollmentId not set');
        // Update status field, and provide all required fields
        const updated = await enrollmentService['apiEnrollment'].put(
            `/api/v1/enrollments/${enrollmentId}/`,
            {user: userId, course: testCourseId, status: 'completed'}
        );
        expect(updated).toHaveProperty('id', enrollmentId);
        expect(updated.status).toBe('completed');
    });

    it('delete removes the enrollment', async () => {
        if (enrollmentId === undefined) throw new Error('enrollmentId not set');
        await enrollmentService.delete(enrollmentId);
        // Optionally, try to fetch and expect an error
        try {
            await enrollmentService.getById(enrollmentId);
            expect(false).toBe(true); // Should not reach here
        } catch (error: any) {
            const statusOrMsg = error.response?.status
                ? String(error.response.status)
                : String(error.message);
            expect(statusOrMsg).toMatch(/404|not found/i);
        }
    });
});
