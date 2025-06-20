import {render, screen, act, waitFor} from '@testing-library/react';
import {BrowserRouter as Router} from 'react-router-dom';
import InstructorCoursesPage from './InstructorCoursesPage';
import {NotificationProvider} from '@/components/Notifications/NotificationProvider';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {vi} from 'vitest';
import {courseService} from '@/services/resources/courseService';
import {fireEvent} from '@testing-library/react';

vi.mock('@/services/resources/courseService', () => ({
    courseService: {fetchInstructorCourses: vi.fn()},
}));

// Provide a controllable mock for useAuth
vi.mock('@/context/auth/AuthContext', () => ({useAuth: vi.fn()}));
import {useAuth} from '@/context/auth/AuthContext';

describe('InstructorCoursesPage', () => {
    const mockUser = {id: '1', role: 'instructor'};
    const mockCoursesData = {
        results: [{id: 'course1', name: 'Course 1'}, {id: 'course2', name: 'Course 2'}],
        count: 2,
        next: null,
        previous: null,
    };

    beforeEach(() => {
        (useAuth as vi.Mock).mockReturnValue({user: mockUser});
        (courseService.fetchInstructorCourses as vi.Mock).mockResolvedValue(mockCoursesData);
    });

    const renderComponent = () => {
        const queryClient = new QueryClient();
        render(
            <Router>
                <QueryClientProvider client={queryClient}>
                    <NotificationProvider>
                        <InstructorCoursesPage />
                    </NotificationProvider>
                </QueryClientProvider>
            </Router>
        );
    };

    it('renders without crashing', () => {
        renderComponent();
        expect(screen.getByText(/Manage Courses/i)).toBeInTheDocument();
    });

    it('renders loading indicator while fetching courses', async () => {
        renderComponent();
        await screen.findByText(/Loading/i);
    });

    it('displays courses when fetched successfully', async () => {
        renderComponent();
        expect(await screen.findByText(/Course 1/i)).toBeInTheDocument();
        expect(await screen.findByText(/Course 2/i)).toBeInTheDocument();
    });

    it('handles error during course fetch', async () => {
        (courseService.fetchInstructorCourses as vi.Mock).mockRejectedValue(new Error('Fetch error'));
        renderComponent();
        expect(await screen.findByText(/Failed to load your courses/i)).toBeInTheDocument();
    });

    it('switches view mode', async () => {
        renderComponent();
        const viewModeSelector = await screen.findByTestId('view-mode-selector');
        fireEvent.click(viewModeSelector);
        expect(await screen.findByText(/List View/i)).toBeInTheDocument();
    });

    it('handles pagination', async () => {
        renderComponent();
        const paginationControls = await screen.findByTestId('pagination-controls');
        fireEvent.click(paginationControls);
        expect(await screen.findByText(/Page 2/i)).toBeInTheDocument();
    });

    it('displays no courses message when no courses are available', async () => {
        (courseService.fetchInstructorCourses as vi.Mock).mockResolvedValue({results: [], count: 0});
        renderComponent();
        expect(await screen.findByText(/No courses available/i)).toBeInTheDocument();
    });
});
