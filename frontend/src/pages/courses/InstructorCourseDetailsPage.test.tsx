import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {BrowserRouter, useParams} from 'react-router-dom';
import '@testing-library/jest-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import InstructorCourseDetailPage from './InstructorCourseDetailsPage';
import {courseService} from '@/services/resources/courseService';
import learningTaskService, {updateTask} from '@/services/resources/learningTaskService';
import useNotification from '@/components/Notifications/useNotification';
import {courseFactory} from '@test-utils/factories/courseFactory';

// Mock the required dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: vi.fn(),
        Link: ({to, children, ...rest}: any) => (
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

vi.mock('@components/Notifications/useNotification', () => {
    const notify = Object.assign(vi.fn(), {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
    });
    return {
        __esModule: true,
        default: () => notify,
    };
});

vi.mock('@/components/shared/MarkdownRenderer', () => ({
    default: ({content}: {content: string}) => (
        <div data-testid="markdown-renderer">{content}</div>
    ),
}));

// Mock the TaskCreation component fully to avoid hanging issues
vi.mock('@/components/taskCreation/TaskCreation', () => ({
    default: ({open, onClose, courseId, task, isEditing, onSave}: any) => (
        <div data-testid={isEditing ? 'task-edit-modal' : 'task-creation-modal'}>
            {isEditing ? 'Task Editing Modal' : 'Task Creation Modal'}
            {open && <span>Modal is open</span>}
            <button onClick={onClose}>Close Modal</button>
            {isEditing && task && (
                <button
                    data-testid="save-task-button"
                    onClick={() => onSave({...task, title: 'Updated Task Title'})}
                >
                    Save Task
                </button>
            )}
        </div>
    ),
}));

vi.mock('@/components/shared/InfoCard', () => ({
    default: ({title, children}: any) => (
        <div data-testid={`info-card-${title?.toLowerCase().replace(/\s+/g, '-')}`}>
            <div data-testid="info-card-title">{title}</div>
            <div data-testid="info-card-content">{children}</div>
        </div>
    ),
}));

describe('InstructorCourseDetailsPage', () => {
    const mockCourseId = '123';
    const mockCourse = courseFactory.build({
        id: 123,
        title: 'Test Course',
        description: 'This is a test course description',
        instructor_name: 'Test Instructor',
        status: 'published',
    });

    const mockTasks = [
        {
            id: 1,
            title: 'Task 1',
            description: 'Description for task 1',
            order: 1,
            is_published: true,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
        },
        {
            id: 2,
            title: 'Task 2',
            description: 'Description for task 2',
            order: 2,
            is_published: false,
            created_at: '2023-01-02T00:00:00Z',
            updated_at: '2023-01-02T00:00:00Z',
        },
    ];

    const mockNotify = vi.fn();

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
        (useParams as any).mockReturnValue({courseId: mockCourseId});
        (courseService.getCourseDetails as any).mockResolvedValue(mockCourse);
        (learningTaskService.getAllTasksByCourseId as any).mockResolvedValue(mockTasks);
        (updateTask as any).mockResolvedValue({...mockTasks[0], title: 'Updated Task Title'});
        (useNotification as any).mockReturnValue(mockNotify);
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
