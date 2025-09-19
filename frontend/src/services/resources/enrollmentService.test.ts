// path: frontend/src/services/resources/enrollmentService.test.ts
// Test suite for the enrollmentService module
// This test suite uses Vitest for testing and mocks the API service to isolate the tests from actual API calls.

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ICourseEnrollment, IEnrollmentResponse } from '@/types/entities';
import { TCompletionStatus } from '@/types/entities';

import { API_CONFIG } from '../api/apiConfig';

import { enrollmentService } from './enrollmentService';
// Import the real API_CONFIG
// Import the types from your entities file

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock the auth service import
vi.mock('@services/auth/authService', () => {
  return {
    default: {
      getUserProfile: vi.fn().mockResolvedValue({ id: 104, username: 'testuser' }),
    },
    __esModule: true,
  };
});

// Now we mock the ApiService module more accurately
vi.mock('../api/apiService', () => {
  // Create the mock functions
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();

  // Save references to them on the global object so we can access them in tests
  Object.assign(globalThis, { mockGet, mockPost, mockPut, mockDelete });

  // Create the mock class that matches the real ApiService
  class MockApiService {
    // The important part - configure these methods to directly return
    // what the real methods would return (response.data)
    get = mockGet;
    post = mockPost;
    put = mockPut;
    delete = mockDelete;
    patch = vi.fn();
    setAuthToken = vi.fn();
    setHeaders = vi.fn();
  }

  // Return the MockApiService class and a singleton instance
  return {
    ApiService: MockApiService,
    apiService: new MockApiService(),
    __esModule: true,
  };
});

describe('enrollmentService', () => {
  let mockGet: any, mockPost: any, mockPut: any;

  // Sample data for consistent testing with correct types
  const sampleEnrollment: Partial<ICourseEnrollment> = {
    id: 1,
    user: 101,
    course: 201,
    status: 'active' as TCompletionStatus,
    enrollment_date: '2023-01-15T10:30:00Z',
    progress_percentage: '45%',
  };

  const sampleEnrollmentList: Partial<ICourseEnrollment>[] = [
    sampleEnrollment,
    {
      id: 2,
      user: 102,
      course: 201,
      status: 'active' as TCompletionStatus,
      enrollment_date: '2023-02-20T14:15:00Z',
      progress_percentage: '30%',
    },
  ];

  beforeEach(() => {
    // Get references to the mock functions
    mockGet = (globalThis as any).mockGet;
    mockPost = (globalThis as any).mockPost;
    mockPut = (globalThis as any).mockPut;

    // Clear all mocks before each test
    vi.clearAllMocks();

    // Set up localStorage mock with a token
    localStorageMock.setItem('accessToken', 'fake-token-123');
  });

  it('getAll calls apiService.get with correct endpoint and returns enrollments', async () => {
    mockGet.mockResolvedValueOnce(sampleEnrollmentList);
    const result = await enrollmentService.getAll();
    expect(mockGet).toHaveBeenCalledWith(API_CONFIG.endpoints.enrollments.list);
    expect(result).toEqual(sampleEnrollmentList);
  });

  it('getById calls apiService.get with correct endpoint and returns single enrollment', async () => {
    mockGet.mockResolvedValueOnce(sampleEnrollment);
    const result = await enrollmentService.getById(1);
    expect(mockGet).toHaveBeenCalledWith(API_CONFIG.endpoints.enrollments.details(1));
    expect(result).toEqual(sampleEnrollment);
  });

  it('getById handles not found error', async () => {
    mockGet.mockRejectedValueOnce(new Error('Enrollment not found'));
    await expect(enrollmentService.getById(999)).rejects.toThrow('Enrollment not found');
  });

  it('create calls apiService.post with correct data and returns created enrollment', async () => {
    const newEnrollment: Partial<ICourseEnrollment> = {
      course: 201,
      status: 'active' as TCompletionStatus,
    };

    const createdEnrollment: Partial<ICourseEnrollment> = {
      ...newEnrollment,
      id: 3,
      user: 103,
      enrollment_date: '2023-03-10T09:45:00Z',
    };

    mockPost.mockResolvedValueOnce(createdEnrollment);
    const result = await enrollmentService.create(newEnrollment);

    expect(mockPost).toHaveBeenCalledWith(API_CONFIG.endpoints.enrollments.create, newEnrollment);
    expect(result).toEqual(createdEnrollment);
  });

  it('update calls apiService.put with correct data and returns updated enrollment', async () => {
    const updateData: Partial<ICourseEnrollment> = {
      status: 'completed' as TCompletionStatus,
    };

    const updatedEnrollment: Partial<ICourseEnrollment> = {
      ...sampleEnrollment,
      ...updateData,
    };

    mockPut.mockResolvedValueOnce(updatedEnrollment);
    const result = await enrollmentService.update(1, updateData);

    expect(mockPut).toHaveBeenCalledWith(API_CONFIG.endpoints.enrollments.update(1), updateData);
    expect(result).toEqual(updatedEnrollment);
  });

  it('fetchUserEnrollments calls apiService.get and returns user enrollments', async () => {
    mockGet.mockResolvedValueOnce(sampleEnrollmentList);
    const result = await enrollmentService.fetchUserEnrollments();
    expect(mockGet).toHaveBeenCalledWith(API_CONFIG.endpoints.enrollments.list);
    expect(result).toEqual(sampleEnrollmentList);
  });

  it('enrollInCourse calls apiService.post with course id and returns enrollment', async () => {
    const enrollResponse: Partial<ICourseEnrollment> = {
      id: 4,
      user: 104,
      course: 202,
      status: 'active' as TCompletionStatus,
      enrollment_date: '2023-04-05T11:20:00Z',
    };

    mockPost.mockResolvedValueOnce(enrollResponse);
    const result = await enrollmentService.enrollInCourse(202);

    // Verify the correct endpoint and data were used
    expect(mockPost).toHaveBeenCalledWith(
      API_CONFIG.endpoints.enrollments.create,
      expect.objectContaining({
        course: 202,
        user: 104, // This comes from our mocked getUserProfile
        status: 'active',
      })
    );
    expect(result).toEqual(enrollResponse);
  });

  it('unenrollFromCourseById calls the enrollments unenroll endpoint', async () => {
    const courseId = 201;
    const unenrollResponse: IEnrollmentResponse = {
      success: true,
      message: 'Successfully unenrolled from the course.',
      courseId: courseId.toString(),
      status: 'dropped',
    };

    mockPost.mockResolvedValueOnce(unenrollResponse);

    const result = await enrollmentService.unenrollFromCourseById(courseId);

    expect(mockPost).toHaveBeenCalledWith(API_CONFIG.endpoints.enrollments.unenroll(courseId), {});
    expect(result).toEqual(unenrollResponse);
  });

  it('fetchEnrolledStudents calls apiService.get with course id and returns student enrollments', async () => {
    mockGet.mockResolvedValueOnce(sampleEnrollmentList);
    const result = await enrollmentService.fetchEnrolledStudents(201);
    expect(mockGet).toHaveBeenCalledWith(API_CONFIG.endpoints.enrollments.byCourse(201));
    expect(result).toEqual(sampleEnrollmentList);
  });

  it('findByFilter calls apiService.get with correctly formatted query params', async () => {
    mockGet.mockResolvedValueOnce([sampleEnrollment]);

    const filter = { course: 201, user: 101, status: 'active' as TCompletionStatus };
    const result = await enrollmentService.findByFilter(filter);

    expect(mockGet).toHaveBeenCalledWith(
      `${API_CONFIG.endpoints.enrollments.list}?course=201&user=101&status=active`
    );
    expect(result).toEqual([sampleEnrollment]);
  });

  it('findByFilter handles empty filter object', async () => {
    // Mock the response for the empty filter case
    mockGet.mockResolvedValueOnce(sampleEnrollmentList);

    // Call the service method
    const result = await enrollmentService.findByFilter({});

    // Verify the correct URL was called and the mock response was returned
    expect(mockGet).toHaveBeenCalledWith(API_CONFIG.endpoints.enrollments.list);
    expect(result).toEqual(sampleEnrollmentList);
  });

  it('handles API errors properly', async () => {
    const errorMessage = 'API server error';
    mockGet.mockRejectedValueOnce(new Error(errorMessage));

    await expect(enrollmentService.getAll()).rejects.toThrow(errorMessage);
  });
});
