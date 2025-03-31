import React from 'react';
import {render, screen} from '@testing-library/react';
import {
  fetchCourses,
  fetchUserCourseProgress,
  fetchUserEnrollments,
} from '@services/courseService';
import {QueryClient, QueryClientProvider} from 'react-query';
import {BrowserRouter} from 'react-router-dom';

import CourseEnrollmentPage from '../pages/StudentCourseEnrollmentPage';

jest.mock('@services/courseService', () => ({
  fetchCourses: jest.fn(),
  fetchUserCourseProgress: jest.fn(),
  fetchUserEnrollments: jest.fn(),
}));

const mockCourses = [
  {id: '1', title: 'Course 1', description: 'Description 1', enrollmentStatus: 'active'},
  {id: '2', title: 'Course 2', description: 'Description 2', enrollmentStatus: 'open'},
];

const queryClient = new QueryClient();

describe('CourseEnrollmentPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display "You are already enrolled" for enrolled courses', async () => {
    (fetchCourses as jest.Mock).mockResolvedValue({results: mockCourses});

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CourseEnrollmentPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('You are already enrolled in this course.')).toBeInTheDocument();
    expect(screen.queryByText('Enroll')).not.toBeInTheDocument();
  });

  it('should display "Enroll" button for unenrolled courses', async () => {
    (fetchCourses as jest.Mock).mockResolvedValue({
      results: [
        {id: '3', title: 'Course 3', description: 'Description 3', enrollmentStatus: 'open'},
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CourseEnrollmentPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Enroll')).toBeInTheDocument();
  });

  it('should not display "Enroll" button for already enrolled courses', async () => {
    (fetchCourses as jest.Mock).mockResolvedValue({
      results: [
        {id: '1', title: 'Course 1', description: 'Description 1', enrollmentStatus: 'active'},
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CourseEnrollmentPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('You are already enrolled in this course.')).toBeInTheDocument();
    expect(screen.queryByText('Enroll')).not.toBeInTheDocument();
  });

  it('should correctly merge progress data with course data', async () => {
    (fetchCourses as jest.Mock).mockResolvedValue({
      results: [
        {id: '1', title: 'Course 1', description: 'Description 1'},
        {id: '2', title: 'Course 2', description: 'Description 2'},
      ],
    });

    (fetchUserCourseProgress as jest.Mock).mockResolvedValue([
      {course_id: '1', enrollment_status: 'active', progress: 50},
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CourseEnrollmentPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('You are already enrolled in this course.')).toBeInTheDocument();
    expect(screen.queryByText('Enroll')).toBeInTheDocument(); // For Course 2
  });

  it('should correctly merge enrollment data with course data', async () => {
    (fetchCourses as jest.Mock).mockResolvedValue({
      results: [
        {id: '1', title: 'Course 1', description: 'Description 1'},
        {id: '2', title: 'Course 2', description: 'Description 2'},
      ],
    });

    (fetchUserEnrollments as jest.Mock).mockResolvedValue([
      {course_id: '1', enrollment_status: 'active'},
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CourseEnrollmentPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('You are already enrolled in this course.')).toBeInTheDocument();
    expect(screen.queryByText('Enroll')).toBeInTheDocument(); // For Course 2
  });
});
