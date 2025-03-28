import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import { login as apiLogin, logout as apiLogout, refreshAccessToken } from '../../../services/api';

vi.mock('../../services/api', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  refreshAccessToken: vi.fn(),
}));

const TestComponent: React.FC = () => {
  const { user, isAuthenticated, login, logout, refreshToken } = useAuth();

  return (
    <div>
      <p>User: {user ? user.username : 'None'}</p>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <button onClick={() => login('testuser', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={refreshToken}>Refresh Token</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize as unauthenticated', () => {
    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByText('User: None')).toBeInTheDocument();
    expect(getByText('Authenticated: No')).toBeInTheDocument();
  });

  it('should log in successfully', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      role: 'user',
      email: 'test@example.com',
      display_name: 'Test User',
    };
    (apiLogin as vi.Mock).mockResolvedValue({
      access: 'mockAccessToken',
      refresh: 'mockRefreshToken',
      user: mockUser,
    });

    const { getByText, getByRole } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByRole('button', { name: /login/i }).click();
    });

    expect(localStorage.getItem('access_token')).toBe('mockAccessToken');
    expect(localStorage.getItem('refresh_token')).toBe('mockRefreshToken');
    expect(localStorage.getItem('user_role')).toBe('user');
    expect(getByText(`User: ${mockUser.username}`)).toBeInTheDocument();
    expect(getByText('Authenticated: Yes')).toBeInTheDocument();
  });

  it('should log out successfully', async () => {
    localStorage.setItem('access_token', 'mockAccessToken');
    localStorage.setItem('refresh_token', 'mockRefreshToken');
    localStorage.setItem('user_role', 'user');

    const { getByText, getByRole } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByRole('button', { name: /logout/i }).click();
    });

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('user_role')).toBeNull();
    expect(getByText('User: None')).toBeInTheDocument();
    expect(getByText('Authenticated: No')).toBeInTheDocument();
  });

  it('should refresh token successfully', async () => {
    localStorage.setItem('refresh_token', 'mockRefreshToken');
    const mockUser = {
      id: 1,
      username: 'testuser',
      role: 'user',
      email: 'test@example.com',
      display_name: 'Test User',
    };
    (refreshAccessToken as vi.Mock).mockResolvedValue({
      access: 'newMockAccessToken',
      user: mockUser,
    });

    const { getByText, getByRole } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByRole('button', { name: /refresh token/i }).click();
    });

    expect(localStorage.getItem('access_token')).toBe('newMockAccessToken');
    expect(getByText(`User: ${mockUser.username}`)).toBeInTheDocument();
    expect(getByText('Authenticated: Yes')).toBeInTheDocument();
  });

  it('should handle token refresh failure and log out', async () => {
    localStorage.setItem('refresh_token', 'mockRefreshToken');
    (refreshAccessToken as vi.Mock).mockRejectedValue(new Error('Token refresh failed'));

    const { getByText, getByRole } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByRole('button', { name: /refresh token/i }).click();
    });

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('user_role')).toBeNull();
    expect(getByText('User: None')).toBeInTheDocument();
    expect(getByText('Authenticated: No')).toBeInTheDocument();
  });
});
