import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CourseEnrollment from './CourseEnrollment';

// Mock required hooks and services
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@context/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', username: 'testuser' },
  }),
}));

vi.mock('@services/resources/courseService', () => ({
  courseService: {
    getCourseDetails: vi.fn(),
  },
}));

vi.mock('@services/resources/enrollmentService', () => ({
  __esModule: true,
  default: {
    fetchUserEnrollments: vi.fn(),
    create: vi.fn(),
  },
}));

import { useQuery, useMutation } from '@tanstack/react-query';

describe('CourseEnrollment Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for useQuery and useMutation
    (useQuery as any).mockImplementation(({ queryKey }) => {
      // Mock for course data
      if (queryKey[0] === 'course') {
        return {
          data: {
            id: '1',
            title: 'Test Course',
            description: 'Test Description',
            status: 'published',
            visibility: 'public',
          },
          isLoading: false,
          error: null,
        };
      }

      // Mock for enrollment data
      if (queryKey[0] === 'enrollment') {
        return {
          data: null, // Not enrolled by default
          isLoading: false,
        };
      }

      return { data: null, isLoading: false, error: null };
    });

    (useMutation as any).mockImplementation(() => ({
      mutate: vi.fn(),
      isSuccess: false,
      isPending: false,
    }));
  });

  it('renders course information correctly', () => {
    render(<CourseEnrollment courseId="1" />);

    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('shows loading state when course data is loading', () => {
    (useQuery as any).mockImplementation(() => ({
      isLoading: true,
      data: null,
    }));

    render(<CourseEnrollment courseId="1" />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error alert when there is an error loading course', () => {
    (useQuery as any).mockImplementation(() => ({
      error: new Error('Failed to load course'),
      data: null,
      isLoading: false,
    }));

    render(<CourseEnrollment courseId="1" />);

    expect(screen.getByText(/Failed to load course/i)).toBeInTheDocument();
  });

  it('shows enroll button when user is not enrolled', () => {
    render(<CourseEnrollment courseId="1" />);

    expect(screen.getByText('Enroll in Course')).toBeInTheDocument();
  });

  it('shows success message and view tasks button when user is enrolled', () => {
    (useQuery as any).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'course') {
        return {
          data: {
            id: '1',
            title: 'Test Course',
            description: 'Test Description',
            status: 'published',
            visibility: 'public',
          },
          isLoading: false,
        };
      }

      if (queryKey[0] === 'enrollment') {
        return {
          data: { status: 'active' }, // User is enrolled
          isLoading: false,
        };
      }

      return { data: null, isLoading: false };
    });

    render(<CourseEnrollment courseId="1" />);

    expect(screen.getByText(/You are already enrolled in this course/i)).toBeInTheDocument();
    expect(screen.getByText('View Course Tasks')).toBeInTheDocument();
  });

  it('shows different message when enrollment status is completed', () => {
    (useQuery as any).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'course') {
        return {
          data: {
            id: '1',
            title: 'Test Course',
            description: 'Test Description',
            status: 'published',
            visibility: 'public',
          },
          isLoading: false,
        };
      }

      if (queryKey[0] === 'enrollment') {
        return {
          data: { status: 'completed' },
          isLoading: false,
        };
      }
      return { data: null, isLoading: false };
    });

    render(<CourseEnrollment courseId="1" />);

    // Die Texte sind innerhalb eines einzigen Alert-Elements
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toHaveTextContent(/You are already enrolled in this course/i);
    expect(alertElement).toHaveTextContent(/You have completed this course/i);
  });

  it('shows different message when enrollment status is dropped', () => {
    (useQuery as any).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'course') {
        return {
          data: {
            id: '1',
            title: 'Test Course',
            description: 'Test Description',
            status: 'published',
            visibility: 'public',
          },
          isLoading: false,
        };
      }

      if (queryKey[0] === 'enrollment') {
        return {
          data: { status: 'dropped' },
          isLoading: false,
        };
      }
      return { data: null, isLoading: false };
    });

    render(<CourseEnrollment courseId="1" />);

    // Die Texte sind innerhalb eines einzigen Alert-Elements
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toHaveTextContent(/You are already enrolled in this course/i);
    expect(alertElement).toHaveTextContent(/You have dropped this course/i);
  });

  it('shows warning when course is not published', () => {
    (useQuery as any).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'course') {
        return {
          data: {
            id: '1',
            title: 'Test Course',
            description: 'Test Description',
            status: 'draft', // Course is not published
            visibility: 'public',
          },
          isLoading: false,
        };
      }
      return { data: null, isLoading: false };
    });

    render(<CourseEnrollment courseId="1" />);

    expect(screen.getByText(/This course is not currently published for enrollment/i)).toBeInTheDocument();
  });

  it('calls enrollment mutation when enroll button is clicked', () => {
    const mockMutate = vi.fn();
    (useMutation as any).mockImplementation(() => ({
      mutate: mockMutate,
      isSuccess: false,
      isPending: false,
    }));

    render(<CourseEnrollment courseId="1" />);

    const enrollButton = screen.getByText('Enroll in Course');
    fireEvent.click(enrollButton);

    expect(mockMutate).toHaveBeenCalled();
  });

  it('shows success message after successful enrollment', () => {
    (useMutation as any).mockImplementation(() => ({
      mutate: vi.fn(),
      isSuccess: true,
      isPending: false,
    }));

    render(<CourseEnrollment courseId="1" />);

    expect(screen.getByText(/You have successfully enrolled in this course/i)).toBeInTheDocument();
  });

  it('shows loading state during enrollment process', () => {
    (useMutation as any).mockImplementation(() => ({
      mutate: vi.fn(),
      isSuccess: false,
      isPending: true,
    }));

    render(<CourseEnrollment courseId="1" />);

    expect(screen.getByText(/Enrolling.../i)).toBeInTheDocument();
  });
});
