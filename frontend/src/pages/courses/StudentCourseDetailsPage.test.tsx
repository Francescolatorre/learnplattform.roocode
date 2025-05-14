import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {vi} from 'vitest';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import StudentCourseDetailsPage from './StudentCourseDetailsPage';
import {courseService} from '@/services/resources/courseService';
import {enrollmentService} from '@/services/resources/enrollmentService';
import {AuthContext} from '@/context/auth/AuthContext';

// Mock the services
vi.mock('@/services/resources/courseService');
vi.mock('@/services/resources/enrollmentService');
vi.mock('@/components/ErrorNotifier/useErrorNotifier', () => ({
    useNotification: vi.fn()
}));

const mockCourse = {
    id: '1',
    title: 'Test Course',
    description: 'Test Description',
    isEnrolled: true,
    isCompleted: false
};

const mockTasks = {
    count: 2,
    results: [
        {id: '1', title: 'Task 1', description: 'Task 1 Description'},
        {id: '2', title: 'Task 2', description: 'Task 2 Description'}
    ]
};

const mockEnrollmentStatus = {
    enrolled: true,
    completed: false
};

describe('StudentCourseDetailsPage', () => {
    const queryClient = new QueryClient();

    beforeEach(() => {
        vi.clearAllMocks();
        (courseService.getCourseDetails as jest.Mock).mockResolvedValue(mockCourse);
        (courseService.getCourseTasks as jest.Mock).mockResolvedValue(mockTasks);
        (enrollmentService.getEnrollmentStatus as jest.Mock).mockResolvedValue(mockEnrollmentStatus);
    });

    const renderComponent = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <AuthContext.Provider value={{isAuthenticated: true, user: {id: '1'}}}>
                    <MemoryRouter initialEntries={['/courses/1']}>
                        <Routes>
                            <Route path="/courses/:courseId" element={<StudentCourseDetailsPage />} />
                        </Routes>
                    </MemoryRouter>
                </AuthContext.Provider>
            </QueryClientProvider>
        );
    };

    it('displays tasks when user is enrolled', async () => {
        renderComponent();

        // Verify course details are loaded
        await waitFor(() => {
            expect(screen.getByText('Test Course')).toBeInTheDocument();
        });

        // Verify tasks are displayed
        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
        });
    });

    it('does not display tasks when user is not enrolled', async () => {
        // Mock unenrolled state
        (courseService.getCourseDetails as jest.Mock).mockResolvedValue({...mockCourse, isEnrolled: false});
        (enrollmentService.getEnrollmentStatus as jest.Mock).mockResolvedValue({enrolled: false, completed: false});

        renderComponent();

        // Verify course details are loaded
        await waitFor(() => {
            expect(screen.getByText('Test Course')).toBeInTheDocument();
        });

        // Verify tasks are not displayed but enroll message is shown
        await waitFor(() => {
            expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
            expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
            expect(screen.getByText(/Enroll in this course to access learning tasks/i)).toBeInTheDocument();
        });
    });
});
