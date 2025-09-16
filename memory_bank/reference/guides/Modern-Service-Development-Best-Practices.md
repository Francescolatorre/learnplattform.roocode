# Modern Service Development Best Practices

**Version**: 1.0
**Last Updated**: 2025-09-15
**Related**: TASK-012 Modern Service Architecture

---

## Overview

This guide provides comprehensive best practices for developing modern TypeScript services in our learning platform. These patterns ensure consistency, maintainability, and optimal performance across the service layer.

---

## Architecture Principles

### 1. Composition Over Inheritance

```typescript
// ✅ Preferred: Composition with BaseService
export class ModernCourseService extends BaseService {
  constructor(config?: ServiceConfig) {
    super(config); // Inherits shared functionality
  }
}

// ❌ Avoid: Multiple inheritance or complex hierarchies
```

### 2. Single Responsibility Principle

Each service should handle one domain area:
- **ModernCourseService**: Course management only
- **ModernEnrollmentService**: Enrollment operations only
- **ModernProgressService**: Progress tracking only

### 3. Dependency Injection via ServiceFactory

```typescript
// ✅ Use ServiceFactory for instantiation
import { ServiceFactory } from '../factory/serviceFactory';
const courseService = ServiceFactory.getInstance().getService(ModernCourseService);

// ❌ Avoid direct instantiation
const courseService = new ModernCourseService();
```

---

## Error Handling Patterns

### Standard Error Wrapper

All service methods must use `withManagedExceptions`:

```typescript
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
    }
  )();
}
```

### Error Context Requirements

- **serviceName**: Always include the service class name
- **methodName**: Include the specific method name
- **Additional context**: Add relevant parameters when useful for debugging

---

## TypeScript Best Practices

### 1. Interface Definitions

Define clear interfaces for all parameters and responses:

```typescript
/**
 * Course filter options interface
 */
export interface CourseFilterOptions {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  creator?: number | null;
  ordering?: string;
  [key: string]: unknown; // Allow additional parameters
}
```

### 2. Type Safety in Method Signatures

```typescript
// ✅ Strongly typed parameters and return values
async getCourseById(courseId: string): Promise<ICourse>

// ❌ Avoid any or loose typing
async getCourseById(courseId: any): Promise<any>
```

### 3. Generic Type Usage

Leverage generics for reusable patterns:

```typescript
return this.normalizePaginatedResponse<ICourse>(response);
return this.normalizeArrayResponse<ILearningTask>(response);
```

---

## Performance Optimization

### 1. Response Normalization

Always normalize API responses for consistency:

```typescript
// For paginated responses
return this.normalizePaginatedResponse<T>(response);

// For array responses
return this.normalizeArrayResponse<T>(response);

// For single entity responses
return response; // Already normalized by BaseService
```

### 2. URL Construction

Use the inherited `buildUrl` method for efficient parameter handling:

```typescript
const url = this.buildUrl(this.endpoints.courses.list, options);
```

### 3. Memory Management

- Single API client instance per service
- No persistent state in service instances
- Clean parameter passing without mutation

---

## Documentation Standards

### 1. TSDoc Header Requirements

Every service must include comprehensive TSDoc:

```typescript
/**
 * [Service Name] (2025 Best Practices)
 *
 * [Brief description of service purpose and scope]
 *
 * ## Key Features
 * - [List primary capabilities]
 * - [Include integration points]
 * - [Mention performance characteristics]
 *
 * ## Architecture Improvements
 * - [List architectural benefits]
 * - [Compare to legacy patterns when relevant]
 *
 * ## Usage Examples
 * ```typescript
 * // [Provide 3-4 common usage examples]
 * ```
 *
 * ## [Additional Sections as needed]
 * - Authentication Integration
 * - Performance Characteristics
 * - Data Types
 *
 * @see [Related interfaces and services]
 * @since 2025-09-15 (TASK-012 Modern Service Architecture)
 */
```

### 2. Method Documentation

```typescript
/**
 * Get detailed information for a specific course
 *
 * @param courseId - Unique identifier for the course
 * @returns Promise resolving to course details
 * @throws ServiceError When course is not found or access denied
 */
async getCourseById(courseId: string): Promise<ICourse>
```

### 3. Interface Documentation

Document all interfaces with clear descriptions:

```typescript
/**
 * Course filter options interface
 *
 * Supports pagination, search, and status filtering
 * for course listing operations.
 */
export interface CourseFilterOptions {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page (default: 20) */
  page_size?: number;
  /** Search term for course title/description */
  search?: string;
  // ... etc
}
```

---

## State Management Integration

### 1. Zustand Store Integration

Services integrate with Zustand stores via standardized patterns:

```typescript
// In store file
const courseService = ServiceFactory.getInstance().getService(ModernCourseService);

const fetchCourses = async (filters: CourseFilters = {}) => {
  return withAsyncOperation(
    () => courseService.getCourses(filters),
    set((state) => ({ ...state, loading: true })),
    set((state) => ({ ...state, error: null })),
    (result) => set((state) => ({ ...state, courses: result.results }))
  );
};
```

### 2. Caching Integration

Use store-level caching for frequently accessed data:

```typescript
// Check cache before API call
const cacheKey = this.cache.buildKey('courses', filters);
const cached = this.cache.get(cacheKey);
if (cached && !this.cache.isExpired(cacheKey)) {
  return cached;
}
```

---

## Testing Strategies

### 1. Service Unit Testing

```typescript
describe('ModernCourseService', () => {
  let service: ModernCourseService;
  let mockApiClient: jest.Mocked<ModernApiClient>;

  beforeEach(() => {
    const serviceFactory = ServiceFactory.getInstance();
    service = serviceFactory.getService(ModernCourseService);
    mockApiClient = service['apiClient'] as jest.Mocked<ModernApiClient>;
  });

  it('should fetch courses with filters', async () => {
    const mockResponse = { results: [], count: 0 };
    mockApiClient.get.mockResolvedValue(mockResponse);

    const result = await service.getCourses({ page: 1 });

    expect(mockApiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('courses/?page=1')
    );
    expect(result).toEqual(mockResponse);
  });
});
```

### 2. Integration Testing

Test service integration with stores and components:

```typescript
it('should integrate with course store', async () => {
  const { result } = renderHook(() => useModernCourseStore());

  await act(async () => {
    await result.current.fetchCourses();
  });

  expect(result.current.courses).toBeDefined();
  expect(result.current.loading).toBe(false);
});
```

---

## Migration Guidelines

### 1. Backward Compatibility

During migration phase, maintain backward compatibility:

```typescript
// ✅ Provide legacy exports during transition
export const fetchCourses = (options?: CourseFilterOptions) =>
  modernCourseService.getCourses(options);

// ❌ Don't break existing imports immediately
```

### 2. Gradual Adoption

1. **Phase 1**: Implement modern service alongside legacy
2. **Phase 2**: Update high-traffic components to use modern service
3. **Phase 3**: Remove legacy service after full adoption

### 3. Component Migration

```typescript
// Before: Legacy pattern
import { fetchCourses } from '@/services/resources/courseService';

// After: Modern pattern
import { modernCourseService } from '@/services/resources/modernCourseService';
// OR with store integration
import { useModernCourseStore } from '@/store/modernCourseStore';
```

---

## Common Patterns

### 1. CRUD Operations

Standard pattern for Create, Read, Update, Delete:

```typescript
// Create
async createEntity(data: CreateEntityData): Promise<Entity>

// Read (single)
async getEntityById(id: string): Promise<Entity>

// Read (list with filters)
async getEntities(filters: EntityFilters): Promise<IPaginatedResponse<Entity>>

// Update
async updateEntity(id: string, data: Partial<Entity>): Promise<Entity>

// Delete
async deleteEntity(id: string): Promise<void>
```

### 2. Status Management

For entities with status workflows:

```typescript
async updateEntityStatus(id: string, status: EntityStatus): Promise<Entity>
async publishEntity(id: string): Promise<Entity> // Helper methods
async archiveEntity(id: string): Promise<Entity>
```

### 3. Related Data Operations

For operations involving related entities:

```typescript
async getEntityTasks(entityId: string): Promise<IPaginatedResponse<Task>>
async getEntityProgress(entityId: string): Promise<Progress[]>
```

---

## Anti-Patterns to Avoid

### 1. Service State Management

```typescript
// ❌ Don't store state in services
class BadService {
  private cachedData: any[] = []; // Avoid this
}

// ✅ Keep services stateless
class GoodService extends BaseService {
  // No instance state, only methods
}
```

### 2. Direct API Client Usage

```typescript
// ❌ Don't use API client directly in components
import { apiClient } from '@/api/client';
const data = await apiClient.get('/courses');

// ✅ Use services
import { modernCourseService } from '@/services/resources/modernCourseService';
const data = await modernCourseService.getCourses();
```

### 3. Mixed Concerns

```typescript
// ❌ Don't mix authentication logic in domain services
class BadCourseService {
  async getCourses() {
    if (!this.isAuthenticated()) { // Wrong place for auth logic
      throw new Error('Unauthorized');
    }
    // ...
  }
}

// ✅ Keep authentication separate
class GoodCourseService extends BaseService {
  async getCourses() {
    // BaseService handles authentication
    return this.apiClient.get(url); // Auth is handled in API client
  }
}
```

---

## Checklist for New Services

- [ ] Extends BaseService
- [ ] Uses ServiceFactory for instantiation
- [ ] All methods wrapped with withManagedExceptions
- [ ] Comprehensive TSDoc documentation
- [ ] TypeScript interfaces for all parameters
- [ ] Unit tests with >90% coverage
- [ ] Integration tests for store integration
- [ ] Error handling validation
- [ ] Performance benchmarking (if applicable)
- [ ] Backward compatibility exports (during migration)

---

## Related Documentation

- [TypeScript Service Migration Guide](../standards/TypeScript-Service-Migration-Guide.md)
- [ServiceFactory Documentation](../../frontend/src/services/factory/README.md)
- [Error Handling Patterns](../patterns/error-handling-patterns.md)
- [Zustand Store Integration Guide](../guides/zustand-integration-guide.md)

---

**Maintained by**: Development Team
**Review Cycle**: Quarterly
**Next Review**: 2025-12-15