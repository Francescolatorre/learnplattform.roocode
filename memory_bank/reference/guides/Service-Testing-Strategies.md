# Service Testing Strategies Guide

**Version**: 1.0
**Last Updated**: 2025-09-15
**Related**: TASK-012 Modern Service Architecture

---

## Overview

Comprehensive testing strategies for modern TypeScript services ensuring reliability, maintainability, and confidence in service layer functionality.

---

## Testing Pyramid for Services

### 1. Unit Tests (70% of tests)
- **Scope**: Individual service methods in isolation
- **Focus**: Business logic, data transformation, error handling
- **Mock**: External dependencies (API client, other services)

### 2. Integration Tests (20% of tests)
- **Scope**: Service integration with stores, API client, real data
- **Focus**: Data flow, state management, cross-service communication
- **Mock**: External APIs, but use real store implementations

### 3. End-to-End Tests (10% of tests)
- **Scope**: Complete user workflows involving services
- **Focus**: Full stack integration, user scenarios
- **Mock**: Minimal mocking, use test databases

---

## Unit Testing Patterns

### Basic Service Test Setup

```typescript
import { ServiceFactory } from '@/services/factory/serviceFactory';
import { ModernCourseService } from '@/services/resources/modernCourseService';
import { ModernApiClient } from '@/api/modernApiClient';

describe('ModernCourseService', () => {
  let service: ModernCourseService;
  let mockApiClient: jest.Mocked<ModernApiClient>;

  beforeEach(() => {
    // Reset ServiceFactory for clean tests
    ServiceFactory.getInstance().reset();

    // Get service instance
    service = ServiceFactory.getInstance().getService(ModernCourseService);

    // Mock the API client
    mockApiClient = service['apiClient'] as jest.Mocked<ModernApiClient>;
    jest.clearAllMocks();
  });

  afterEach(() => {
    ServiceFactory.getInstance().reset();
  });
});
```

### Testing CRUD Operations

```typescript
describe('Course CRUD Operations', () => {
  const mockCourse: ICourse = {
    id: '1',
    title: 'Test Course',
    description: 'Test Description',
    status: 'published',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  };

  describe('getCourses', () => {
    it('should fetch courses with default pagination', async () => {
      const mockResponse: IPaginatedResponse<ICourse> = {
        results: [mockCourse],
        count: 1,
        next: null,
        previous: null
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await service.getCourses();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/courses/')
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch courses with custom filters', async () => {
      const filters: CourseFilterOptions = {
        page: 2,
        page_size: 5,
        search: 'javascript',
        status: 'published'
      };

      mockApiClient.get.mockResolvedValue({ results: [], count: 0 });

      await service.getCourses(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringMatching(/page=2.*page_size=5.*search=javascript.*status=published/)
      );
    });
  });

  describe('getCourseById', () => {
    it('should fetch course by ID', async () => {
      mockApiClient.get.mockResolvedValue(mockCourse);

      const result = await service.getCourseById('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/courses/1/');
      expect(result).toEqual(mockCourse);
    });

    it('should throw error when course not found', async () => {
      mockApiClient.get.mockResolvedValue(null);

      await expect(service.getCourseById('999')).rejects.toThrow(
        'Course with ID 999 not found'
      );
    });
  });

  describe('createCourse', () => {
    it('should create new course', async () => {
      const courseData: Partial<ICourse> = {
        title: 'New Course',
        description: 'New Description'
      };

      mockApiClient.post.mockResolvedValue(mockCourse);

      const result = await service.createCourse(courseData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/courses/',
        courseData
      );
      expect(result).toEqual(mockCourse);
    });
  });

  describe('updateCourse', () => {
    it('should update existing course', async () => {
      const updateData: Partial<ICourse> = {
        title: 'Updated Title'
      };

      mockApiClient.patch.mockResolvedValue({
        ...mockCourse,
        title: 'Updated Title'
      });

      const result = await service.updateCourse('1', updateData);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/courses/1/',
        updateData
      );
      expect(result.title).toBe('Updated Title');
    });
  });

  describe('deleteCourse', () => {
    it('should delete course', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await service.deleteCourse('1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/courses/1/');
    });
  });
});
```

### Testing Error Scenarios

```typescript
describe('Error Handling', () => {
  it('should handle network errors', async () => {
    const networkError = new Error('Network timeout');
    mockApiClient.get.mockRejectedValue(networkError);

    await expect(service.getCourseById('1')).rejects.toThrow('Network timeout');
  });

  it('should handle API errors with context', async () => {
    const apiError = new Error('Unauthorized');
    apiError.name = 'HTTPError';
    (apiError as any).status = 401;

    mockApiClient.get.mockRejectedValue(apiError);

    await expect(service.getCourses()).rejects.toThrow('Unauthorized');

    // Verify error logging (if using spy on console.error)
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('ModernCourseService.getCourses'),
      expect.any(Object)
    );
  });

  it('should handle validation errors', async () => {
    const invalidData = { title: '' }; // Empty title

    await expect(service.createCourse(invalidData)).rejects.toThrow(
      'Course title is required'
    );

    // Should not make API call for validation errors
    expect(mockApiClient.post).not.toHaveBeenCalled();
  });
});
```

### Testing Utility Methods

```typescript
describe('Utility Methods', () => {
  describe('transformUserProgressToStudentSummary', () => {
    it('should transform user progress correctly', () => {
      const userProgress: IUserProgress = {
        id: 123,
        label: 'John Doe',
        percentage: 75
      };

      const result = service.transformUserProgressToStudentSummary(userProgress);

      expect(result).toEqual({
        progress: 75,
        user_info: {
          id: '123',
          username: 'John Doe',
          display_name: 'John Doe',
          role: 'student'
        },
        overall_stats: {
          courses_enrolled: 1,
          courses_completed: 0,
          overall_progress: 75,
          tasks_completed: 0,
          tasks_in_progress: 0,
          tasks_overdue: 0
        },
        courses: expect.arrayContaining([
          expect.objectContaining({
            id: '123',
            title: 'John Doe',
            progress: 75,
            status: 'active'
          })
        ])
      });
    });
  });
});
```

---

## Integration Testing Patterns

### Store-Service Integration

```typescript
import { renderHook, act } from '@testing-library/react';
import { useModernCourseStore } from '@/store/modernCourseStore';
import { modernCourseService } from '@/services/resources/modernCourseService';

describe('Course Store Integration', () => {
  beforeEach(() => {
    // Reset store state
    useModernCourseStore.getState().reset?.();
  });

  it('should integrate service calls with store state', async () => {
    const mockCourses: ICourse[] = [
      { id: '1', title: 'Course 1', status: 'published' },
      { id: '2', title: 'Course 2', status: 'draft' }
    ];

    // Mock service method
    jest.spyOn(modernCourseService, 'getCourses').mockResolvedValue({
      results: mockCourses,
      count: 2,
      next: null,
      previous: null
    });

    const { result } = renderHook(() => useModernCourseStore());

    // Initial state
    expect(result.current.courses).toEqual([]);
    expect(result.current.loading).toBe(false);

    // Trigger fetch
    await act(async () => {
      await result.current.fetchCourses();
    });

    // Verify final state
    expect(result.current.courses).toEqual(mockCourses);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle service errors in store', async () => {
    const serviceError = new Error('Service unavailable');
    jest.spyOn(modernCourseService, 'getCourses').mockRejectedValue(serviceError);

    const { result } = renderHook(() => useModernCourseStore());

    await act(async () => {
      await result.current.fetchCourses();
    });

    expect(result.current.error).toBe('Service unavailable');
    expect(result.current.loading).toBe(false);
    expect(result.current.courses).toEqual([]);
  });

  it('should handle caching correctly', async () => {
    const mockCourses: ICourse[] = [{ id: '1', title: 'Cached Course' }];

    jest.spyOn(modernCourseService, 'getCourses').mockResolvedValue({
      results: mockCourses,
      count: 1
    });

    const { result } = renderHook(() => useModernCourseStore());

    // First call
    await act(async () => {
      await result.current.fetchCourses();
    });

    expect(modernCourseService.getCourses).toHaveBeenCalledTimes(1);

    // Second call with same parameters should use cache
    await act(async () => {
      await result.current.fetchCourses();
    });

    // Should still only be called once due to caching
    expect(modernCourseService.getCourses).toHaveBeenCalledTimes(1);
  });
});
```

### Component-Service Integration

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseList } from '@/components/CourseList';
import { modernCourseService } from '@/services/resources/modernCourseService';

describe('CourseList Component Integration', () => {
  it('should display courses from service', async () => {
    const mockCourses: ICourse[] = [
      { id: '1', title: 'React Basics', status: 'published' },
      { id: '2', title: 'TypeScript Advanced', status: 'published' }
    ];

    jest.spyOn(modernCourseService, 'getCourses').mockResolvedValue({
      results: mockCourses,
      count: 2
    });

    render(<CourseList />);

    // Should show loading initially
    expect(screen.getByTestId('course-list-loading')).toBeInTheDocument();

    // Wait for courses to load
    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeInTheDocument();
      expect(screen.getByText('TypeScript Advanced')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('course-list-loading')).not.toBeInTheDocument();
  });

  it('should handle service errors gracefully', async () => {
    jest.spyOn(modernCourseService, 'getCourses').mockRejectedValue(
      new Error('Failed to load courses')
    );

    render(<CourseList />);

    await waitFor(() => {
      expect(screen.getByTestId('error-display')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load courses/)).toBeInTheDocument();
    });
  });

  it('should support retry on error', async () => {
    const user = userEvent.setup();

    // First call fails
    jest.spyOn(modernCourseService, 'getCourses')
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        results: [{ id: '1', title: 'Retry Success' }],
        count: 1
      });

    render(<CourseList />);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByTestId('error-display')).toBeInTheDocument();
    });

    // Click retry
    const retryButton = screen.getByTestId('retry-button');
    await user.click(retryButton);

    // Should show success after retry
    await waitFor(() => {
      expect(screen.getByText('Retry Success')).toBeInTheDocument();
    });
  });
});
```

---

## File Upload Testing

### Testing File Upload Services

```typescript
describe('File Upload Operations', () => {
  describe('submitTaskWithFile', () => {
    it('should submit task with valid file', async () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf'
      });

      const submissionData: ITaskSubmissionData = {
        content: 'Task submission content',
        file: mockFile
      };

      mockApiClient.post.mockResolvedValue({ id: 1, status: 'submitted' });

      const result = await taskService.submitTaskWithFile('task-1', submissionData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/submissions/',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      );

      // Verify FormData content
      const formDataCall = mockApiClient.post.mock.calls[0];
      const formData = formDataCall[1] as FormData;
      expect(formData.get('file')).toBe(mockFile);
      expect(formData.get('content')).toBe('Task submission content');
      expect(formData.get('task')).toBe('task-1');
    });

    it('should reject files that are too large', async () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf'
      });

      const submissionData: ITaskSubmissionData = {
        file: largeFile
      };

      await expect(
        taskService.submitTaskWithFile('task-1', submissionData)
      ).rejects.toThrow('File size must be less than 10MB');

      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it('should reject unsupported file types', async () => {
      const unsupportedFile = new File(['content'], 'test.exe', {
        type: 'application/x-executable'
      });

      const submissionData: ITaskSubmissionData = {
        file: unsupportedFile
      };

      await expect(
        taskService.submitTaskWithFile('task-1', submissionData)
      ).rejects.toThrow('File type not supported');

      expect(mockApiClient.post).not.toHaveBeenCalled();
    });
  });
});
```

---

## Performance Testing

### Service Performance Testing

```typescript
describe('Service Performance', () => {
  it('should handle concurrent requests efficiently', async () => {
    const courseIds = Array.from({ length: 10 }, (_, i) => `course-${i}`);

    // Mock responses for all course IDs
    courseIds.forEach(id => {
      mockApiClient.get.mockResolvedValueOnce({
        id,
        title: `Course ${id}`,
        status: 'published'
      });
    });

    const startTime = Date.now();

    // Make concurrent requests
    const promises = courseIds.map(id => service.getCourseById(id));
    const results = await Promise.all(promises);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete within reasonable time
    expect(duration).toBeLessThan(1000); // 1 second
    expect(results).toHaveLength(10);
    expect(mockApiClient.get).toHaveBeenCalledTimes(10);
  });

  it('should not leak memory during repeated operations', async () => {
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      mockApiClient.get.mockResolvedValueOnce({
        results: [{ id: `${i}`, title: `Course ${i}` }],
        count: 1
      });

      await service.getCourses({ page: i });
    }

    // No easy way to test memory directly in Jest,
    // but we can verify no references are held
    expect(mockApiClient.get).toHaveBeenCalledTimes(iterations);

    // Verify service state is clean
    expect(Object.keys(service)).not.toContain('cachedData');
    expect(Object.keys(service)).not.toContain('storedState');
  });
});
```

---

## Mock Strategies

### API Client Mocking

```typescript
// Mock factory for consistent API responses
class ApiMockFactory {
  static createPaginatedResponse<T>(
    items: T[],
    total?: number
  ): IPaginatedResponse<T> {
    return {
      results: items,
      count: total ?? items.length,
      next: null,
      previous: null
    };
  }

  static createCourse(overrides?: Partial<ICourse>): ICourse {
    return {
      id: '1',
      title: 'Test Course',
      description: 'Test Description',
      status: 'published',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      ...overrides
    };
  }

  static createApiError(status: number, message: string): Error {
    const error = new Error(message);
    error.name = 'HTTPError';
    (error as any).status = status;
    return error;
  }
}

// Usage in tests
const mockResponse = ApiMockFactory.createPaginatedResponse([
  ApiMockFactory.createCourse({ title: 'Course 1' }),
  ApiMockFactory.createCourse({ title: 'Course 2' })
]);
```

### Service Factory Mocking

```typescript
// For testing service interactions
class MockServiceFactory {
  private services = new Map();

  register<T>(ServiceClass: new (...args: any[]) => T, instance: T): void {
    this.services.set(ServiceClass, instance);
  }

  getService<T>(ServiceClass: new (...args: any[]) => T): T {
    if (!this.services.has(ServiceClass)) {
      throw new Error(`Service ${ServiceClass.name} not registered in mock factory`);
    }
    return this.services.get(ServiceClass);
  }
}

// Test setup
beforeEach(() => {
  const mockFactory = new MockServiceFactory();
  const mockCourseService = {
    getCourses: jest.fn(),
    getCourseById: jest.fn(),
    createCourse: jest.fn()
  } as unknown as ModernCourseService;

  mockFactory.register(ModernCourseService, mockCourseService);

  // Replace real factory with mock
  jest.spyOn(ServiceFactory, 'getInstance').mockReturnValue(mockFactory as any);
});
```

---

## Test Data Management

### Test Data Builders

```typescript
class CourseTestDataBuilder {
  private course: Partial<ICourse> = {
    title: 'Default Course',
    status: 'published'
  };

  withTitle(title: string): this {
    this.course.title = title;
    return this;
  }

  withStatus(status: TCourseStatus): this {
    this.course.status = status;
    return this;
  }

  asDraft(): this {
    return this.withStatus('draft');
  }

  asPublished(): this {
    return this.withStatus('published');
  }

  build(): ICourse {
    return {
      id: Math.random().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: '',
      ...this.course
    } as ICourse;
  }
}

// Usage
const draftCourse = new CourseTestDataBuilder()
  .withTitle('Draft Course')
  .asDraft()
  .build();

const publishedCourse = new CourseTestDataBuilder()
  .withTitle('Published Course')
  .asPublished()
  .build();
```

---

## Testing Best Practices

### Do's ✅
- Test happy path and error scenarios
- Use descriptive test names that explain the behavior
- Keep tests isolated and independent
- Mock external dependencies consistently
- Test error handling and edge cases
- Use test data builders for complex objects
- Verify both positive and negative outcomes
- Test concurrent operations when relevant

### Don'ts ❌
- Don't test implementation details
- Don't write tests that depend on other tests
- Don't mock everything - integration tests need real objects
- Don't ignore async/await in test assertions
- Don't use production data in tests
- Don't skip error scenario testing
- Don't write overly complex test setup

---

## Related Documentation

- [Modern Service Development Best Practices](./Modern-Service-Development-Best-Practices.md)
- [Error Handling Patterns](../patterns/Service-Error-Handling-Patterns.md)
- [Jest Testing Configuration](../../frontend/jest.config.js)
- [Testing Library Setup](../../frontend/src/test/setup.ts)

---

**Maintained by**: Development Team
**Review Cycle**: Quarterly
**Next Review**: 2025-12-15