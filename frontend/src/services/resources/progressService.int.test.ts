import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TCourseStatus } from '@/types/';
import authService from '../auth/authService';
import courseService from './courseService';
import progressService from './progressService';
import { TEST_USERS } from '@/test-utils/setupIntegrationTests';

describe('progressService Integration', () => {
  let accessToken: string;
  let createdCourseId: number;
  let userId: number;

  beforeAll(async () => {
    try {
      // Use instructor account for tests that require course creation permissions
      const loginData = await authService.login(
        TEST_USERS.instructor.username,
        TEST_USERS.instructor.password
      );
      accessToken = loginData.access;

      // Set Authorization header for all ApiService instances
      progressService['apiUserProgress'].setAuthToken(accessToken);
      progressService['apiUserProgressArr'].setAuthToken(accessToken);
      progressService['apiQuizAttemptArr'].setAuthToken(accessToken);
      progressService['apiAny'].setAuthToken(accessToken);
      progressService['apiCourse'].setAuthToken(accessToken);

      courseService['apiCourse'].setAuthToken(accessToken);
      courseService['apiCourses'].setAuthToken(accessToken);
      courseService['apiVoid'].setAuthToken(accessToken);
      courseService['apiAny'].setAuthToken(accessToken);

      // Fetch user profile to get userId
      const userProfile = await authService.getUserProfile(accessToken);
      userId = userProfile.id;
    } catch (error) {
      console.error('Instructor login failed, falling back to student:', error);
      // Fall back to student if instructor login fails
      const loginData = await authService.login(
        TEST_USERS.student.username,
        TEST_USERS.student.password
      );
      accessToken = loginData.access;

      progressService['apiUserProgress'].setAuthToken(accessToken);
      progressService['apiUserProgressArr'].setAuthToken(accessToken);
      progressService['apiQuizAttemptArr'].setAuthToken(accessToken);
      progressService['apiAny'].setAuthToken(accessToken);
      progressService['apiCourse'].setAuthToken(accessToken);

      courseService['apiCourse'].setAuthToken(accessToken);
      courseService['apiCourses'].setAuthToken(accessToken);
      courseService['apiVoid'].setAuthToken(accessToken);
      courseService['apiAny'].setAuthToken(accessToken);

      const userProfile = await authService.getUserProfile(accessToken);
      userId = userProfile.id;
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
        creator: userId,
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
      expect(/not found/i.test(error.message) || /status code 404/i.test(error.message)).toBe(true);
    }
  });

  it('getUserEnrollmentStatus returns user enrollment status for a course', async () => {
    const enrollmentStatus = await progressService.getUserEnrollmentStatus(String(createdCourseId));
    expect(enrollmentStatus).toHaveProperty('enrolled');
    expect(enrollmentStatus).toHaveProperty('enrollmentDate');
    expect(typeof enrollmentStatus.enrolled).toBe('boolean');
  });

  it('getUserProgress returns correct progress structure for a course', async () => {
    const progress = await progressService.getUserProgress(String(createdCourseId));
    expect(progress).toHaveProperty('courseId', String(createdCourseId));
    expect(progress).toHaveProperty('userId');
    expect(progress).toHaveProperty('completedTasks');
    expect(progress).toHaveProperty('overallProgress');
    expect(typeof progress.overallProgress).toBe('number');
    expect(progress.overallProgress).toBeGreaterThanOrEqual(0);
    expect(progress.overallProgress).toBeLessThanOrEqual(100);
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
