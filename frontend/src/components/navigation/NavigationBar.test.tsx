import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { IUser, UserRoleEnum } from '@/types/userTypes';
import { useAuthStore } from '@/store/modernAuthStore';

import NavigationBar from './NavigationBar';

// Mock the modern auth store
vi.mock('@/store/modernAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock menuConfig
vi.mock('@/config/menuConfig', () => ({
  menuConfig: [
    {
      text: 'Dashboard',
      path: '/dashboard',
      roles: [UserRoleEnum.STUDENT, UserRoleEnum.INSTRUCTOR],
      icon: null,
    },
    {
      text: 'Courses',
      path: '/courses',
      roles: [UserRoleEnum.STUDENT, UserRoleEnum.INSTRUCTOR],
      icon: null,
    },
    {
      text: 'Admin',
      path: '/admin',
      roles: [UserRoleEnum.INSTRUCTOR],
      icon: null,
    },
  ],
}));

const mockUser: IUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  role: UserRoleEnum.STUDENT,
  first_name: 'Test',
  last_name: 'User',
  is_active: true,
  date_joined: '2025-01-01T00:00:00Z',
};

const theme = createTheme();

const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={initialEntries}>
        <NavigationBar />
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe('NavigationBar', () => {
  const mockLogout = vi.fn();
  const mockAuthStore = {
    user: null,
    logout: mockLogout,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as unknown as Mock).mockReturnValue(mockAuthStore);
  });

  describe('when user is not authenticated', () => {
    it('shows login and register buttons', () => {
      renderWithRouter();

      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    it('shows app title without user info', () => {
      renderWithRouter();

      expect(screen.getByText('Learning Platform')).toBeInTheDocument();
      expect(screen.queryByText('testuser')).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated as student', () => {
    beforeEach(() => {
      (useAuthStore as unknown as Mock).mockReturnValue({
        ...mockAuthStore,
        user: mockUser,
        isAuthenticated: true,
      });
    });

    it('shows navigation menu items for student role', () => {
      renderWithRouter();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument(); // Student should not see admin
    });

    it('shows user info in header', () => {
      renderWithRouter();

      expect(screen.getByText('Learning Platform')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('shows role chip and logout button', () => {
      renderWithRouter();

      expect(screen.getByText('Role: student')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
      expect(screen.queryByText('Register')).not.toBeInTheDocument();
    });

    it('calls logout when logout button is clicked', async () => {
      renderWithRouter();

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });
    });

    it('highlights active menu item', () => {
      renderWithRouter(['/dashboard']);

      const dashboardButton = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardButton).toHaveStyle({ borderBottom: '2px solid' });
    });
  });

  describe('when user is authenticated as instructor', () => {
    beforeEach(() => {
      (useAuthStore as unknown as Mock).mockReturnValue({
        ...mockAuthStore,
        user: { ...mockUser, role: UserRoleEnum.INSTRUCTOR },
        isAuthenticated: true,
      });
    });

    it('shows all navigation menu items including admin', () => {
      renderWithRouter();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument(); // Instructor should see admin
    });

    it('shows instructor role in chip', () => {
      renderWithRouter();

      expect(screen.getByText('Role: instructor')).toBeInTheDocument();
    });
  });

  describe('responsive behavior', () => {
    it('renders navigation consistently across breakpoints', () => {
      (useAuthStore as unknown as Mock).mockReturnValue({
        ...mockAuthStore,
        user: mockUser,
        isAuthenticated: true,
      });

      renderWithRouter();

      // Core navigation elements should always be present
      expect(screen.getByText('Learning Platform')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  describe('user display name fallback', () => {
    it('shows display_name when available', () => {
      (useAuthStore as unknown as Mock).mockReturnValue({
        ...mockAuthStore,
        user: { ...mockUser, display_name: 'Test Display Name' },
        isAuthenticated: true,
      });

      renderWithRouter();

      expect(screen.getByText('Test Display Name')).toBeInTheDocument();
      expect(screen.queryByText('testuser')).not.toBeInTheDocument();
    });

    it('falls back to username when display_name is not available', () => {
      (useAuthStore as unknown as Mock).mockReturnValue({
        ...mockAuthStore,
        user: { ...mockUser, display_name: undefined },
        isAuthenticated: true,
      });

      renderWithRouter();

      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  describe('path matching', () => {
    beforeEach(() => {
      (useAuthStore as unknown as Mock).mockReturnValue({
        ...mockAuthStore,
        user: mockUser,
        isAuthenticated: true,
      });
    });

    it('matches dashboard paths correctly', () => {
      renderWithRouter(['/student/dashboard']);

      const dashboardButton = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardButton).toHaveStyle({ borderBottom: '2px solid' });
    });

    it('matches course paths and sub-paths', () => {
      renderWithRouter(['/courses/123']);

      const coursesButton = screen.getByRole('link', { name: /courses/i });
      expect(coursesButton).toHaveStyle({ borderBottom: '2px solid' });
    });

    it('does not match partial paths incorrectly', () => {
      renderWithRouter(['/coursesdetail']); // Should not match /courses

      const coursesButton = screen.getByRole('link', { name: /courses/i });
      expect(coursesButton).not.toHaveStyle({ borderBottom: '2px solid' });
    });
  });
});