import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Profile from '../Profile';
import { mockedApiService } from '../../../setupTests'; // Use global mocks

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user profile', async () => {
    const mockUserProfile = {
      id: 1,
      username: 'testuser',
      email: 'testuser@example.com',
    };

    mockedApiService.getUserProfile.mockResolvedValue(mockUserProfile);

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/testuser/i)).toBeInTheDocument();
      expect(screen.getByText(/testuser@example.com/i)).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    mockedApiService.getUserProfile.mockRejectedValue(new Error('Failed to fetch user profile'));

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch user profile/i)).toBeInTheDocument();
    });
  });
});
