import { describe, it, expect, vi, beforeEach } from 'vitest';

import progressService from './progressService';

vi.mock('../api/apiService', () => {
  const mockGet = vi.fn();
  const mockPut = vi.fn();
  const mockPost = vi.fn();
  const mockDelete = vi.fn(); // Add mockDelete for DELETE requests
  Object.assign(globalThis, { mockGet, mockPut, mockPost, mockDelete });
  class MockApiService {
    get = mockGet;
    put = mockPut;
    post = mockPost;
    delete = mockDelete; // Add delete method
  }
  return {
    ApiService: MockApiService,
    __esModule: true,
  };
});

describe('progressService', () => {
  let mockGet: any;
  let mockPut: any;
  let mockPost: any;
  let mockDelete: any; // Declare mockDelete

  beforeEach(() => {
    // Get references to the mock functions
    mockGet = (globalThis as any).mockGet;
    mockPut = (globalThis as any).mockPut;
    mockPost = (globalThis as any).mockPost;
    mockDelete = (globalThis as any).mockDelete; // Assign mockDelete

    // Clear all mocks before each test
    vi.clearAllMocks();

    // Set up default responses for PUT and POST
    mockPut.mockResolvedValue({});
    mockPost.mockResolvedValue({});

    // Set up specific responses for different API endpoints
    mockGet.mockImplementation((url: string) => {
      // Student progress endpoints - return empty arrays
      if (url.includes('/api/v1/students/') && url.includes('/progress/')) {
        return Promise.resolve([]);
      }

      // Course student progress endpoint - return paginated empty results
      if (
        url.includes('/api/v1/courses/') &&
        url.includes('/student-progress/') &&
        !url.includes('/student-progress/2/')
      ) {
        return Promise.resolve({ count: 0, next: null, previous: null, results: [] });
      }

      // Course student progress for specific user - return course object
      if (url.includes('/api/v1/courses/1/student-progress/2/')) {
        return Promise.resolve({
          id: 1,
          title: 'Course',
          description: 'Description',
          progress: [],
        });
      }

      // Course analytics endpoint - return analytics object
      if (url.includes('/api/v1/courses/') && url.includes('/analytics/')) {
        return Promise.resolve({
          total_students: 0,
          completion_rate: 0,
          average_score: 0,
        });
      }

      // Instructor dashboard endpoint - return dashboard data
      if (url.includes('/api/v1/instructor/dashboard/')) {
        return Promise.resolve({
          courses_count: 0,
          students_count: 0,
          recent_activities: [],
        });
      }

      // Quiz attempts endpoint - return empty array
      if (url.includes('/api/v1/quiz-attempts/')) {
        return Promise.resolve([]);
      }

      mockGet.mockResolvedValueOnce([]); // Mock response for fetching student progress
      mockPost.mockResolvedValueOnce({}); // Mock response for submitting tasks
      mockPut.mockResolvedValueOnce({}); // Mock response for updating tasks
      mockDelete.mockResolvedValueOnce({}); // Mock response for deleting tasks
      // Default to empty object for other endpoints
      return Promise.resolve({});
    });
  });

  it('fetchStudentProgressByUser returns empty array', async () => {
    const result = await progressService.fetchStudentProgressByUser('1');
    expect(result).toEqual([]);
  });

  it('fetchStudentProgressByCourse returns course with progress', async () => {
    const result = await progressService.fetchStudentProgressByCourse('1', '2');
    expect(result).toEqual({
      id: 1,
      title: 'Course',
      description: 'Description',
      progress: [],
    });
  });

  it('fetchAllStudentsProgress returns empty result', async () => {
    const result = await progressService.fetchAllStudentsProgress('1');
    expect(result).toEqual({ count: 0, next: null, previous: null, results: [] });
  });

  it('getIQuizHistory returns empty array', async () => {
    const result = await progressService.getIQuizHistory('1', '2');
    expect(result).toEqual([]);
  });

  it('updateTaskProgress returns empty object', async () => {
    const result = await progressService.updateTaskProgress('1', '2', {});
    expect(result).toEqual({});
  });

  it('submitTask returns empty object', async () => {
    const result = await progressService.submitTask('1', '2', {});
    expect(result).toEqual({});
  });

  it('gradeSubmission returns empty object', async () => {
    const result = await progressService.gradeSubmission('1', '2', '3', {} as unknown);
    expect(result).toEqual({});
  });

  it('fetchCourseDetails returns course if found', async () => {
    const mockCourse = { id: 1, title: 'Course' };
    mockGet.mockResolvedValueOnce(mockCourse);
    const result = await progressService.fetchCourseDetails('1');
    expect(mockGet).toHaveBeenCalled();
    expect(result).toEqual(mockCourse);
  });

  it('fetchCourseDetails throws if not found', async () => {
    mockGet.mockResolvedValueOnce(undefined);
    await expect(progressService.fetchCourseDetails('999')).rejects.toThrow('Course not found');
  });

  it('fetchProgressAnalytics returns analytics data', async () => {
    const result = await progressService.fetchProgressAnalytics('1');
    expect(result).toEqual({
      total_students: 0,
      completion_rate: 0,
      average_score: 0,
    });
  });

  it('fetchStudentProgressSummary returns empty array', async () => {
    const result = await progressService.fetchStudentProgressSummary('1');
    expect(result).toEqual([]);
  });

  it('fetchInstructorDashboardData returns dashboard data', async () => {
    const result = await progressService.fetchInstructorDashboardData();
    expect(result).toEqual({
      courses_count: 0,
      students_count: 0,
      recent_activities: [],
    });
  });

  // Removed redundant test: 'fetchCourseStructure'
  // It calls the same endpoint as 'fetchProgressAnalytics'
});
