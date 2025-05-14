import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {vi} from 'vitest';
import Dashboard from './DashboardPage';
import {fetchDashboardData} from '@services/resources/dashboardService';

vi.mock('@services/resources/dashboardService', () => ({
    fetchDashboardData: vi.fn(),
}));

beforeEach(() => {
    (fetchDashboardData as jest.Mock).mockResolvedValue({
        overall_stats: {
            courses_enrolled: 5,
            courses_completed: 3,
            overall_progress: 75,
            tasks_completed: 10,
            tasks_in_progress: 15,
        },
        courses: [
            {id: '1', title: 'Course 1', progress: 80, last_activity_date: '2025-05-14'},
            {id: '2', title: 'Course 2', progress: 60, last_activity_date: '2025-05-13'},
        ],
    });
});

const queryClient = new QueryClient();

describe('DashboardPage', () => {
    test('renders the dashboard title', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Dashboard />
            </QueryClientProvider>
        );
        const titleElement = screen.getByTestId('dashboard-title');
        expect(titleElement).toBeInTheDocument();
        expect(titleElement).toHaveTextContent('Student Dashboard');
    });

    test('displays loading spinner when data is loading', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Dashboard />
            </QueryClientProvider>
        );
        const loadingElement = screen.getByRole('progressbar');
        expect(loadingElement).toBeInTheDocument();
    });

    test('displays error message when there is an error', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Dashboard />
            </QueryClientProvider>
        );
        const errorElement = screen.getByText(/An error occurred while loading data/i);
        expect(errorElement).toBeInTheDocument();
    });

    test('renders enrolled courses statistics', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Dashboard />
            </QueryClientProvider>
        );
        const enrolledCoursesElement = screen.getByTestId('enrolled-courses');
        expect(enrolledCoursesElement).toBeInTheDocument();
    });
});
