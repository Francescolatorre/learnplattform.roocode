import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import LoginForm from '../components/LoginForm';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import RegisterForm from '../components/RegisterForm';
import { mockedUsedNavigate, mockedApiService } from '../../../setupTests'; // Use global mocks
import { mockedLogin, mockedLogout, mockedRefreshAccessToken } from '../../../setupTests'; // Import mocked functions

const mockAuthService = {
  ...mockedApiService,
  mockedLogin,
  mockedLogout,
  mockedRefreshAccessToken,
  register: jest.fn(), // Add missing mock for 'register'
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <LoginForm />,
        },
      ],
      {
        initialEntries: ['/'],
        future: { v7_startTransition: true, v7_relativeSplatPath: true } as any,
      } // Added type assertion
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByLabelText(/Username or Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('submits login form with valid credentials', async () => {
    const mockLoginResponse = {
      access: 'mockAccessToken',
      refresh: 'mockRefreshToken',
    };
    mockedLogin.mockResolvedValue(mockLoginResponse);

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <LoginForm />,
        },
      ],
      { initialEntries: ['/'] }
    );

    render(<RouterProvider router={router} />);

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/Username or Email/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    // Wait for the mocked login function to be called
    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith('testuser', 'password123');
      expect(localStorage.getItem('access_token')).toBe('mockAccessToken');
      expect(localStorage.getItem('refresh_token')).toBe('mockRefreshToken');
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error on login failure', async () => {
    mockedLogin.mockRejectedValue(new Error('Invalid credentials'));

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <LoginForm />,
        },
      ],
      { initialEntries: ['/'] }
    );

    render(<RouterProvider router={router} />);

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/Username or Email/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpassword' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Login failed/i)).toBeInTheDocument();
    });
  });
});

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.skip('renders register form', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <RegisterForm />,
        },
      ],
      {
        initialEntries: ['/'],
        future: { v7_startTransition: true, v7_relativeSplatPath: true } as any,
      } // Added type assertion
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it.skip('submits register form with valid data', async () => {
    const mockRegisterResponse = { success: true };
    mockedApiService.register.mockResolvedValue(mockRegisterResponse);

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <RegisterForm />,
        },
      ],
      {
        initialEntries: ['/'],
        future: { v7_startTransition: true, v7_relativeSplatPath: true } as any,
      } // Added type assertion
    );

    render(<RouterProvider router={router} />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(mockedApiService.register).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it.skip('shows error on password mismatch', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <RegisterForm />,
        },
      ],
      {
        initialEntries: ['/'],
        future: { v7_startTransition: true, v7_relativeSplatPath: true } as any,
      } // Added type assertion
    );

    render(<RouterProvider router={router} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'password456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });
});
