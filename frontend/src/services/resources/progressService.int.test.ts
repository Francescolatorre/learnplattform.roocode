import {describe, it, expect, beforeAll, afterAll} from 'vitest';

import {TCourseStatus} from '@/types/';

import authService from '../auth/authService';

import courseService from './courseService';
import progressService from './progressService';


const TEST_USERS = {
    student: {
        username: 'student',
        password: 'student123',
    },
};

describe('progressService Integration', () => {
    let accessToken: string;
    let createdCourseId: number;
    let userId: number;

    beforeAll(async () => {
        const loginData = await authService.login(TEST_USERS.student.username, TEST_USERS.student.password);
        accessToken = loginData.access;
        // Set Authorization header for all ApiService instances used by progressService
        progressService['apiUserProgress'].setAuthToken(accessToken);
        progressService['apiUserProgressArr'].setAuthToken(accessToken);
        //progressService['apiTaskProgress'].setAuthToken(accessToken);
        //progressService['apiTaskProgressArr'].setAuthToken(accessToken);
        progressService['apiQuizAttemptArr'].setAuthToken(accessToken);
        progressService['apiAny'].setAuthToken(accessToken);
        progressService['apiCourse'].setAuthToken(accessToken);
        // Set Authorization header for all ApiService instances used by courseService
        courseService['apiCourse'].setAuthToken(accessToken);
        courseService['apiCourses'].setAuthToken(accessToken);
        courseService['apiVoid'].setAuthToken(accessToken);
        courseService['apiAny'].setAuthToken(accessToken);
        // Fetch user profile to get userId
        const userProfile = await authService.getUserProfile(accessToken);
        userId = userProfile.id;
        // Create a course for testing
        const courseData = {
            title: 'Integration Test Progress Course',
            description: 'Created by integration test for progressService',
            version: 1,
            status: 'published' as TCourseStatus,
            visibility: 'public' as const,
            learning_objectives: 'Test objectives',
            prerequisites: 'None',
            creator: userId,
        };
        const created = await courseService.createCourse(courseData);
        createdCourseId = created.id;
    });

    afterAll(async () => {
        // Clean up the created course
        if (createdCourseId) {
            await courseService.deleteCourse(String(createdCourseId));
        }
    });

    it('fetchCourseDetails returns course details for created course', async () => {
        const details = await progressService.fetchCourseDetails(String(createdCourseId));
        expect(details).toHaveProperty('id', createdCourseId);
        expect(details).toHaveProperty('title', 'Integration Test Progress Course');
    });
    it('fetchCourseDetails throws error for non-existent course', async () => {
        const nonExistentId = 99999999;
        try {
            await progressService.fetchCourseDetails(String(nonExistentId));
            expect(false).toBe(true); // Should not reach here
        } catch (error: any) {
            expect(
                /not found/i.test(error.message) || /status code 404/i.test(error.message)
            ).toBe(true);
        }
    });

    // Note: Most progressService methods are placeholders and do not hit real endpoints.
    // When endpoints are implemented, expand tests to cover update, get, and delete operations.

});
