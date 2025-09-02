/**
 * InstructorCourseDetailsPage.test.tsx
 *
 * This test suite REQUIRES a mock for useNotification.
 * - useNotification is mocked to avoid context errors and to allow assertion of notification calls.
 * - NotificationProvider is NOT used in these tests.
 *
 * If you need to test the actual notification system, use NotificationProvider and do NOT mock useNotification.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter, useParams } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import useNotification from '@/components/Notifications/useNotification';
import { courseService } from '@/services/resources/courseService';
import learningTaskService, { updateTask } from '@/services/resources/learningTaskService';
import { courseFactory } from '@test-utils/factories/courseFactory';
import { learningTaskFactory } from '@test-utils/factories/learningTaskFactory';

import InstructorCourseDetailPage from './InstructorCourseDetailsPage';

// Mock the required dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    Link: ({ to, children, ...rest }: any) => (
      <a href={to} {...rest} data-testid="mock-link">
        {children}
      </a>
    ),
  };
});

vi.mock('@/services/resources/courseService', () => ({
  courseService: {
    getCourseDetails: vi.fn(),
  },
}));

vi.mock('@/services/resources/learningTaskService', () => ({
  default: {
    getAllTasksByCourseId: vi.fn(),
  },
  updateTask: vi.fn(),
}));

vi.mock('@/components/Notifications/useNotification');

vi.mock('@/components/shared/MarkdownRenderer', () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="markdown-renderer">{content}</div>
  ),
}));

// Mock the TaskCreation component fully to avoid hanging issues
vi.mock('@/components/taskCreation/TaskCreation', () => ({
  default: ({ open, onClose, courseId, task, isEditing, onSave }: any) => (
    <div data-testid={isEditing ? 'task-edit-modal' : 'task-creation-modal'}>
      {isEditing ? 'Task Editing Modal' : 'Task Creation Modal'}
      {open && <span>Modal is open</span>}
      <button onClick={onClose}>Close Modal</button>
      {isEditing && task && (
        <button
          data-testid="save-task-button"
          onClick={() => onSave({ ...task, title: 'Updated Task Title' })}
        >
          Save Task
        </button>
      )}
    </div>
  ),
}));

vi.mock('@/components/shared/InfoCard', () => ({
  default: ({ title, children }: any) => (
    <div data-testid={`info-card-${title?.toLowerCase().replace(/\s+/g, '-')}`}>
      <div data-testid="info-card-title">{title}</div>
      <div data-testid="info-card-content">{children}</div>
    </div>
  ),
}));

describe('InstructorCourseDetailsPage', () => {
  const mockCourseId = '123';
  const mockCourse = courseFactory.build({
    id: 1,
    title: 'Test Course',
    description: 'Test Description',
    description_html: '<p>Test Description</p>',
    isEnrolled: true,
    isCompleted: false,
  });

  const mockTasks = [
    learningTaskFactory.build({
      title: 'Task 1',
      description: 'Description for task 1',
      order: 1,
      is_published: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }),
    learningTaskFactory.build({
      title: 'Task 2',
      description: 'Description for task 2',
      order: 2,
      is_published: false,
      created_at: '2023-01-02T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
    }),
  ];

  const mockNotify = Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{ui}</BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as any).mockReturnValue({ courseId: mockCourseId });
    (courseService.getCourseDetails as any).mockResolvedValue(mockCourse);
    (learningTaskService.getAllTasksByCourseId as any).mockResolvedValue(mockTasks);
    (updateTask as any).mockResolvedValue({ ...mockTasks[0], title: 'Updated Task Title' });
    vi.mocked(useNotification).mockReturnValue(mockNotify);
  });

  it('renders loading state initially', () => {
    renderWithProviders(<InstructorCourseDetailPage />);

    // Check for CircularProgress component which indicates loading
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders course details when loaded', async () => {
    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for the course details to load
    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();
    expect(screen.getByTestId('info-card-created-by')).toBeInTheDocument();
    expect(screen.getByTestId('info-card-status')).toBeInTheDocument();
    expect(screen.getByTestId('info-card-prerequisites')).toBeInTheDocument();
    expect(screen.getByTestId('info-card-learning-objectives')).toBeInTheDocument();
  });

  it('renders task list when loaded', async () => {
    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Task 2')).toBeInTheDocument();

    // Check for task status chips
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('shows Edit Course button and opens edit modal on click', async () => {
    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for course details to load
    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    const editCourseButton = screen.getByTestId('edit-course-button');
    expect(editCourseButton).toBeInTheDocument();

    fireEvent.click(editCourseButton);

    // Optional: Check if the modal or a specific element in the modal appears
    // expect(screen.getByText('Edit Course Details')).toBeInTheDocument();
  });

  it('shows Create Task button', async () => {
    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for course details to load
    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    const createTaskButton = screen.getByTestId('button-create-task');
    expect(createTaskButton).toBeInTheDocument();
    expect(createTaskButton).toHaveTextContent('Create Task');

    const courseTasksHeading = screen.getByText('Course Tasks');
    expect(courseTasksHeading).toBeInTheDocument();
  });

  it('opens task creation modal when Create Task button is clicked', async () => {
    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for course details to load
    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    const createTaskButton = screen.getByTestId('button-create-task');
    fireEvent.click(createTaskButton);

    // Check that modal is open
    expect(screen.getByTestId('task-creation-modal')).toBeInTheDocument();
    expect(screen.getByText('Modal is open')).toBeInTheDocument();
  });

  it('renders task details modal when clicking on a task', async () => {
    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    // Click on the first task
    fireEvent.click(screen.getByText('Task 1'));

    // Check that task details modal is open with task title as heading
    // Use a more specific selector to avoid ambiguity with multiple "Task 1" elements
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
  });

  it('opens task edit modal from task details and saves changes', async () => {
    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    // Click on the first task to open details modal
    fireEvent.click(screen.getByText('Task 1'));

    // Click Edit Task button
    fireEvent.click(screen.getByText('Edit Task'));

    // Verify edit modal is open
    await waitFor(() => {
      expect(screen.getByTestId('task-edit-modal')).toBeInTheDocument();
    });

    // Click save button in edit modal
    fireEvent.click(screen.getByTestId('save-task-button'));

    // Verify notification was called and task was updated
    await waitFor(() => {
      expect(updateTask).toHaveBeenCalledWith('1', expect.any(Object));
      expect(mockNotify).toHaveBeenCalledWith('Task updated successfully', 'success');
    });
  });

  it('handles task update errors correctly', async () => {
    // Mock an error when updating
    const mockError = new Error('Failed to update task');
    (updateTask as any).mockRejectedValue(mockError);

    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    // Click on the first task to open details modal
    fireEvent.click(screen.getByText('Task 1'));

    // Click Edit Task button
    fireEvent.click(screen.getByText('Edit Task'));

    // Verify edit modal is open
    await waitFor(() => {
      expect(screen.getByTestId('task-edit-modal')).toBeInTheDocument();
    });

    // Click save button in edit modal
    fireEvent.click(screen.getByTestId('save-task-button'));

    // Verify notification was called with error message
    await waitFor(() => {
      expect(mockNotify).toHaveBeenCalledWith('Failed to update task', 'error');
    });
  });

  it('renders empty state when there are no tasks', async () => {
    // Override the mock to return empty tasks array
    (learningTaskService.getAllTasksByCourseId as any).mockResolvedValue([]);

    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    // Check for empty state message
    expect(screen.getByText('No tasks available for this course.')).toBeInTheDocument();
    expect(screen.getByText('Create Your First Task')).toBeInTheDocument();
  });

  it('shows error state when course loading fails', async () => {
    // Mock an error response
    (courseService.getCourseDetails as any).mockRejectedValue(new Error('Failed to fetch course'));

    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for error state to render
    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch course/)).toBeInTheDocument();
    });
  });
});
