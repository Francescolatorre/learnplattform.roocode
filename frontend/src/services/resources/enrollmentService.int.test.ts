import {describe, it, expect, beforeAll, afterAll, beforeEach} from 'vitest';
import {TCourseStatus, TCourseVisibility} from '@/types/course';
import {TEnrollmentStatus} from '@/types/enrollment';
import authService from '../auth/authService';
import {courseService} from './courseService';
import {enrollmentService} from './enrollmentService';
import {
  TEST_USERS,
  setupTestEnvironment,
  cleanupTestEnvironment,
} from '@/test-utils/setupIntegrationTests';

describe('enrollmentService Integration', () => {
  // Test data state
  const testData = {
    instructor: {
      token: '',
      userId: 0,
    },
    student: {
      token: '',
      userId: 0,
    },
    courses: {
      regular: {id: 0},
      forUnenrollment: {id: 0},
      notEnrolled: {id: 0},
    },
    enrollments: {
      regular: {id: 0},
      forUnenrollment: {id: 0},
    },
  };

  /**
   * Set up test environment once before all tests
   */
  beforeAll(async () => {
    // Authenticate users
    await setupUserAuthentication();

    // Create test courses
    await createTestCourses();
  });

  /**
   * Clean up after all tests complete
   */
  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  /**
   * Set up authentication for test users
   */
  async function setupUserAuthentication() {
    try {
      // Authenticate as instructor
      const instructorAuth = await authService.login(
        TEST_USERS.instructor.username,
        TEST_USERS.instructor.password
      );
      testData.instructor.token = instructorAuth.access;

      // Get instructor profile
      const instructorProfile = await authService.getUserProfile(testData.instructor.token);
      testData.instructor.userId = instructorProfile.id;

      // Authenticate as student
      const studentAuth = await authService.login(
        TEST_USERS.student.username,
        TEST_USERS.student.password
      );
      testData.student.token = studentAuth.access;

      // Get student profile
      const studentProfile = await authService.getUserProfile(testData.student.token);
      testData.student.userId = studentProfile.id;
    } catch (error) {
      console.error('Authentication setup failed:', error);
      throw new Error('Test environment setup failed - cannot authenticate users');
    }
  }

  /**
   * Create test courses needed for enrollment tests
   */
  async function createTestCourses() {
    try {
      // Set instructor auth token for course creation
      courseService.setAuthToken(testData.instructor.token);

      // Course template
      const baseCourseData = {
        version: 1,
        status: 'published' as TCourseStatus,
        visibility: 'public' as TCourseVisibility,
        creator: testData.instructor.userId,
      };

      // Create regular test course
      const regularCourse = await courseService.createCourse({
        ...baseCourseData,
        title: 'Regular Enrollment Test Course',
        description: 'Created by enrollmentService integration test',
      });
      testData.courses.regular.id = regularCourse.id;

      // Create course for unenrollment tests
      const unenrollmentCourse = await courseService.createCourse({
        ...baseCourseData,
        title: 'Unenrollment Test Course',
        description: 'Course created specifically for testing unenrollment',
      });
      testData.courses.forUnenrollment.id = unenrollmentCourse.id;

      // Create course that student won't enroll in (for negative tests)
      const notEnrolledCourse = await courseService.createCourse({
        ...baseCourseData,
        title: 'Not Enrolled Test Course',
        description: 'Course the student is not enrolled in',
      });
      testData.courses.notEnrolled.id = notEnrolledCourse.id;
    } catch (error) {
      console.error('Failed to create test courses:', error);
      throw new Error('Test environment setup failed - cannot create test courses');
    }
  }

  /**
   * Ensure service using appropriate auth token for test context
   */
  function useStudentAuth() {
    enrollmentService.setAuthToken(testData.student.token);
  }

  function useInstructorAuth() {
    enrollmentService.setAuthToken(testData.instructor.token);
  }

  describe('Enrollment Lifecycle', () => {
    beforeEach(() => {
      useStudentAuth();
    });

    it('should allow student to enroll in a course', async () => {
      // Act: Student enrolls in course
      const enrollment = await enrollmentService.enrollInCourse(testData.courses.regular.id);

      // Store for later tests
      testData.enrollments.regular.id = enrollment.id;

      // Assert: Enrollment was created with correct properties
      expect(enrollment).toHaveProperty('id');
      expect(enrollment).toHaveProperty('course', testData.courses.regular.id);
      expect(enrollment).toHaveProperty('user', testData.student.userId);
      expect(enrollment).toHaveProperty('status', 'active');
    });

    it('should retrieve enrollment by ID', async () => {
      // Act: Fetch the enrollment
      const enrollment = await enrollmentService.getById(testData.enrollments.regular.id);

      // Assert: Correct enrollment retrieved
      expect(enrollment).toHaveProperty('id', testData.enrollments.regular.id);
      expect(enrollment).toHaveProperty('course', testData.courses.regular.id);
      expect(enrollment).toHaveProperty('user', testData.student.userId);
    });

    it('should fetch all enrollments for current user', async () => {
      // Act: Fetch user enrollments
      const enrollments = await enrollmentService.fetchUserEnrollments();

      // Assert: Array contains at least our test enrollment
      const enrollmentArray = Array.isArray(enrollments) ? enrollments : enrollments.results || [];

      expect(Array.isArray(enrollmentArray)).toBe(true);

      const testEnrollment = enrollmentArray.find(e => e.id === testData.enrollments.regular.id);
      expect(testEnrollment).toBeDefined();
    });

    it('should update enrollment status', async () => {
      // Act: Update enrollment to completed
      const updatedEnrollment = await enrollmentService.updateEnrollment(
        testData.enrollments.regular.id,
        {status: 'completed' as TEnrollmentStatus}
      );

      // Assert: Status was updated
      expect(updatedEnrollment).toHaveProperty('id', testData.enrollments.regular.id);
      expect(updatedEnrollment).toHaveProperty('status', 'completed');
    });
  });

  describe('Unenrollment Workflows', () => {
    beforeEach(async () => {
      // Create a specific enrollment for unenrollment tests
      useStudentAuth();

      if (!testData.enrollments.forUnenrollment.id) {
        const enrollment = await enrollmentService.enrollInCourse(
          testData.courses.forUnenrollment.id
        );
        testData.enrollments.forUnenrollment.id = enrollment.id;
      }
    });

    it('should change enrollment status to dropped when unenrolling', async () => {
      // Act: Student unenrolls from course
      const response = await enrollmentService.unenrollFromCourseById(
        testData.courses.forUnenrollment.id
      );

      // Assert: Response indicates success
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('courseId', String(testData.courses.forUnenrollment.id));

      // Assert: Enrollment status was updated in database
      const enrollments = await enrollmentService.findByFilter({
        course: testData.courses.forUnenrollment.id,
      });

      const updatedEnrollment = enrollments.find(
        e => e.id === testData.enrollments.forUnenrollment.id
      );
      expect(updatedEnrollment).toBeDefined();
      expect(updatedEnrollment?.status).toBe('dropped');
    });

    it('should handle already dropped enrollments gracefully', async () => {
      // Student already unenrolled in previous test
      // Act: Attempt to unenroll again
      const response = await enrollmentService.unenrollFromCourseById(
        testData.courses.forUnenrollment.id
      );

      // Assert: Operation still succeeds
      expect(response).toHaveProperty('success', true);

      // Assert: Status remains dropped
      const enrollments = await enrollmentService.findByFilter({
        course: testData.courses.forUnenrollment.id,
      });

      const updatedEnrollment = enrollments.find(
        e => e.id === testData.enrollments.forUnenrollment.id
      );
      expect(updatedEnrollment).toBeDefined();
      expect(updatedEnrollment?.status).toBe('dropped');
    });

    it('should handle unenrolling from courses with no active enrollment', async () => {
      // Act: Try to unenroll from a course the student was never enrolled in
      const response = await enrollmentService.unenrollFromCourseById(
        testData.courses.notEnrolled.id
      );

      // Assert: Operation completes without error
      expect(response).toBeDefined();
      expect(response).toHaveProperty('success', true);
    });
  });
});
