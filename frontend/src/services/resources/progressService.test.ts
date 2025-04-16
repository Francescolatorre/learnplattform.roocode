import {describe, it, expect, vi, beforeEach} from 'vitest';

import {progressService} from './progressService';

vi.mock('../api/apiService', () => {
    const mockGet = vi.fn();
    Object.assign(globalThis, {mockGet});
    /**
     *
     */
    class MockApiService {
        get = mockGet;
    }
    return {
        ApiService: MockApiService,
        __esModule: true,
    };
});

describe('progressService', () => {
    let mockGet: any;
    beforeEach(() => {
        mockGet = (globalThis as any).mockGet;
        vi.clearAllMocks();
    });

    it('fetchStudentProgressByUser returns empty array', async () => {
        const result = await progressService.fetchStudentProgressByUser('1');
        expect(result).toEqual([]);
    });

    it('fetchStudentProgressByCourse returns null', async () => {
        const result = await progressService.fetchStudentProgressByCourse('1', '2');
        expect(result).toBeNull();
    });

    it('fetchAllStudentsProgress returns empty result', async () => {
        const result = await progressService.fetchAllStudentsProgress('1');
        expect(result).toEqual({count: 0, next: null, previous: null, results: []});
    });

    it('getQuizHistory returns empty array', async () => {
        const result = await progressService.getQuizHistory('1', '2');
        expect(result).toEqual([]);
    });

    it('updateTaskProgress returns null', async () => {
        const result = await progressService.updateTaskProgress('1', '2', {});
        expect(result).toBeNull();
    });

    it('submitTask returns null', async () => {
        const result = await progressService.submitTask('1', '2', {});
        expect(result).toBeNull();
    });

    it('gradeSubmission returns null', async () => {
        const result = await progressService.gradeSubmission('1', '2', '3', {});
        expect(result).toBeNull();
    });

    it('fetchCourseDetails returns course if found', async () => {
        const mockCourse = {id: 1, title: 'Course'};
        mockGet.mockResolvedValueOnce(mockCourse);
        const result = await progressService.fetchCourseDetails('1');
        expect(mockGet).toHaveBeenCalled();
        expect(result).toEqual(mockCourse);
    });

    it('fetchCourseDetails throws if not found', async () => {
        mockGet.mockResolvedValueOnce(undefined);
        await expect(progressService.fetchCourseDetails('999')).rejects.toThrow('Course not found');
    });

    it('fetchProgressAnalytics returns null', async () => {
        const result = await progressService.fetchProgressAnalytics('1');
        expect(result).toBeNull();
    });

    it('fetchStudentProgressSummary returns null', async () => {
        const result = await progressService.fetchStudentProgressSummary('1');
        expect(result).toBeNull();
    });

    it('fetchInstructorDashboardData returns null', async () => {
        const result = await progressService.fetchInstructorDashboardData();
        expect(result).toBeNull();
    });

    it('fetchCourseStructure returns null', async () => {
        const result = await progressService.fetchCourseStructure('1');
        expect(result).toBeNull();
    });
});
