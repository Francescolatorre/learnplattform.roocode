/**
 * Modern Course Service (2025 Best Practices)
 * 
 * Demonstrates the improved architecture:
 * - Composition over inheritance
 * - Single API client instance
 * - Functional approach with minimal state
 * - Better error handling and type safety
 * - Cleaner separation of concerns
 */

import { IStudentProgressSummary, IUserProgress } from '@/types';
import { ICourse, TCourseStatus } from '@/types/course';
import { IPaginatedResponse } from '@/types/paginatedResponse';
import { ILearningTask, ITaskProgress } from '@/types/Task';
import { withManagedExceptions } from '@/utils/errorHandling';

import { BaseService, ServiceConfig } from '../factory/serviceFactory';

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
  [key: string]: unknown;
}

/**
 * Modern Course Service implementation
 * 
 * Key improvements:
 * - Single API client (composition over multiple instances)
 * - Cleaner method signatures with better type inference
 * - Reduced complexity and state management
 * - Better error handling patterns
 */
export class ModernCourseService extends BaseService {
  constructor(config?: ServiceConfig) {
    super(config);
  }

  /**
   * Fetch paginated list of courses with optional filtering
   */
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

  /**
   * Get detailed information for a specific course
   */
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
      }
    )();
  }

  /**
   * Create a new course
   */
  async createCourse(courseData: Partial<ICourse>): Promise<ICourse> {
    return withManagedExceptions(
      async () => {
        return this.apiClient.post<ICourse>(
          this.endpoints.courses.create,
          courseData
        );
      },
      {
        serviceName: 'ModernCourseService',
        methodName: 'createCourse',
      }
    )();
  }

  /**
   * Update an existing course
   */
  async updateCourse(courseId: string, courseData: Partial<ICourse>): Promise<ICourse> {
    return withManagedExceptions(
      async () => {
        return this.apiClient.patch<ICourse>(
          this.endpoints.courses.update(courseId),
          courseData
        );
      },
      {
        serviceName: 'ModernCourseService',
        methodName: 'updateCourse',
      }
    )();
  }

  /**
   * Delete a course
   */
  async deleteCourse(courseId: string): Promise<void> {
    return withManagedExceptions(
      async () => {
        await this.apiClient.delete<void>(
          this.endpoints.courses.delete(courseId)
        );
      },
      {
        serviceName: 'ModernCourseService',
        methodName: 'deleteCourse',
      }
    )();
  }

  /**
   * Get courses where current user is instructor
   */
  async getInstructorCourses(options: CourseFilterOptions = {}): Promise<IPaginatedResponse<ICourse>> {
    return withManagedExceptions(
      async () => {
        const url = this.buildUrl(this.endpoints.courses.instructorCourses, options);
        const response = await this.apiClient.get(url);
        return this.normalizePaginatedResponse<ICourse>(response);
      },
      {
        serviceName: 'ModernCourseService',
        methodName: 'getInstructorCourses',
      }
    )();
  }

  /**
   * Update course status
   */
  async updateCourseStatus(courseId: string, status: TCourseStatus): Promise<ICourse> {
    return withManagedExceptions(
      async () => {
        return this.apiClient.patch<ICourse>(
          this.endpoints.courses.updateStatus(courseId),
          { status }
        );
      },
      {
        serviceName: 'ModernCourseService',
        methodName: 'updateCourseStatus',
      }
    )();
  }

  /**
   * Archive a course
   */
  async archiveCourse(courseId: string): Promise<ICourse> {
    return this.updateCourseStatus(courseId, 'archived');
  }

  /**
   * Publish a course
   */
  async publishCourse(courseId: string): Promise<ICourse> {
    return this.updateCourseStatus(courseId, 'published');
  }

  /**
   * Get course progress for current user
   */
  async getCourseProgress(courseId: string): Promise<ITaskProgress[]> {
    return withManagedExceptions(
      async () => {
        const response = await this.apiClient.get(
          this.endpoints.courses.progress(courseId)
        );
        return this.normalizeArrayResponse<ITaskProgress>(response);
      },
      {
        serviceName: 'ModernCourseService',
        methodName: 'getCourseProgress',
      }
    )();
  }

  /**
   * Get learning tasks for a course
   */
  async getCourseTasks(courseId: string): Promise<IPaginatedResponse<ILearningTask>> {
    return withManagedExceptions(
      async () => {
        const response = await this.apiClient.get(
          this.endpoints.tasks.byCourse(courseId)
        );
        return this.normalizePaginatedResponse<ILearningTask>(response);
      },
      {
        serviceName: 'ModernCourseService',
        methodName: 'getCourseTasks',
      }
    )();
  }

  /**
   * Enroll student in course
   */
  async enrollStudent(courseId: string | number, studentId: string | number): Promise<unknown> {
    return withManagedExceptions(
      async () => {
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
      }
    )();
  }

  /**
   * Transform user progress to student summary
   * (Utility method - could be moved to a separate utility class)
   */
  transformUserProgressToStudentSummary(progress: IUserProgress): IStudentProgressSummary {
    return {
      progress: progress.percentage,
      user_info: {
        id: progress.id.toString(),
        username: progress.label,
        display_name: progress.label,
        role: 'student',
      },
      overall_stats: {
        courses_enrolled: 1,
        courses_completed: 0,
        overall_progress: progress.percentage,
        tasks_completed: 0,
        tasks_in_progress: 0,
        tasks_overdue: 0,
      },
      courses: [
        {
          id: progress.id.toString(),
          title: progress.label,
          progress: progress.percentage,
          status: 'active',
          enrolled_date: new Date().toISOString(),
          last_activity_date: new Date().toISOString(),
        },
      ],
    };
  }
}

// Create singleton instance using the factory
import { ServiceFactory } from '../factory/serviceFactory';
const serviceFactory = ServiceFactory.getInstance();
export const modernCourseService = serviceFactory.getService(ModernCourseService);

// Backward compatibility exports (to be deprecated)
export const fetchCourses = (options?: CourseFilterOptions) => 
  modernCourseService.getCourses(options);

export const getCourseDetails = (courseId: string) => 
  modernCourseService.getCourseById(courseId);

export const createCourse = (courseData: Partial<ICourse>) => 
  modernCourseService.createCourse(courseData);

export const updateCourse = (courseId: string, courseData: Partial<ICourse>) => 
  modernCourseService.updateCourse(courseId, courseData);

export const deleteCourse = (courseId: string) => 
  modernCourseService.deleteCourse(courseId);

export const fetchInstructorCourses = (options?: CourseFilterOptions) => 
  modernCourseService.getInstructorCourses(options);

export const updateCourseStatus = (courseId: string, status: TCourseStatus) => 
  modernCourseService.updateCourseStatus(courseId, status);

export const archiveCourse = (courseId: string) => 
  modernCourseService.archiveCourse(courseId);

export const publishCourse = (courseId: string) => 
  modernCourseService.publishCourse(courseId);

export const fetchCourseProgress = (courseId: string) => 
  modernCourseService.getCourseProgress(courseId);

export const getCourseTasks = (courseId: string) => 
  modernCourseService.getCourseTasks(courseId);

export const enrollStudent = (courseId: string | number, studentId: string | number) => 
  modernCourseService.enrollStudent(courseId, studentId);