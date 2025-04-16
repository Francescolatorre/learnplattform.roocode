import {describe, it, expect, vi, beforeEach} from 'vitest';

import {enrollmentService} from './enrollmentService';

vi.mock('../api/apiService', () => {
    const mockGet = vi.fn();
    const mockPost = vi.fn();
    const mockPut = vi.fn();
    const mockDelete = vi.fn();
    Object.assign(globalThis, {mockGet, mockPost, mockPut, mockDelete});
    /**
     *
     */
    class MockApiService {
        get = mockGet;
        post = mockPost;
        put = mockPut;
        delete = mockDelete;
    }
    return {
        ApiService: MockApiService,
        __esModule: true,
    };
});

vi.mock('../api/apiConfig', () => ({
    API_CONFIG: {
        enrollments: {
            list: '/enrollments/',
            details: (id: string | number) => `/enrollments/${id}/`,
            create: '/enrollments/create/',
            update: (id: string | number) => `/enrollments/${id}/update/`,
            delete: (id: string | number) => `/enrollments/${id}/delete/`,
            userEnrollments: '/enrollments/user/',
            enroll: '/enrollments/enroll/',
            unenroll: (id: string | number) => `/enrollments/${id}/unenroll/`,
            byCourse: (courseId: string | number) => `/enrollments/course/${courseId}/`,
        }
    }
}));

describe('enrollmentService', () => {
    let mockGet: any, mockPost: any, mockPut: any, mockDelete: any;
    beforeEach(() => {
        mockGet = (globalThis as any).mockGet;
        mockPost = (globalThis as any).mockPost;
        mockPut = (globalThis as any).mockPut;
        mockDelete = (globalThis as any).mockDelete;
        vi.clearAllMocks();
    });

    it('getAll calls apiService.get with correct endpoint', async () => {
        mockGet.mockResolvedValueOnce([{id: 1}]);
        const result = await enrollmentService.getAll();
        expect(mockGet).toHaveBeenCalledWith('/enrollments/');
        expect(result).toEqual([{id: 1}]);
    });

    it('getById calls apiService.get with correct endpoint', async () => {
        mockGet.mockResolvedValueOnce({id: 1});
        const result = await enrollmentService.getById(1);
        expect(mockGet).toHaveBeenCalledWith('/enrollments/1/');
        expect(result).toEqual({id: 1});
    });

    it('create calls apiService.post and returns created enrollment', async () => {
        mockPost.mockResolvedValueOnce({id: 2});
        const result = await enrollmentService.create({course: 1});
        expect(mockPost).toHaveBeenCalledWith('/enrollments/create/', {course: 1});
        expect(result).toEqual({id: 2});
    });

    it('update calls apiService.put and returns updated enrollment', async () => {
        mockPut.mockResolvedValueOnce({id: 1, course: 1});
        const result = await enrollmentService.update(1, {course: 1});
        expect(mockPut).toHaveBeenCalledWith('/enrollments/1/update/', {course: 1});
        expect(result).toEqual({id: 1, course: 1});
    });

    it('delete calls apiService.delete', async () => {
        mockDelete.mockResolvedValueOnce(undefined);
        await enrollmentService.delete(1);
        expect(mockDelete).toHaveBeenCalledWith('/enrollments/1/delete/');
    });

    it('fetchUserEnrollments calls apiService.get', async () => {
        mockGet.mockResolvedValueOnce([{id: 1}]);
        const result = await enrollmentService.fetchUserEnrollments();
        expect(mockGet).toHaveBeenCalledWith('/enrollments/user/');
        expect(result).toEqual([{id: 1}]);
    });

    it('enrollInCourse calls apiService.post', async () => {
        mockPost.mockResolvedValueOnce({id: 3});
        const result = await enrollmentService.enrollInCourse(1);
        expect(mockPost).toHaveBeenCalledWith('/enrollments/enroll/', {course: 1});
        expect(result).toEqual({id: 3});
    });

    it('unenrollFromCourse calls apiService.delete', async () => {
        mockDelete.mockResolvedValueOnce(undefined);
        await enrollmentService.unenrollFromCourse(1);
        expect(mockDelete).toHaveBeenCalledWith('/enrollments/1/unenroll/');
    });

    it('fetchEnrolledStudents calls apiService.get', async () => {
        mockGet.mockResolvedValueOnce([{id: 1}]);
        const result = await enrollmentService.fetchEnrolledStudents(1);
        expect(mockGet).toHaveBeenCalledWith('/enrollments/course/1/');
        expect(result).toEqual([{id: 1}]);
    });

    it('findByFilter calls apiService.get with query params', async () => {
        mockGet.mockResolvedValueOnce([{id: 1}]);
        const result = await enrollmentService.findByFilter({course: 1, user: 2});
        expect(mockGet).toHaveBeenCalledWith('/enrollments/?course=1&user=2');
        expect(result).toEqual([{id: 1}]);
    });
});
