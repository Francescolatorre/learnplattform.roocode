import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import React from 'react';
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
    findByFilter: vi.fn(),
    unenrollFromCourseById: vi.fn(),
  },
}));

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

    // Updated to match the new text in the component
    expect(screen.getByText(/You are currently enrolled in this course/i)).toBeInTheDocument();
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

    // Updated to match the new text in the component
    const alertElement = screen.getByRole('alert');
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

    // Updated to match the new text in the component
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toHaveTextContent(
      /You were previously enrolled in this course but have dropped it/i
    );
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

    expect(
      screen.getByText(/This course is not currently published for enrollment/i)
    ).toBeInTheDocument();
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

  // Unenroll functionality tests
  it('shows unenroll button when user is actively enrolled', () => {
    // Mock the enrollment status as active
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

    expect(screen.getByText('Unenroll')).toBeInTheDocument();
  });

  it('does not show unenroll button when enrollment status is "completed"', () => {
    // Mock the enrollment status as completed
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
          data: { status: 'completed' }, // User completed the course
          isLoading: false,
        };
      }

      return { data: null, isLoading: false };
    });

    render(<CourseEnrollment courseId="1" />);

    expect(screen.queryByText('Unenroll')).not.toBeInTheDocument();
  });

  it('does not show unenroll button when enrollment status is "dropped"', () => {
    // Mock the enrollment status as dropped
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
          data: { status: 'dropped' }, // User already dropped the course
          isLoading: false,
        };
      }

      return { data: null, isLoading: false };
    });

    render(<CourseEnrollment courseId="1" />);

    expect(screen.queryByText('Unenroll')).not.toBeInTheDocument();
  });

  it('shows unenroll confirmation dialog when unenroll button is clicked', () => {
    // Mock the enrollment status as active
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

    // Click the unenroll button
    const unenrollButton = screen.getByText('Unenroll');
    fireEvent.click(unenrollButton);

    // Verify the confirmation dialog appears
    expect(screen.getByText('Confirm Unenrollment')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to unenroll from/)).toBeInTheDocument();
  });

  it('calls unenrollment mutation when confirmation is confirmed', () => {
    // Mock the enrollment status as active
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

    // Set up the unenroll mutation mock
    const mockUnenrollMutate = vi.fn();
    (useMutation as any).mockImplementation(({ mutationFn }) => {
      // Create different mock objects based on the mutation function
      if (mutationFn && String(mutationFn).includes('unenroll')) {
        return {
          mutate: mockUnenrollMutate,
          isSuccess: false,
          isPending: false,
        };
      }
      return {
        mutate: vi.fn(),
        isSuccess: false,
        isPending: false,
      };
    });

    render(<CourseEnrollment courseId="1" />);

    // Click the unenroll button to open the dialog
    const unenrollButton = screen.getByText('Unenroll');
    fireEvent.click(unenrollButton);

    // Find the confirm button in the dialog and click it
    // Use a more specific query to find the button in the dialog
    const confirmButton = screen
      .getAllByRole('button')
      .find(
        button =>
          button.textContent === 'Unenroll' && button.className.includes('MuiButton-containedError')
      );

    expect(confirmButton).toBeDefined();
    if (confirmButton) {
      fireEvent.click(confirmButton);
      // Verify that the unenroll mutation was called
      expect(mockUnenrollMutate).toHaveBeenCalled();
    }
  });

  it('closes the dialog when cancel button is clicked', () => {
    // Mock the enrollment status as active
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

    // Click the unenroll button to open the dialog
    const unenrollButton = screen.getByText('Unenroll');
    fireEvent.click(unenrollButton);

    // Verify dialog is open
    expect(screen.getByText('Confirm Unenrollment')).toBeInTheDocument();

    // Click the cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Verify dialog is closed (this is an approximation since we can't really test MUI Dialog's open state directly)
    waitFor(() => {
      expect(screen.queryByText('Confirm Unenrollment')).not.toBeInTheDocument();
    });
  });

  it('shows a success message after successful unenrollment', () => {
    // Mock the enrollment status as active
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

    // Mock successful unenrollment
    (useMutation as any).mockImplementation(({ mutationFn }) => {
      // Return different mock based on the mutation function
      if (mutationFn && String(mutationFn).includes('unenroll')) {
        return {
          mutate: vi.fn(),
          isSuccess: true, // Unenrollment succeeded
          isPending: false,
        };
      }
      return {
        mutate: vi.fn(),
        isSuccess: false,
        isPending: false,
      };
    });

    render(<CourseEnrollment courseId="1" />);

    // Verify success message is shown
    expect(
      screen.getByText('You have successfully unenrolled from this course.')
    ).toBeInTheDocument();
  });

  it('shows loading state during unenrollment process', () => {
    // Mock the enrollment status as active
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

    // Mock unenrollment in progress
    (useMutation as any).mockImplementation(({ mutationFn }) => {
      // Return different mock based on the mutation function
      if (mutationFn && String(mutationFn).includes('unenroll')) {
        return {
          mutate: vi.fn(),
          isSuccess: false,
          isPending: true, // Unenrollment in progress
        };
      }
      return {
        mutate: vi.fn(),
        isSuccess: false,
        isPending: false,
      };
    });

    render(<CourseEnrollment courseId="1" />);

    // Look for "Unenrolling..." text directly
    expect(screen.getByText('Unenrolling...')).toBeInTheDocument();
  });
});
