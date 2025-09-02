import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { AuthProvider } from '@context/auth/AuthContext';
import { fetchDashboardData } from '@services/resources/dashboardService';

import Dashboard from '../DashboardPage';

// Mock the dashboard service
vi.mock('@services/resources/dashboardService', () => ({
  fetchDashboardData: vi.fn(),
}));

// Mock the auth context
vi.mock('@context/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', username: 'testuser', display_name: 'Test User', role: 'student' },
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Dashboard Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  it('displays course titles correctly', async () => {
    // Mock API response with course_title field
    const mockDashboardData = {
      user_info: {
        id: '1',
        username: 'testuser',
        display_name: 'Test User',
        role: 'student',
      },
      overall_stats: {
        courses_enrolled: 2,
        courses_completed: 1,
        overall_progress: 50,
        tasks_completed: 5,
        tasks_in_progress: 10,
        tasks_overdue: 0,
      },
      courses: [
        {
          id: '1',
          course_id: 101,
          course_title: 'Introduction to Python Programming',
          progress: 75,
          status: 'active',
          enrolled_date: '2025-05-08T13:39:42.910075Z',
          last_activity_date: '2025-06-25T12:32:00.735840Z',
        },
        {
          id: '2',
          course_id: 102,
          course_title: 'Web Development with Django',
          progress: 25,
          status: 'active',
          enrolled_date: '2025-05-14T06:56:37.126807Z',
          last_activity_date: '2025-06-16T15:40:11.607503Z',
        },
      ],
      progress: {
        overall_progress: 50,
        total_tasks: 10,
        completed_tasks: 5,
      },
      quiz_performance: {
        average_score: 85,
        total_attempts: 3,
      },
      recent_activity: [],
    };

    // Setup the mock to return our test data
    (fetchDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

    // Render the component with necessary providers
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(fetchDashboardData).toHaveBeenCalledWith('1');
    });

    // Check if course titles are displayed correctly
    await waitFor(() => {
      expect(screen.getByText('Introduction to Python Programming')).toBeInTheDocument();
      expect(screen.getByText('Web Development with Django')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    // Setup the mock to delay response
    (fetchDashboardData as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({}), 100))
    );

    // Render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Check if loading spinner is displayed
    expect(screen.getByTestId('dashboard-loading-spinner')).toBeInTheDocument();
  });

  it('shows error state when API call fails', async () => {
    // Setup the mock to reject
    (fetchDashboardData as jest.Mock).mockRejectedValue(new Error('Failed to fetch data'));

    // Render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-error-alert')).toBeInTheDocument();
      expect(screen.getByText(/Failed to fetch data/i)).toBeInTheDocument();
    });
  });
});
