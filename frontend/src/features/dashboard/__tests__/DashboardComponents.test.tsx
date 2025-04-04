import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Dashboard from '../pages/Dashboard';
import { mockedApiService } from '../../../setupTests'; // Use global mocks

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user dashboard with courses', async () => {
    const mockDashboardData = {
      user: { id: 1, username: 'testuser' },
      courses: [
        { id: 1, title: 'Course 1' },
        { id: 2, title: 'Course 2' },
      ],
    };

    mockedApiService.getDashboard.mockResolvedValue(mockDashboardData);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome, testuser/i)).toBeInTheDocument();
      expect(screen.getByText(/Course 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Course 2/i)).toBeInTheDocument();
    });
  });
});
