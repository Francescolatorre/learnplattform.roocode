declare const mockAxiosInstance: any;
import {describe, it, expect, afterEach, vi} from 'vitest';

// Use the global mockAxiosInstance from setupTests.ts for axios mocking
import authService from './authService';

describe('authService', () => {

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('login', () => {
        it('should post credentials and return tokens', async () => {
            const mockData = {access: 'access-token', refresh: 'refresh-token'};
            mockAxiosInstance.post.mockResolvedValueOnce({data: mockData});

            const result = await authService.login('user', 'pass');
            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login/', {username: 'user', password: 'pass'});
            expect(result).toEqual(mockData);
        });

        it('should throw on error', async () => {
            mockAxiosInstance.post.mockRejectedValueOnce(new Error('login failed'));
            await expect(authService.login('user', 'pass')).rejects.toThrow('login failed');
        });
    });

    describe('logout', () => {
        it('should post refresh token and return void', async () => {
            mockAxiosInstance.post.mockResolvedValueOnce({data: undefined});

            await expect(authService.logout('refresh', 'access')).resolves.toBeUndefined();
            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/auth/logout/',
                {refresh: 'refresh'},
                {headers: {Authorization: 'Bearer access'}}
            );
        });

        it('should throw on error', async () => {
            mockAxiosInstance.post.mockRejectedValueOnce(new Error('fail'));
            await expect(authService.logout('refresh', 'access')).rejects.toThrow('fail');
        });
    });

    describe('refreshToken', () => {
        it('should post refresh token and return new access token', async () => {
            const mockData = {access: 'new-access'};
            mockAxiosInstance.post.mockResolvedValueOnce({data: mockData});

            const result = await authService.refreshToken('refresh');
            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/token/refresh/', {refresh: 'refresh'});
            expect(result).toEqual(mockData);
        });

        it('should throw on error', async () => {
            mockAxiosInstance.post.mockRejectedValueOnce({response: {data: 'fail'}, message: 'fail'});
            await expect(authService.refreshToken('refresh')).rejects.toBeDefined();
        });
    });

    describe('register', () => {
        it('should post registration data and return login response', async () => {
            const data = {username: 'u', email: 'e', password: 'p', password2: 'p'};
            const mockData = {user: {refresh: 'r'}, access: 'a', refresh: 'r'};
            mockAxiosInstance.post.mockResolvedValueOnce({data: mockData});

            const result = await authService.register(data);
            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register/', {...data, role: 'user'});
            expect(result).toEqual(mockData);
        });

        it('should throw on error', async () => {
            const data = {username: 'u', email: 'e', password: 'p', password2: 'p'};
            mockAxiosInstance.post.mockRejectedValueOnce(new Error('register failed'));
            await expect(authService.register(data)).rejects.toThrow('register failed');
        });
    });

    describe('requestPasswordReset', () => {
        it('should post email and return response', async () => {
            const mockData = {detail: 'sent'};
            mockAxiosInstance.post.mockResolvedValueOnce({data: mockData});

            const result = await authService.requestPasswordReset('mail@example.com');
            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/password-reset/', {email: 'mail@example.com'});
            expect(result).toEqual(mockData);
        });

        it('should throw on error', async () => {
            mockAxiosInstance.post.mockRejectedValueOnce(new Error('reset request failed'));
            await expect(authService.requestPasswordReset('mail@example.com')).rejects.toThrow('reset request failed');
        });
    });

    describe('resetPassword', () => {
        it('should post token and new password and return response', async () => {
            const mockData = {detail: 'reset'};
            mockAxiosInstance.post.mockResolvedValueOnce({data: mockData});

            const result = await authService.resetPassword('token', 'newpass');
            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/password-reset/confirm/', {
                token: 'token',
                new_password: 'newpass',
            });
            expect(result).toEqual(mockData);
        });

        it('should throw on error', async () => {
            mockAxiosInstance.post.mockRejectedValueOnce(new Error('reset failed'));
            await expect(authService.resetPassword('token', 'newpass')).rejects.toThrow('reset failed');
        });
    });

    describe('getUserProfile', () => {
        it('should get user profile with access token', async () => {
            const mockData = {id: 1, username: 'u', email: 'e', role: 'user'};
            mockAxiosInstance.get.mockResolvedValueOnce({data: mockData});

            const result = await authService.getUserProfile('access');
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/profile/', {
                headers: {Authorization: 'Bearer access'},
            });
            expect(result).toEqual(mockData);
        });

        it('should throw on error', async () => {
            mockAxiosInstance.get.mockRejectedValueOnce(new Error('fail'));
            await expect(authService.getUserProfile('access')).rejects.toThrow('fail');
        });
    });
});
