import {vi} from 'vitest';
vi.mock('@/services/api/apiService', () => {
    const mockGet = vi.fn();
    const mockPost = vi.fn();
    const mockPut = vi.fn();
    const mockPatch = vi.fn();
    const mockDelete = vi.fn();
    Object.assign(globalThis, {mockGet, mockPost, mockPut, mockPatch, mockDelete});
    /**
     *
     */
    class MockApiService {
        get = async (...args: any[]) => {
            try {
                return await mockGet(...args);
            } catch (error) {
                console.error('GET request failed:', error);
                throw error;
            }
        };
        post = mockPost;
        put = mockPut;
        patch = mockPatch;
        delete = mockDelete;
    }
    return {
        ApiService: MockApiService,
        __esModule: true,
    };
});
import {describe, it, expect, beforeEach} from 'vitest';

import type {ICourse, TCourseStatus} from '@/types/course';
import type {IPaginatedResponse} from '@/types/paginatedResponse';

import {courseService} from './courseService';

const mockCourse: ICourse = {
    id: 1,
    title: 'Test Course',
    description: 'A test course',
    version: 1,
    status: 'published',
    visibility: 'public',
    learning_objectives: 'Learn testing',
    prerequisites: 'None',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    category: 'Testing',
    difficulty_level: 'Beginner',
};

const mockPaginatedResponse: IPaginatedResponse<ICourse> = {
    count: 1,
    next: null,
    previous: null,
    results: [mockCourse]
};

describe('courseService', () => {
    let mockGet: any, mockPost: any, mockPatch: any, mockDelete: any;
    beforeEach(() => {
        mockGet = (globalThis as any).mockGet;
        mockPost = (globalThis as any).mockPost;
        mockPatch = (globalThis as any).mockPatch;
        mockDelete = (globalThis as any).mockDelete;
        vi.clearAllMocks();
    });

    it('fetchCourses calls apiService.get with correct endpoint and returns data', async () => {
        mockGet.mockResolvedValueOnce(mockPaginatedResponse);
        const result = await courseService.fetchCourses({page: 1, search: 'Test'});
        expect(mockGet).toHaveBeenCalled();
        expect(result).toEqual(mockPaginatedResponse);
    });

    it('fetchCourses throws and logs error on failure', async () => {
        const error = new Error('API error');
        mockGet.mockRejectedValueOnce(error);
        const spy = vi.spyOn(console, 'error').mockImplementation(() => { });
        await expect(courseService.fetchCourses({page: 1})).rejects.toThrow('API error');
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });

    it('createCourse calls apiService.post and returns data', async () => {
        mockPost.mockResolvedValueOnce(mockCourse);
        const result = await courseService.createCourse({title: 'Test Course'});
        expect(mockPost).toHaveBeenCalled();
        expect(result).toEqual(mockCourse);
    });
    it('createCourse sends both title and description in the payload', async () => {
        const payload = {title: 'Test Course', description: 'A test course description'};
        mockPost.mockResolvedValueOnce({...mockCourse, ...payload});
        const result = await courseService.createCourse(payload);
        expect(mockPost).toHaveBeenCalledWith(expect.any(String), payload);
        expect(result.title).toBe(payload.title);
        expect(result.description).toBe(payload.description);
    });

    it('getCourseDetails returns course if found', async () => {
        mockGet.mockResolvedValueOnce(mockCourse);
        const result = await courseService.getCourseDetails('1');
        expect(mockGet).toHaveBeenCalled();
        expect(result).toEqual(mockCourse);
    });

    it('getCourseDetails throws if not found', async () => {
        mockGet.mockResolvedValueOnce(undefined);
        await expect(courseService.getCourseDetails('999')).rejects.toThrow('Course not found');
    });

    it('updateCourse calls apiService.patch and returns data', async () => {
        mockPatch.mockResolvedValueOnce(mockCourse);
        const result = await courseService.updateCourse('1', {title: 'Updated'});
        expect(mockPatch).toHaveBeenCalled();
        expect(result).toEqual(mockCourse);
    });

    it('deleteCourse calls apiService.delete', async () => {
        mockDelete.mockResolvedValueOnce(undefined);
        await courseService.deleteCourse('1');
        expect(mockDelete).toHaveBeenCalled();
    });

    it('fetchInstructorCourses calls apiService.get and returns data', async () => {
        mockGet.mockResolvedValueOnce(mockPaginatedResponse);
        const result = await courseService.fetchInstructorCourses();
        expect(mockGet).toHaveBeenCalled();
        expect(result).toEqual(mockPaginatedResponse);
    });

    it('updateCourseStatus calls apiService.patch and returns data', async () => {
        mockPatch.mockResolvedValueOnce(mockCourse);
        const result = await courseService.updateCourseStatus('1', 'published' as TCourseStatus);
        expect(mockPatch).toHaveBeenCalled();
        expect(result).toEqual(mockCourse);
    });

    it('archiveCourse calls updateCourseStatus with "archived"', async () => {
        const spy = vi.spyOn(courseService, 'updateCourseStatus').mockResolvedValueOnce(mockCourse);
        const result = await courseService.archiveCourse('1');
        expect(spy).toHaveBeenCalledWith('1', 'archived');
        expect(result).toEqual(mockCourse);
        spy.mockRestore();
    });

    it('publishCourse calls updateCourseStatus with "published"', async () => {
        const spy = vi.spyOn(courseService, 'updateCourseStatus').mockResolvedValueOnce(mockCourse);
        const result = await courseService.publishCourse('1');
        expect(spy).toHaveBeenCalledWith('1', 'published');
        expect(result).toEqual(mockCourse);
        spy.mockRestore();
    });

    it('fetchCourseProgress calls apiService.get', async () => {
        mockGet.mockResolvedValueOnce({progress: 50});
        const result = await courseService.fetchCourseProgress('1');
        expect(mockGet).toHaveBeenCalled();
        expect(result).toEqual({progress: 50});
    });

    it('getCourseTasks calls apiService.get', async () => {
        mockGet.mockResolvedValueOnce([{id: 1, title: 'Task'}]);
        const result = await courseService.getCourseTasks('1');
        expect(mockGet).toHaveBeenCalled();
        expect(result).toEqual({count: 1, next: null, previous: null, results: [{id: 1, title: 'Task'}]});
    });
});

describe('CourseService.enrollStudent', () => {
    const mockPost = (globalThis as any).mockPost;

    beforeEach(() => {
        mockPost.mockClear();
    });

    it('should POST to the enrollments endpoint with correct body and return response', async () => {
        const courseId = 123;
        const studentId = 456;
        const mockResponse = {id: 1, course: courseId, student: studentId, status: 'enrolled'};
        mockPost.mockResolvedValueOnce(mockResponse);

        const result = await courseService.enrollStudent(courseId, studentId);

        expect(mockPost).toHaveBeenCalledWith(
            '/api/v1/enrollments/',
            {course: courseId, student: studentId}
        );
        expect(result).toEqual(mockResponse);
    });

    it('should throw if the API call fails', async () => {
        const courseId = 123;
        const studentId = 456;
        const error = new Error('API error');
        mockPost.mockRejectedValueOnce(error);

        await expect(courseService.enrollStudent(courseId, studentId)).rejects.toThrow('API error');
    });
});
