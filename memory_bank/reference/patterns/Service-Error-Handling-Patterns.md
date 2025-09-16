# Service Error Handling Patterns

**Version**: 1.0
**Last Updated**: 2025-09-15
**Related**: TASK-012 Modern Service Architecture

---

## Overview

This document defines standardized error handling patterns for modern TypeScript services in our learning platform. Consistent error handling improves debugging, user experience, and system reliability.

---

## Core Error Handling Pattern

### withManagedExceptions Wrapper

All service methods must use the `withManagedExceptions` wrapper:

```typescript
import { withManagedExceptions } from '@/utils/errorHandling';

async getCourses(options: CourseFilterOptions = {}): Promise<IPaginatedResponse<ICourse>> {
  return withManagedExceptions(
    async () => {
      const url = this.buildUrl(this.endpoints.courses.list, options);
      const response = await this.apiClient.get(url);
      return this.normalizePaginatedResponse<ICourse>(response);
    },
    {
      serviceName: 'ModernCourseService',
      methodName: 'getCourses',
      operation: 'fetch_courses', // Optional: for analytics
      context: { filters: options } // Optional: for debugging
    }
  )();
}
```

### Error Context Requirements

#### Mandatory Fields
- **serviceName**: Exact service class name for error tracking
- **methodName**: Specific method where error occurred

#### Optional Fields
- **operation**: Business operation identifier for analytics
- **context**: Relevant parameters/state for debugging
- **userId**: For user-specific error tracking (when available)

---

## Error Categories and Handling

### 1. Network Errors

```typescript
// HTTP status code errors (4xx, 5xx)
async getCourseById(courseId: string): Promise<ICourse> {
  return withManagedExceptions(
    async () => {
      const response = await this.apiClient.get<ICourse>(
        this.endpoints.courses.details(courseId)
      );

      if (!response) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      return response;
    },
    {
      serviceName: 'ModernCourseService',
      methodName: 'getCourseById',
      context: { courseId }
    }
  )();
}
```

### 2. Validation Errors

```typescript
async createCourse(courseData: Partial<ICourse>): Promise<ICourse> {
  return withManagedExceptions(
    async () => {
      // Validation before API call
      if (!courseData.title || courseData.title.trim().length === 0) {
        throw new Error('Course title is required');
      }

      if (courseData.title.length > 200) {
        throw new Error('Course title must be less than 200 characters');
      }

      return this.apiClient.post<ICourse>(
        this.endpoints.courses.create,
        courseData
      );
    },
    {
      serviceName: 'ModernCourseService',
      methodName: 'createCourse',
      operation: 'create_course',
      context: { titleLength: courseData.title?.length }
    }
  )();
}
```

### 3. Business Logic Errors

```typescript
async enrollStudent(courseId: string | number, studentId: string | number): Promise<unknown> {
  return withManagedExceptions(
    async () => {
      // Check business rules
      const course = await this.getCourseById(courseId.toString());
      if (course.status !== 'published') {
        throw new Error('Cannot enroll in unpublished course');
      }

      const enrollmentData = {
        course: courseId,
        student: studentId
      };

      return this.apiClient.post(
        this.endpoints.enrollments.create,
        enrollmentData
      );
    },
    {
      serviceName: 'ModernCourseService',
      methodName: 'enrollStudent',
      operation: 'student_enrollment',
      context: { courseId, studentId }
    }
  )();
}
```

### 4. File Upload Errors

```typescript
async submitTaskWithFile(taskId: string, submissionData: ITaskSubmissionData): Promise<unknown> {
  return withManagedExceptions(
    async () => {
      const formData = new FormData();

      // Validate file before upload
      if (submissionData.file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (submissionData.file.size > maxSize) {
          throw new Error('File size must be less than 10MB');
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(submissionData.file.type)) {
          throw new Error('File type not supported. Please use PDF, JPEG, or PNG');
        }

        formData.append('file', submissionData.file);
      }

      formData.append('content', submissionData.content || '');
      formData.append('task', taskId);

      return this.apiClient.post(
        this.endpoints.submissions.create,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
    },
    {
      serviceName: 'ModernLearningTaskService',
      methodName: 'submitTaskWithFile',
      operation: 'task_submission',
      context: {
        taskId,
        hasFile: !!submissionData.file,
        fileSize: submissionData.file?.size,
        fileType: submissionData.file?.type
      }
    }
  )();
}
```

---

## Store Integration Error Handling

### Zustand Store Error Pattern

```typescript
import { withAsyncOperation } from '@/store/utils/serviceIntegration';

const fetchCourses = async (filters: CourseFilters = {}) => {
  return withAsyncOperation(
    () => courseService.getCourses(filters),
    (loading) => set((state) => ({ ...state, loading })),
    (error) => set((state) => ({ ...state, error })),
    (result) => {
      // Cache successful result
      const cacheKey = cache.buildKey('courses', filters);
      cache.set(cacheKey, result);

      set((state) => ({
        ...state,
        courses: result.results,
        totalCount: result.count,
        lastFetch: Date.now()
      }));
    }
  );
};
```

### Component Error Display

```typescript
const CourseList: React.FC = () => {
  const { courses, loading, error, fetchCourses } = useModernCourseStore();

  useEffect(() => {
    fetchCourses().catch((err) => {
      // Error is already handled by store, but we can log or track
      console.error('Failed to fetch courses:', err);
    });
  }, [fetchCourses]);

  if (loading) return <CourseListSkeleton />;

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => fetchCourses()}
        context="course_listing"
      />
    );
  }

  return <CourseGrid courses={courses} />;
};
```

---

## Error Recovery Patterns

### 1. Automatic Retry with Exponential Backoff

```typescript
async getCourseWithRetry(courseId: string, maxRetries = 3): Promise<ICourse> {
  return withManagedExceptions(
    async () => {
      let attempt = 0;

      while (attempt < maxRetries) {
        try {
          return await this.apiClient.get<ICourse>(
            this.endpoints.courses.details(courseId)
          );
        } catch (error) {
          attempt++;

          if (attempt >= maxRetries) {
            throw error; // Re-throw after max attempts
          }

          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      throw new Error('Max retries exceeded');
    },
    {
      serviceName: 'ModernCourseService',
      methodName: 'getCourseWithRetry',
      context: { courseId, maxRetries }
    }
  )();
}
```

### 2. Fallback Data Strategies

```typescript
async getCoursesWithFallback(filters: CourseFilters = {}): Promise<IPaginatedResponse<ICourse>> {
  return withManagedExceptions(
    async () => {
      try {
        // Try primary endpoint
        return await this.getCourses(filters);
      } catch (primaryError) {
        console.warn('Primary course fetch failed, trying fallback', primaryError);

        try {
          // Try cached data
          const cacheKey = this.buildCacheKey('courses', filters);
          const cached = this.cache.get(cacheKey);
          if (cached && this.cache.isRecentEnough(cacheKey, 30 * 60 * 1000)) { // 30 min
            return cached;
          }

          // Try basic endpoint without filters
          if (Object.keys(filters).length > 0) {
            return await this.getCourses({});
          }

          throw primaryError; // Re-throw if no fallback worked
        } catch (fallbackError) {
          throw new Error(`Both primary and fallback failed: ${primaryError.message}`);
        }
      }
    },
    {
      serviceName: 'ModernCourseService',
      methodName: 'getCoursesWithFallback',
      context: { filters, hasFallback: true }
    }
  )();
}
```

---

## Error Monitoring and Analytics

### Error Context for Debugging

```typescript
async complexOperation(params: ComplexParams): Promise<Result> {
  const startTime = Date.now();

  return withManagedExceptions(
    async () => {
      // Implementation
      const result = await this.performComplexLogic(params);
      return result;
    },
    {
      serviceName: 'ModernComplexService',
      methodName: 'complexOperation',
      operation: 'complex_business_operation',
      context: {
        params: {
          ...params,
          // Sanitize sensitive data
          password: params.password ? '[REDACTED]' : undefined
        },
        startTime,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    }
  )();
}
```

### Error Classification

```typescript
const ERROR_TYPES = {
  NETWORK: 'network_error',
  VALIDATION: 'validation_error',
  AUTHENTICATION: 'auth_error',
  AUTHORIZATION: 'permission_error',
  BUSINESS_LOGIC: 'business_logic_error',
  SERVER: 'server_error',
  CLIENT: 'client_error'
} as const;

async getCourseById(courseId: string): Promise<ICourse> {
  return withManagedExceptions(
    async () => {
      const response = await this.apiClient.get<ICourse>(
        this.endpoints.courses.details(courseId)
      );

      if (!response) {
        const error = new Error(`Course with ID ${courseId} not found`);
        error.name = ERROR_TYPES.BUSINESS_LOGIC;
        throw error;
      }

      return response;
    },
    {
      serviceName: 'ModernCourseService',
      methodName: 'getCourseById',
      context: { courseId },
      errorType: ERROR_TYPES.BUSINESS_LOGIC // Expected error type
    }
  )();
}
```

---

## Testing Error Scenarios

### Unit Test Error Handling

```typescript
describe('ModernCourseService Error Handling', () => {
  let service: ModernCourseService;
  let mockApiClient: jest.Mocked<ModernApiClient>;

  beforeEach(() => {
    const serviceFactory = ServiceFactory.getInstance();
    service = serviceFactory.getService(ModernCourseService);
    mockApiClient = service['apiClient'] as jest.Mocked<ModernApiClient>;
  });

  it('should handle network errors gracefully', async () => {
    const networkError = new Error('Network timeout');
    mockApiClient.get.mockRejectedValue(networkError);

    await expect(service.getCourseById('123')).rejects.toThrow('Network timeout');

    // Verify error was logged with proper context
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('ModernCourseService.getCourseById'),
      expect.objectContaining({
        courseId: '123'
      })
    );
  });

  it('should handle validation errors appropriately', async () => {
    const invalidCourseData = { title: '' }; // Invalid: empty title

    await expect(service.createCourse(invalidCourseData)).rejects.toThrow(
      'Course title is required'
    );

    // Should not make API call for validation errors
    expect(mockApiClient.post).not.toHaveBeenCalled();
  });
});
```

### Integration Test Error Scenarios

```typescript
describe('Course Store Error Integration', () => {
  it('should handle service errors in store operations', async () => {
    const { result } = renderHook(() => useModernCourseStore());

    // Mock service to throw error
    jest.spyOn(modernCourseService, 'getCourses').mockRejectedValue(
      new Error('Service unavailable')
    );

    await act(async () => {
      await result.current.fetchCourses();
    });

    // Verify error state is set
    expect(result.current.error).toBe('Service unavailable');
    expect(result.current.loading).toBe(false);
    expect(result.current.courses).toEqual([]);
  });
});
```

---

## Best Practices Summary

### Do's ✅
- Always wrap service methods with `withManagedExceptions`
- Provide meaningful error messages for business logic failures
- Include relevant context in error information
- Validate inputs before making API calls
- Use appropriate error types for different scenarios
- Test error scenarios in both unit and integration tests
- Implement graceful fallbacks where appropriate

### Don'ts ❌
- Don't catch and ignore errors without handling
- Don't expose sensitive information in error messages
- Don't use generic error messages without context
- Don't skip validation for "trusted" inputs
- Don't let errors bubble up without proper context
- Don't forget to test error scenarios

---

## Related Documentation

- [Modern Service Development Best Practices](../guides/Modern-Service-Development-Best-Practices.md)
- [Error Handling Utilities](../../frontend/src/utils/errorHandling.ts)
- [Store Integration Patterns](../../frontend/src/store/utils/serviceIntegration.ts)
- [Testing Guidelines](../standards/testing-guidelines.md)

---

**Maintained by**: Development Team
**Review Cycle**: Quarterly
**Next Review**: 2025-12-15