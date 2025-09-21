/**
 * InstructorCourseDetailsPage.test.tsx - Behavior-Driven Course Management Testing
 *
 * Tests instructor course management behaviors focusing on educational workflow
 * outcomes rather than implementation details. Uses CourseTestBehavior and
 * AuthTestBehavior for consistent testing patterns.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { BrowserRouter, useParams } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import useNotification from '@/components/Notifications/useNotification';
import { CourseTestBehavior, CourseTestScenarios } from '@/test/behaviors/CourseTestBehavior';
import { AuthTestBehavior, AuthTestScenarios } from '@/test/behaviors/AuthTestBehavior';
import { TestDataBuilder } from '@/test/builders/TestDataBuilder';
import { ServiceTestUtils } from '@/test/utils/ServiceTestUtils';
import { UserRoleEnum } from '@/types/userTypes';

import InstructorCourseDetailPage from './InstructorCourseDetailsPage';

// Mock router functionality
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

// Mock modern services with behavior-driven pattern
vi.mock('@/services/resources/modernCourseService', () => ({
  modernCourseService: {
    getCourseDetails: vi.fn(),
    getInstructorCourses: vi.fn(),
    updateCourse: vi.fn(),
  },
}));

vi.mock('@/services/resources/modernLearningTaskService', () => ({
  modernLearningTaskService: {
    getAllTasksByCourseId: vi.fn(),
    getTaskProgressCounts: vi.fn(),
    updateTask: vi.fn(),
    createTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

vi.mock('@/services/resources/learningTaskService', () => ({
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
  default: ({ open, onClose, courseId: _courseId, task, isEditing, onSave }: any) => (
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

describe('InstructorCourseDetailsPage - Behavior-Driven Course Management Testing', () => {
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

  const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{ui}</BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    ServiceTestUtils.initialize();

    // Setup behavior-driven testing
    authBehavior = new AuthTestBehavior();
    courseBehavior = new CourseTestBehavior();

    // Configure instructor with course management permissions
    authBehavior.configureInstructorLogin('instructor@university.edu');

    // Create test course with realistic educational data
    testCourse = TestDataBuilder.course()
      .withTitle('Advanced Web Development')
      .withDescription('Comprehensive course covering modern web development practices')
      .withInstructor(authBehavior.getCurrentUser()!)
      .asPublished()
      .build();

    // Create test tasks for the course
    testTasks = [
      TestDataBuilder.task()
        .forCourse(testCourse.id)
        .withTitle('Assignment 1')
        .asAssignment()
        .asPublished()
        .build(),
      TestDataBuilder.task()
        .forCourse(testCourse.id)
        .withTitle('Quiz 6')
        .asQuiz()
        .asDraft()
        .dueInDays(7)
        .build(),
    ];

    // Configure course access behavior for instructor
    courseBehavior.configureCourseAccess(UserRoleEnum.INSTRUCTOR, 'edit', testCourse);
    courseBehavior.configureTaskManagement(testTasks.length, true, 'assignment', testTasks);

    // Setup router params
    (useParams as any).mockReturnValue({ courseId: mockCourseId });
    vi.mocked(useNotification).mockReturnValue(mockNotify);

    // Import the mocked services to wire up behavior-driven responses
    const { modernCourseService } = await import('@/services/resources/modernCourseService');
    const { modernLearningTaskService } = await import('@/services/resources/modernLearningTaskService');
    const { updateTask } = await import('@/services/resources/learningTaskService');

    // Wire up the direct import mocks to return test data
    vi.mocked(modernCourseService.getCourseDetails).mockResolvedValue(testCourse);
    // Return the tasks array directly, not in paginated format
    vi.mocked(modernLearningTaskService.getAllTasksByCourseId).mockResolvedValue(testTasks);
    vi.mocked(modernLearningTaskService.updateTask).mockResolvedValue(testTasks[0]);
    // Mock legacy updateTask to return updated task
    vi.mocked(updateTask).mockImplementation(async (taskId, updatedTask) => {
      return { ...testTasks[0], ...updatedTask, id: taskId };
    });
  });

  afterEach(() => {
    ServiceTestUtils.cleanup();
    authBehavior.reset();
    courseBehavior.reset();
  });

  it('shows loading feedback while course content is being loaded', () => {
    renderWithProviders(<InstructorCourseDetailPage />);

    // Instructor should see loading indicators while course data loads
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays course information for instructor management', async () => {
    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for instructor to access course content
    await waitFor(() => {
      expect(screen.getByText(testCourse.title)).toBeInTheDocument();
    });

    // Verify course management interface is available
    // Check for course description rendered via MarkdownRenderer or direct text
    const hasMarkdownRenderer = screen.queryByTestId('markdown-renderer');
    const hasDescriptionText = screen.queryByText(testCourse.description);
    expect(hasMarkdownRenderer || hasDescriptionText).toBeTruthy();
    expect(screen.getByTestId('info-card-created-by')).toBeInTheDocument();
    expect(screen.getByTestId('info-card-status')).toBeInTheDocument();
    expect(screen.getByTestId('info-card-prerequisites')).toBeInTheDocument();
    expect(screen.getByTestId('info-card-learning-objectives')).toBeInTheDocument();

    // Verify course access behavior occurred
    expect(courseBehavior.verifyCourseWasAccessed()).toBe(true);
  });

  it('displays task management interface for instructor workflow', async () => {
    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for task management interface to load
    await waitFor(() => {
      expect(screen.getByText(testTasks[0].title)).toBeInTheDocument();
    });

    expect(screen.getByText(testTasks[1].title)).toBeInTheDocument();

    // Verify task status information is visible for instructor decision-making
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();

    // Verify educational workflow behavior
    const currentTasks = courseBehavior.getCurrentTasks();
    expect(currentTasks).toHaveLength(testTasks.length);
  });

  it('provides course editing capability for instructor management workflow', async () => {
    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for instructor course management interface to load
    await waitFor(() => {
      expect(screen.getByText(testCourse.title)).toBeInTheDocument();
    });

    // Verify instructor can access course editing functionality
    const editCourseButton = screen.getByTestId('edit-course-button');
    expect(editCourseButton).toBeInTheDocument();

    // Instructor initiates course editing
    fireEvent.click(editCourseButton);

    // Verify instructor workflow behavior (not implementation details)
    expect(authBehavior.getCurrentUserRole()).toBe(UserRoleEnum.INSTRUCTOR);
    expect(courseBehavior.verifyCourseWasAccessed()).toBe(true);
  });

  it('provides task creation capability for educational content management', async () => {
    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for instructor task management interface to load
    await waitFor(() => {
      expect(screen.getByText(testCourse.title)).toBeInTheDocument();
    });

    // Verify task management interface is available
    const createTaskButton = screen.getByTestId('button-create-task');
    expect(createTaskButton).toBeInTheDocument();
    expect(createTaskButton).toHaveTextContent('Create Task');

    const courseTasksHeading = screen.getByText('Course Tasks');
    expect(courseTasksHeading).toBeInTheDocument();

    // Verify instructor has task management permissions
    expect(authBehavior.verifyUserHasPermission('task:create')).toBe(true);
  });

  it('enables task creation workflow when instructor initiates task creation', async () => {
    // Configure task creation behavior
    courseBehavior.configureTaskManagement(0, true, 'assignment');

    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for task management interface to be ready
    await waitFor(() => {
      expect(screen.getByText(testCourse.title)).toBeInTheDocument();
    });

    // Instructor initiates task creation workflow
    const createTaskButton = screen.getByTestId('button-create-task');
    fireEvent.click(createTaskButton);

    // Verify task creation interface is available
    expect(screen.getByTestId('task-creation-modal')).toBeInTheDocument();
    expect(screen.getByText('Modal is open')).toBeInTheDocument();

    // Verify educational workflow behavior (not modal implementation)
    const workflowVerification = courseBehavior.getWorkflowVerification();
    expect(workflowVerification.courseAccessed).toBe(true);
  });

  it('renders task details modal when clicking on a task', async () => {
    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText(testTasks[0].title)).toBeInTheDocument();
    });

    // Click on the first task
    fireEvent.click(screen.getByText(testTasks[0].title));

    // Check that task details modal is open with task title as heading
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
  });

  it('opens task edit modal from task details and saves changes', async () => {
    // Configure task editing behavior
    courseBehavior.configureTaskManagement(2, true);

    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText(testTasks[0].title)).toBeInTheDocument();
    });

    // Click on the first task to open details modal
    fireEvent.click(screen.getByText(testTasks[0].title));

    // Click Edit Task button
    fireEvent.click(screen.getByText('Edit Task'));

    // Verify edit modal is open
    await waitFor(() => {
      expect(screen.getByTestId('task-edit-modal')).toBeInTheDocument();
    });

    // Click save button in edit modal
    fireEvent.click(screen.getByTestId('save-task-button'));

    // Verify behavior-driven task interaction occurred
    await waitFor(() => {
      const workflowVerification = courseBehavior.getWorkflowVerification();
      expect(workflowVerification.courseAccessed).toBe(true);
      expect(mockNotify).toHaveBeenCalledWith('Task updated successfully', 'success');
    });
  });

  it('handles task update errors correctly', async () => {
    // Override the mock to simulate update failure
    const { updateTask } = await import('@/services/resources/learningTaskService');
    vi.mocked(updateTask).mockRejectedValue(new Error('Failed to update task'));

    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText(testTasks[0].title)).toBeInTheDocument();
    });

    // Click on the first task to open details modal
    fireEvent.click(screen.getByText(testTasks[0].title));

    // Click Edit Task button
    fireEvent.click(screen.getByText('Edit Task'));

    // Verify edit modal is open
    await waitFor(() => {
      expect(screen.getByTestId('task-edit-modal')).toBeInTheDocument();
    });

    // Click save button in edit modal
    fireEvent.click(screen.getByTestId('save-task-button'));

    // Verify error behavior occurred
    await waitFor(() => {
      expect(mockNotify).toHaveBeenCalledWith('Failed to update task', 'error');
    });
  });

  it('renders empty state when there are no tasks', async () => {
    // Configure empty task state
    courseBehavior.configureTaskManagement(0, true);

    // Override the mock to return empty tasks array
    const { modernLearningTaskService } = await import('@/services/resources/modernLearningTaskService');
    vi.mocked(modernLearningTaskService.getAllTasksByCourseId).mockResolvedValue([]);

    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(testCourse.title)).toBeInTheDocument();
    });

    // Check for empty state message
    expect(screen.getByText('No tasks available for this course.')).toBeInTheDocument();
    expect(screen.getByText('Create Your First Task')).toBeInTheDocument();
  });

  it('shows error state when course loading fails', async () => {
    // Override the mock to simulate course loading failure
    const { modernCourseService } = await import('@/services/resources/modernCourseService');
    vi.mocked(modernCourseService.getCourseDetails).mockRejectedValue(new Error('Course not found'));

    renderWithProviders(<InstructorCourseDetailPage />);

    // Wait for error state to render
    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
    });
  });
});
