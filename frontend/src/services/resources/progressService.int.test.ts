import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { TEST_USERS } from '@/test-utils/setupIntegrationTests';
import { TCourseStatus } from '@/types/';

import authService from '../auth/authService';

import { courseService } from './courseService';
import progressService from './progressService';

/**
 * Integration test for progressService.
 * Test environment requirements:
 * - All service dependencies must be initialized via their public setAuthToken method.
 * - No direct property access to internal API clients.
 * - If mocking is needed, use global mocks in setupTests.ts.
 * - Diagnostic logging is included before dependency access.
 */

describe('progressService Integration', () => {
  let accessToken: string;
  let createdCourseId: number;

  beforeAll(async () => {
    try {
      // Use instructor account for tests that require course creation permissions
      const loginData = await authService.login(
        TEST_USERS.instructor.username,
        TEST_USERS.instructor.password
      );
      accessToken = loginData.access;

      // Diagnostic logging
      console.log('[progressService] Type:', typeof progressService);
      console.log('[courseService] Type:', typeof courseService);

      // Set Authorization header for all ApiService instances using public API
      progressService.setAuthToken(accessToken);
      courseService.setAuthToken(accessToken);

      // Fetch user profile
      await authService.getUserProfile(accessToken);
    } catch (error) {
      console.error('Instructor login failed, falling back to student:', error);
      // Fall back to student if instructor login fails
      const loginData = await authService.login(
        TEST_USERS.student.username,
        TEST_USERS.student.password
      );
      accessToken = loginData.access;

      // Diagnostic logging
      console.log('[progressService] Type:', typeof progressService);
      console.log('[courseService] Type:', typeof courseService);

      progressService.setAuthToken(accessToken);
      courseService.setAuthToken(accessToken);

      await authService.getUserProfile(accessToken);
    }

    try {
      // Create a course for testing
      const courseData = {
        title: 'Integration Test Progress Course',
        description: 'Created by integration test for progressService',
        version: 1,
        status: 'published' as TCourseStatus,
        visibility: 'public' as const,
        learning_objectives: 'Test objectives',
        prerequisites: 'None',
        // creator: userId, // REMOVED: backend sets creator automatically
      };
      const createdCourse = await courseService.createCourse(courseData);
      createdCourseId = createdCourse.id;
    } catch (error) {
      console.error('Failed to create test course:', error);
      throw error;
    }
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
        /not found/i.test(error.message) ||
          /status code 404/i.test(error.message) ||
          /No.*matches the given query/i.test(error.message)
      ).toBe(true);
    }
  });

  it('getQuizAttempts returns quiz attempts for a specific quiz', async () => {
    // This test assumes there's a quiz ID available or can be mocked
    const quizId = '1'; // Use a mock or actual quiz ID
    const attempts = await progressService.getQuizAttempts(quizId);

    expect(Array.isArray(attempts)).toBe(true);
    if (attempts.length > 0) {
      expect(attempts[0]).toHaveProperty('quizId');
      expect(attempts[0]).toHaveProperty('score');
      expect(attempts[0]).toHaveProperty('completedAt');
    }
  });

  // Note: Most progressService methods are placeholders and do not hit real endpoints.
  // When endpoints are implemented, expand tests to cover update, get, and delete operations.
});
