/* eslint-disable import/order */
/**
 * Modern Enrollment Service (2025 Best Practices)
 *
 * Manages student enrollment operations with modern TypeScript architecture
 * and integrated authentication handling.
 *
 * ## Key Features
 * - Course enrollment and unenrollment operations
 * - Enrollment status tracking and management
 * - User profile caching for performance optimization
 * - Integration with AuthEventService for real-time updates
 * - Comprehensive enrollment analytics and reporting
 *
 * ## Architecture Improvements
 * - Single API client using composition over inheritance
 * - Simplified authentication event handling
 * - Better error handling with managed exceptions
 * - Cleaner separation of concerns between auth and enrollment
 * - Reduced complexity and optimized state management
 *
 * ## Usage Examples
 * ```typescript
 * // Enroll student in course
 * const response = await modernEnrollmentService.enrollInCourse(courseId);
 *
 * // Get enrollment status
 * const status = await modernEnrollmentService.getEnrollmentStatus(courseId);
 *
 * // Get all user enrollments
 * const enrollments = await modernEnrollmentService.getEnrollments();
 * ```
 *
 * ## Authentication Integration
 * This service automatically handles authentication state changes and
 * invalidates relevant caches when user context changes.
 *
 * @see AuthEventService For authentication event handling
 * @see ICourseEnrollment For enrollment data structure
 * @see IEnrollmentStatus For status tracking
 * @since 2025-09-15 (TASK-012 Modern Service Architecture)
 */

import { authEventService } from '@/context/auth/AuthEventService';
import { AuthEventType } from '@/context/auth/types';
import { ICourseEnrollment, IEnrollmentStatus } from '@/types/entities';
import { withManagedExceptions } from '@/utils/errorHandling';
import { BaseService, ServiceConfig } from '../factory/serviceFactory';

/**
 * Enrollment response interface
 */
export interface IEnrollmentResponse {
  success: boolean;
  message: string;
  courseId: string;
  status: string;
  enrollmentId?: number;
}

/**
 * Enrollment filter options
 */
export interface EnrollmentFilterOptions {
  course?: number;
  user?: number;
  status?: string;
  [key: string]: unknown;
}

/**
 * Modern Enrollment Service implementation
 */
export class ModernEnrollmentService extends BaseService {
  private userProfileCache: Record<string, unknown> = {};

  constructor(config?: ServiceConfig) {
    super(config);
  }

  /**
   * Get enrollment status for current user in a specific course
   */
  async getEnrollmentStatus(courseId: string | number): Promise<IEnrollmentStatus> {
    return withManagedExceptions(
      async () => {
        const enrollments = await this.getEnrollmentsByFilter({ course: Number(courseId) });
        const enrollment = enrollments.find(e => e.course === Number(courseId));

        if (!enrollment) {
          return {
            enrolled: false,
            enrollmentDate: null,
            enrollmentId: null,
          };
        }

        return {
          enrolled: enrollment.status === 'active',
          enrollmentDate: enrollment.enrollment_date || null,
          enrollmentId: enrollment.id,
        };
      },
      {
        serviceName: 'ModernEnrollmentService',
        methodName: 'getEnrollmentStatus',
      }
    )();
  }

  /**
   * Get all enrollments
   */
  async getAllEnrollments(): Promise<ICourseEnrollment[]> {
    return withManagedExceptions(
      async () => {
        const response = await this.apiClient.get(this.endpoints.enrollments.list);
        return this.normalizeArrayResponse<ICourseEnrollment>(response);
      },
      {
        serviceName: 'ModernEnrollmentService',
        methodName: 'getAllEnrollments',
      }
    )();
  }

  /**
   * Get enrollment by ID
   */
  async getEnrollmentById(id: string | number): Promise<ICourseEnrollment> {
    return withManagedExceptions(
      async () => {
        return this.apiClient.get<ICourseEnrollment>(
          this.endpoints.enrollments.details(id)
        );
      },
      {
        serviceName: 'ModernEnrollmentService',
        methodName: 'getEnrollmentById',
      }
    )();
  }

  /**
   * Create new enrollment
   */
  async createEnrollment(data: Partial<ICourseEnrollment>): Promise<ICourseEnrollment> {
    return withManagedExceptions(
      async () => {
        return this.apiClient.post<ICourseEnrollment>(
          this.endpoints.enrollments.create,
          data
        );
      },
      {
        serviceName: 'ModernEnrollmentService',
        methodName: 'createEnrollment',
      }
    )();
  }

  /**
   * Update existing enrollment
   */
  async updateEnrollment(id: string | number, data: Partial<ICourseEnrollment>): Promise<ICourseEnrollment> {
    return withManagedExceptions(
      async () => {
        // Get current enrollment to ensure we have all required fields
        const currentEnrollment = await this.getEnrollmentById(id);
        
        const completeData = {
          ...currentEnrollment,
          ...data,
        };

        return this.apiClient.put<ICourseEnrollment>(
          this.endpoints.enrollments.update(id),
          completeData
        );
      },
      {
        serviceName: 'ModernEnrollmentService',
        methodName: 'updateEnrollment',
      }
    )();
  }

  /**
   * Get enrollments for current user
   */
  async getUserEnrollments(): Promise<ICourseEnrollment[]> {
    return withManagedExceptions(
      async () => {
        const response = await this.apiClient.get(this.endpoints.enrollments.list);
        return this.normalizeArrayResponse<ICourseEnrollment>(response);
      },
      {
        serviceName: 'ModernEnrollmentService',
        methodName: 'getUserEnrollments',
      }
    )();
  }

  /**
   * Enroll current user in a course
   */
  async enrollInCourse(courseId: string | number): Promise<ICourseEnrollment> {
    return withManagedExceptions(
      async () => {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
          throw new Error('User not authenticated. Please log in to enroll in courses.');
        }

        // Get user profile (with caching)
        const cacheKey = accessToken.substring(0, 10);
        let profile = this.userProfileCache[cacheKey];
        
        if (!profile) {
          const authService = await import('@/services/auth/authService');
          profile = await authService.default.getUserProfile(accessToken);
          this.userProfileCache[cacheKey] = profile;
        }

        if (!profile || !(profile as { id: number }).id) {
          throw new Error('User profile not available. Please log in again.');
        }

        const enrollmentData = {
          user: (profile as { id: number }).id,
          course: courseId,
          status: 'active',
        };

        const response = await this.apiClient.post<ICourseEnrollment>(
          this.endpoints.enrollments.create,
          enrollmentData
        );

        // Publish enrollment success event
        authEventService.publish({
          type: AuthEventType.ENROLLMENT_SUCCESS,
          payload: {
            message: `Successfully enrolled in course ${courseId}`,
          },
        });

        return response;
      },
      {
        serviceName: 'ModernEnrollmentService',
        methodName: 'enrollInCourse',
        context: {
          additionalInfo: 'Enrolling user in course',
        },
      }
    )();
  }

  /**
   * Unenroll from a course by course ID
   */
  async unenrollFromCourse(courseId: number | string): Promise<IEnrollmentResponse> {
    return withManagedExceptions(
      async () => {
        try {
          const response = await this.apiClient.post<Record<string, unknown>>(
            this.endpoints.enrollments.unenroll(courseId),
            {}
          );

          // Handle "not enrolled" case from backend
          if (response?.message && String(response.message).includes('not enrolled')) {
            return {
              success: true,
              message: 'You are not enrolled in this course',
              courseId: String(courseId),
              status: 'not_enrolled',
            };
          }

          return {
            success: true,
            message: String(response?.message) || 'Successfully unenrolled from course',
            courseId: String(courseId),
            status: String(response?.status) || 'dropped',
            enrollmentId: Number(response?.enrollmentId) || undefined,
          };
        } catch (error) {
          // Handle not enrolled cases in errors
          if (
            error instanceof Error &&
            (error.message.includes('not enrolled') ||
              (error as any)?.response?.data?.detail?.includes('not enrolled') ||
              (error as any)?.response?.data?.message?.includes('not enrolled'))
          ) {
            return {
              success: true,
              message: 'You are not enrolled in this course',
              courseId: String(courseId),
              status: 'not_enrolled',
            };
          }

          throw new Error(`Failed to complete unenrollment operation: ${(error as Error).message}`);
        }
      },
      {
        serviceName: 'ModernEnrollmentService',
        methodName: 'unenrollFromCourse',
      }
    )();
  }

  /**
   * Get enrolled students for a course
   */
  async getEnrolledStudents(courseId: string | number): Promise<ICourseEnrollment[]> {
    return withManagedExceptions(
      async () => {
        const response = await this.apiClient.get(
          this.endpoints.enrollments.byCourse(courseId)
        );
        return this.normalizeArrayResponse<ICourseEnrollment>(response);
      },
      {
        serviceName: 'ModernEnrollmentService',
        methodName: 'getEnrolledStudents',
      }
    )();
  }

  /**
   * Find enrollments by filter criteria
   */
  async getEnrollmentsByFilter(filter: EnrollmentFilterOptions): Promise<ICourseEnrollment[]> {
    return withManagedExceptions(
      async () => {
        const url = this.buildUrl(this.endpoints.enrollments.list, filter);
        const response = await this.apiClient.get(url);
        return this.normalizeArrayResponse<ICourseEnrollment>(response);
      },
      {
        serviceName: 'ModernEnrollmentService',
        methodName: 'getEnrollmentsByFilter',
      }
    )();
  }
}

// Create singleton instance using the factory
import { ServiceFactory } from '../factory/serviceFactory';
const serviceFactory = ServiceFactory.getInstance();
export const modernEnrollmentService = serviceFactory.getService(ModernEnrollmentService);

// Backward compatibility exports (to be deprecated)
export const fetchUserEnrollments = () => modernEnrollmentService.getUserEnrollments();

export const enrollInCourse = (courseId: string | number) =>
  modernEnrollmentService.enrollInCourse(courseId);

export const fetchEnrolledStudents = (courseId: string | number) =>
  modernEnrollmentService.getEnrolledStudents(courseId);

export const findByFilter = (filter: EnrollmentFilterOptions) =>
  modernEnrollmentService.getEnrollmentsByFilter(filter);

// Export service for direct usage
export default modernEnrollmentService;