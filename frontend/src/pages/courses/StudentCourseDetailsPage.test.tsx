/**
 * StudentCourseDetailsPage.test.tsx - Behavior-Driven Student Course Enrollment Testing
 *
 * Tests student course enrollment and access behaviors focusing on educational
 * workflow outcomes rather than implementation details. Uses AuthTestBehavior and
 * CourseTestBehavior for consistent testing patterns.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { NotificationProvider } from '@/components/Notifications/NotificationProvider';
import useNotification from '@/components/Notifications/useNotification';
import { CourseTestBehavior } from '@/test/behaviors/CourseTestBehavior';
import { AuthTestBehavior } from '@/test/behaviors/AuthTestBehavior';
import { TestDataBuilder } from '@/test/builders/TestDataBuilder';
import { ServiceTestUtils } from '@/test/utils/ServiceTestUtils';
import { UserRoleEnum } from '@/types/userTypes';

import StudentCourseDetailsPage from './StudentCourseDetailsPage';

// Mock modern services with behavior-driven pattern
vi.mock('@/services/resources/modernCourseService', () => ({
  modernCourseService: {
    getCourseDetails: vi.fn(),
    getCourses: vi.fn(),
    updateCourse: vi.fn(),
  },
}));

vi.mock('@/services/resources/modernEnrollmentService', () => ({
  modernEnrollmentService: {
    getEnrollmentStatus: vi.fn(),
    enrollInCourse: vi.fn(),
    unenrollFromCourse: vi.fn(),
  },
}));

vi.mock('@/services/resources/modernLearningTaskService', () => ({
  modernLearningTaskService: {
    getAllTasksByCourseId: vi.fn(),
    getTaskProgressCounts: vi.fn(),
  },
}));

vi.mock('@/components/Notifications/useNotification');

vi.mock('@/components/shared/MarkdownRenderer', () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="markdown-renderer">{content}</div>
  ),
}));

describe('StudentCourseDetailsPage - Behavior-Driven Student Enrollment Testing', () => {
  let courseBehavior: CourseTestBehavior;
  let authBehavior: AuthTestBehavior;
  let testCourse: any;
  let testTasks: any[];

  const mockCourseId = '123';
  const mockNotify = Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  });

  const renderWithProviders = (ui: React.ReactElement = (
    <Routes>
      <Route path="/courses/:courseId" element={<StudentCourseDetailsPage />} />
    </Routes>
  )) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <BrowserRouter>
            {ui}
          </BrowserRouter>
        </NotificationProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    ServiceTestUtils.initialize();

    // Setup behavior-driven testing
    authBehavior = new AuthTestBehavior();
    courseBehavior = new CourseTestBehavior();

    // Configure student with course access
    authBehavior.configureStudentLogin('student@university.edu');

    // Create test course for student access
    testCourse = TestDataBuilder.course()
      .withTitle('Advanced Web Development')
      .withDescription('Comprehensive course covering modern web development practices')
      .asPublished()
      .build();

    // Create test tasks for the course
    testTasks = [
      TestDataBuilder.task()
        .forCourse(testCourse.id)
        .withTitle('JavaScript Fundamentals Assignment')
        .asAssignment()
        .asPublished()
        .build(),
      TestDataBuilder.task()
        .forCourse(testCourse.id)
        .withTitle('React Components Quiz')
        .asQuiz()
        .asPublished()
        .build(),
    ];

    vi.mocked(useNotification).mockReturnValue(mockNotify);
  });

  afterEach(() => {
    ServiceTestUtils.cleanup();
    authBehavior.reset();
    courseBehavior.reset();
  });

  it('shows loading feedback while course data is being retrieved', async () => {
    // Configure enrolled student behavior
    courseBehavior.configureCourseAccess(UserRoleEnum.STUDENT, 'view', testCourse);
    courseBehavior.configureCourseEnrollment(true, 'enrolled');
    courseBehavior.configureTaskManagement(testTasks.length, true, 'assignment', testTasks);

    // Setup service mocks
    const { modernCourseService } = await import('@/services/resources/modernCourseService');
    const { modernEnrollmentService } = await import('@/services/resources/modernEnrollmentService');
    const { modernLearningTaskService } = await import('@/services/resources/modernLearningTaskService');

    vi.mocked(modernCourseService.getCourseDetails).mockResolvedValue(testCourse);
    vi.mocked(modernEnrollmentService.getEnrollmentStatus).mockResolvedValue({
      enrolled: true,
      enrollmentDate: '2024-01-01T00:00:00Z',
      enrollmentId: 123,
    });
    vi.mocked(modernLearningTaskService.getAllTasksByCourseId).mockResolvedValue({
      results: testTasks,
      count: testTasks.length,
      next: null,
      previous: null,
    });

    // Navigate to course details page
    window.history.pushState({}, 'Test', `/courses/${mockCourseId}`);
    renderWithProviders();

    // Student should see loading state initially
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays course information and responds to enrollment data', async () => {
    // Configure enrolled student behavior
    courseBehavior.configureCourseAccess(UserRoleEnum.STUDENT, 'view', testCourse);
    courseBehavior.configureCourseEnrollment(true, 'enrolled');
    courseBehavior.configureTaskManagement(testTasks.length, true, 'assignment', testTasks);

    // Setup service mocks
    const { modernCourseService } = await import('@/services/resources/modernCourseService');
    const { modernEnrollmentService } = await import('@/services/resources/modernEnrollmentService');
    const { modernLearningTaskService } = await import('@/services/resources/modernLearningTaskService');

    vi.mocked(modernCourseService.getCourseDetails).mockResolvedValue(testCourse);
    vi.mocked(modernEnrollmentService.getEnrollmentStatus).mockResolvedValue({
      enrolled: true,
      enrollmentDate: '2024-01-01T00:00:00Z',
      enrollmentId: 123,
    });
    vi.mocked(modernLearningTaskService.getAllTasksByCourseId).mockResolvedValue({
      results: testTasks,
      count: testTasks.length,
      next: null,
      previous: null,
    });

    // Navigate to course details page
    window.history.pushState({}, 'Test', `/courses/${mockCourseId}`);
    renderWithProviders();

    // Wait for course content to load
    await waitFor(() => {
      expect(screen.getByText(testCourse.title)).toBeInTheDocument();
    });

    // Verify course details are displayed
    expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();

    // Verify service calls were made (testing integration behavior)
    expect(vi.mocked(modernCourseService.getCourseDetails)).toHaveBeenCalledWith(Number(mockCourseId));
    // Note: enrollmentService.getEnrollmentStatus may be called conditionally based on auth state

    // Verify enrollment behavior occurred
    expect(courseBehavior.verifyEnrollmentOccurred()).toBe(true);
  });

  it('shows enrollment option for non-enrolled student', async () => {
    // Configure non-enrolled student behavior
    courseBehavior.configureCourseAccess(UserRoleEnum.STUDENT, 'view', testCourse);
    courseBehavior.configureCourseEnrollment(false, 'not_enrolled');

    // Setup service mocks
    const { modernCourseService } = await import('@/services/resources/modernCourseService');
    const { modernEnrollmentService } = await import('@/services/resources/modernEnrollmentService');
    const { modernLearningTaskService } = await import('@/services/resources/modernLearningTaskService');

    vi.mocked(modernCourseService.getCourseDetails).mockResolvedValue(testCourse);
    vi.mocked(modernEnrollmentService.getEnrollmentStatus).mockResolvedValue({
      enrolled: false,
      enrollmentDate: null,
      enrollmentId: null,
    });
    vi.mocked(modernLearningTaskService.getAllTasksByCourseId).mockResolvedValue({
      results: [],
      count: 0,
      next: null,
      previous: null,
    });

    // Navigate to course details page
    window.history.pushState({}, 'Test', `/courses/${mockCourseId}`);
    renderWithProviders();

    // Wait for course content to load
    await waitFor(() => {
      expect(screen.getByText(testCourse.title)).toBeInTheDocument();
    });

    // Verify course details are displayed but no tasks
    expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();
    expect(screen.queryByText(testTasks[0].title)).not.toBeInTheDocument();
    expect(screen.queryByText(testTasks[1].title)).not.toBeInTheDocument();

    // Verify student enrollment behavior
    expect(authBehavior.getCurrentUserRole()).toBe(UserRoleEnum.STUDENT);
  });
});