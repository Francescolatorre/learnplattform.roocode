import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { login, register } from '../../../services/api';

// Mock the API functions
vi.mock('../../../services/api', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

// Mock navigation
const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form', () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Username or Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('submits login form with valid credentials', async () => {
    const mockLoginResponse = {
      user: { id: 1, username: 'testuser', email: 'test@example.com', role: 'user' },
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
    };

    (login as jest.Mock).mockResolvedValue(mockLoginResponse);

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username or Email/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('testuser', 'password123');
      expect(localStorage.getItem('access_token')).toBe('mock-access-token');
      expect(localStorage.getItem('refresh_token')).toBe('mock-refresh-token');
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error on login failure', async () => {
    (login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username or Email/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Login failed/i)).toBeInTheDocument();
    });
  });
});

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders register form', () => {
    render(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  it('submits register form with valid data', async () => {
    const mockRegisterResponse = {
      user: { id: 1, username: 'newuser', email: 'new@example.com', role: 'user' },
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
    };

    (register as jest.Mock).mockResolvedValue(mockRegisterResponse);

    render(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123',
          password2: 'password123',
          role: 'user',
        })
      );
      expect(localStorage.getItem('access_token')).toBe('mock-access-token');
      expect(localStorage.getItem('refresh_token')).toBe('mock-refresh-token');
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error on password mismatch', async () => {
    render(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'differentpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });
});
