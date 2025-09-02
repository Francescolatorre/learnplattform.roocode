/**
 * Clean test: StudentCourseDetailsPage.test.tsx
 * Step 1: Only check that mocks are called when rendering the component.
 */

import React from 'react';
import { vi } from 'vitest';
import StudentCourseDetailsPage from './StudentCourseDetailsPage';
import { courseService } from '@services/resources/courseService';
import { enrollmentService } from '@services/resources/enrollmentService';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { courseFactory } from '@/test-utils/factories/courseFactory';
import { learningTaskFactory } from '@/test-utils/factories/learningTaskFactory';
import { IUser, UserRoleEnum } from '@/types/userTypes';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { waitFor } from '@testing-library/react';
import { screen } from '@testing-library/react';

// Mock the services
vi.mock('@services/resources/courseService');
vi.mock('@services/resources/enrollmentService');
vi.mock('@/components/Notifications/useNotification', () => ({
  default: vi.fn(),
}));
vi.mock('@context/auth/AuthContext', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: () => ({
      user: {
        id: '1',
        username: 'testuser',
        email: 'testuser@example.com',
        role: 'student',
        is_active: true,
      },
      isAuthenticated: true,
      isRestoring: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      getUserRole: () => 'student',
      redirectToDashboard: vi.fn(),
    }),
  };
});

// Replace static mocks with factories, using numbers for id and course
const mockCourse = courseFactory.build({
  id: 1,
  title: 'Test Course',
  description: 'This is a test course description',
  isEnrolled: true, // ensure this is set
});

const mockTasks = {
  count: 2,
  results: [
    learningTaskFactory.build({ id: 1, course: 1, title: 'Task 1' }),
    learningTaskFactory.build({ id: 2, course: 1, title: 'Task 2' }),
  ],
};

const mockEnrollmentStatus = { enrolled: true, completed: false };

describe('StudentCourseDetailsPage (clean mock call check)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(courseService).getCourseDetails.mockImplementation((id: string) => {
      return Promise.resolve({ ...mockCourse });
    });
    vi.mocked(courseService).getCourseTasks.mockImplementation((id: string) => {
      return Promise.resolve({
        count: mockTasks.count,
        results: mockTasks.results,
        next: null,
        previous: null,
      });
    });
    vi.mocked(enrollmentService).getEnrollmentStatus.mockImplementation((id: string | number) => {
      return Promise.resolve({
        enrolled: true,
        enrollmentDate: '2024-01-01',
        enrollmentId: 123,
      });
    });
  });

  it('calls all service mocks when rendering', async () => {
    // No need to provide AuthContext.Provider, AuthProvider is now in renderWithProviders
    renderWithProviders(
      <Routes>
        <Route path="/courses/:courseId" element={<StudentCourseDetailsPage />} />
      </Routes>,
      { initialEntries: ['/courses/1'] }
    );
    // Wait for the mocks to be called using waitFor
    await waitFor(() => {
      expect(courseService.getCourseDetails).toHaveBeenCalled();
      expect(courseService.getCourseTasks).toHaveBeenCalled();
      expect(enrollmentService.getEnrollmentStatus).toHaveBeenCalled();
    });
  });

  it('Lists course details and tasks if enrolled', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/courses/:courseId" element={<StudentCourseDetailsPage />} />
      </Routes>,
      { initialEntries: ['/courses/1'] }
    );

    // Wait for course details to be displayed
    await waitFor(() => {
      expect(screen.getByText(mockCourse.title)).toBeInTheDocument();
      expect(screen.getByText(mockCourse.description)).toBeInTheDocument();
    });

    // Wait for and check that tasks are listed by testid
    for (const task of mockTasks.results) {
      const taskTitle = await screen.findByTestId(`task-title-${task.id}`);
      expect(taskTitle).toHaveTextContent(task.title);
    }
  });

  it('does not show tasks if user is not enrolled', async () => {
    // Mock course and enrollment to not enrolled
    vi.mocked(courseService).getCourseDetails.mockResolvedValue({
      ...mockCourse,
      isEnrolled: false,
    });
    vi.mocked(enrollmentService).getEnrollmentStatus.mockResolvedValue({
      enrolled: false,
      enrollmentDate: null,
      enrollmentId: null,
    });
    renderWithProviders(
      <Routes>
        <Route path="/courses/:courseId" element={<StudentCourseDetailsPage />} />
      </Routes>,
      { initialEntries: ['/courses/1'] }
    );
    // Wait for course details to be displayed
    await waitFor(() => {
      expect(screen.getByText(mockCourse.title)).toBeInTheDocument();
    });
    // Tasks should NOT be shown
    mockTasks.results.forEach(task => {
      expect(screen.queryByText(task.title)).not.toBeInTheDocument();
    });
    // Optionally, check for a message about enrolling to see tasks
    expect(screen.getByText(/enroll in this course to access learning tasks/i)).toBeInTheDocument();
  });
});
