import axios from 'axios';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {ApiService} from './apiService';

// Mock axiosConfig
vi.mock('./axiosConfig', () => {
    const mockAxiosInstance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
        interceptors: {
            request: {use: vi.fn(), eject: vi.fn()},
            response: {use: vi.fn(), eject: vi.fn()},
        },
        defaults: {},
    };

    return {
        __esModule: true,
        default: mockAxiosInstance,
    };
});

// Import das gemockte axiosInstance
import axiosInstance from './axiosConfig';

describe('ApiService', () => {
    let apiService: ApiService<any>;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        apiService = new ApiService();
        vi.clearAllMocks();
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('calls get and returns data', async () => {
        vi.mocked(axiosInstance.get).mockResolvedValueOnce({data: 'test-data'});
        const result = await apiService.get('/test');
        expect(axiosInstance.get).toHaveBeenCalledWith('/test');
        expect(result).toBe('test-data');
    });

    it('logs and throws on get error', async () => {
        const error = new Error('get error');
        vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);
        await expect(apiService.get('/fail')).rejects.toThrow('get error');
        expect(consoleErrorSpy).toHaveBeenCalledWith('GET request failed:', error);
    });

    it('calls post and returns data', async () => {
        vi.mocked(axiosInstance.post).mockResolvedValueOnce({data: 'post-data'});
        const result = await apiService.post('/test', {foo: 'bar'});
        expect(axiosInstance.post).toHaveBeenCalledWith('/test', {foo: 'bar'});
        expect(result).toBe('post-data');
    });

    it('logs and throws on post error', async () => {
        const error = new Error('post error');
        vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);
        await expect(apiService.post('/fail', {})).rejects.toThrow('post error');
        expect(consoleErrorSpy).toHaveBeenCalledWith('POST request failed:', error);
    });

    it('calls put and returns data', async () => {
        vi.mocked(axiosInstance.put).mockResolvedValueOnce({data: 'put-data'});
        const result = await apiService.put('/test', {foo: 'bar'});
        expect(axiosInstance.put).toHaveBeenCalledWith('/test', {foo: 'bar'});
        expect(result).toBe('put-data');
    });

    it('logs and throws on put error', async () => {
        const error = new Error('put error');
        vi.mocked(axiosInstance.put).mockRejectedValueOnce(error);
        await expect(apiService.put('/fail', {})).rejects.toThrow('put error');
        expect(consoleErrorSpy).toHaveBeenCalledWith('PUT request failed:', error);
    });

    it('calls delete and returns data', async () => {
        vi.mocked(axiosInstance.delete).mockResolvedValueOnce({data: 'delete-data'});
        const result = await apiService.delete('/test');
        expect(axiosInstance.delete).toHaveBeenCalledWith('/test');
        expect(result).toBe('delete-data');
    });

    it('logs and throws on delete error', async () => {
        const error = new Error('delete error');
        vi.mocked(axiosInstance.delete).mockRejectedValueOnce(error);
        await expect(apiService.delete('/fail')).rejects.toThrow('delete error');
        expect(consoleErrorSpy).toHaveBeenCalledWith('DELETE request failed:', error);
    });

    it('calls patch and returns data', async () => {
        vi.mocked(axiosInstance.patch).mockResolvedValueOnce({data: 'patch-data'});
        const result = await apiService.patch('/test', {foo: 'bar'});
        expect(axiosInstance.patch).toHaveBeenCalledWith('/test', {foo: 'bar'});
        expect(result).toBe('patch-data');
    });

    it('logs and throws on patch error', async () => {
        const error = new Error('patch error');
        vi.mocked(axiosInstance.patch).mockRejectedValueOnce(error);
        await expect(apiService.patch('/fail', {})).rejects.toThrow('patch error');
        expect(consoleErrorSpy).toHaveBeenCalledWith('PATCH request failed:', error);
    });
});
