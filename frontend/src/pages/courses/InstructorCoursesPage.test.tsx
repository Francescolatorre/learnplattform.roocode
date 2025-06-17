import {render, screen, act, waitFor} from '@testing-library/react';
import {BrowserRouter as Router} from 'react-router-dom';
import InstructorCoursesPage from './InstructorCoursesPage';
import {ErrorProvider} from '@/components/Notifications/ErrorProvider';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useAuth} from '@/context/auth/AuthContext';
import {courseService} from '@/services/resources/courseService';
import {fireEvent} from '@testing-library/react';
import {vi} from 'vitest';

describe('InstructorCoursesPage', () => {
    const mockUser = {id: '1', role: 'instructor'};
    const mockCoursesData = {
        results: [{id: 'course1', name: 'Course 1'}, {id: 'course2', name: 'Course 2'}],
        count: 2,
        next: null,
        previous: null,
    };

    beforeEach(() => {
        (useAuth as vi.Mock).mockReturnValue({user: mockUser}); // Mock user only
        (courseService.fetchInstructorCourses as jest.Mock).mockResolvedValue(mockCoursesData);
    });

    const renderComponent = () => {
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <ErrorProvider>
                    <InstructorCoursesPage />
                </ErrorProvider>
            </QueryClientProvider>
        );
    };

    it('renders without crashing', () => {
        renderComponent();
        expect(screen.getByText(/Manage Courses/i)).toBeInTheDocument();
    });

    it('renders loading indicator while fetching courses', async () => {
        renderComponent();
        await waitFor(() => expect(screen.getByText(/Loading/i)).toBeInTheDocument());
    });

    it('displays courses when fetched successfully', async () => {
        renderComponent();
        await waitFor(() => expect(screen.findByText(/Course 1/i)).toBeInTheDocument());
        await waitFor(() => expect(screen.findByText(/Course 2/i)).toBeInTheDocument());
    });

    it('handles error during course fetch', async () => {
        (courseService.fetchInstructorCourses as jest.Mock).mockRejectedValue(new Error('Fetch error'));
        renderComponent();
        await waitFor(() => expect(screen.findByText(/Failed to load your courses/i)).toBeInTheDocument());
    });

    it('switches view mode', async () => {
        renderComponent();
        const viewModeSelector = await screen.findByTestId('view-mode-selector');
        fireEvent.click(viewModeSelector);
        await waitFor(() => expect(screen.getByText(/List View/i)).toBeInTheDocument());
    });

    it('handles pagination', async () => {
        renderComponent();
        const paginationControls = await screen.findByTestId('pagination-controls');
        fireEvent.click(paginationControls);
        await waitFor(() => expect(screen.getByText(/Page 2/i)).toBeInTheDocument());
    });

    it('displays no courses message when no courses are available', async () => {
        (courseService.fetchInstructorCourses as jest.Mock).mockResolvedValue({results: [], count: 0});
        renderComponent();
        await waitFor(() => expect(screen.findByText(/No courses available/i)).toBeInTheDocument());
    });
});
