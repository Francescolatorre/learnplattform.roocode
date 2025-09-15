/* eslint-disable import/order */
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
    const url = this.buildUrl(this.endpoints.courses.list, options);

    return withManagedExceptions(async () => {
      const response = await this.apiClient.get(url);
      return this.normalizePaginatedResponse<ICourse>(response);
    });
  }

  /**
   * Get detailed information for a specific course
   */
  async getCourseDetails(courseId: number): Promise<ICourse> {
    const url = `${this.endpoints.courses.list}${courseId}/`;

    return withManagedExceptions(async () => {
      return await this.apiClient.get(url);
    });
  }

  /**
   * Get course by ID (alias for getCourseDetails for backward compatibility)
   */
  async getCourseById(courseId: string | number): Promise<ICourse> {
    return this.getCourseDetails(Number(courseId));
  }

  /**
   * Create a new course
   */
  async createCourse(courseData: Partial<ICourse>): Promise<ICourse> {
    return withManagedExceptions(async () => {
      return await this.apiClient.post(this.endpoints.courses.list, courseData);
    });
  }

  /**
   * Update an existing course
   */
  async updateCourse(courseId: string | number, courseData: Partial<ICourse>): Promise<ICourse> {
    const url = `${this.endpoints.courses.list}${courseId}/`;

    return withManagedExceptions(async () => {
      return await this.apiClient.put(url, courseData);
    });
  }

  /**
   * Delete a course
   */
  async deleteCourse(courseId: string | number): Promise<boolean> {
    const url = `${this.endpoints.courses.list}${courseId}/`;

    return withManagedExceptions(async () => {
      await this.apiClient.delete(url);
      return true;
    });
  }

  /**
   * Get courses for instructor (filtered by creator)
   */
  async getInstructorCourses(options: CourseFilterOptions = {}): Promise<IPaginatedResponse<ICourse>> {
    // Add creator filter - this would typically come from auth context
    const instructorOptions = { ...options, creator: 'me' };
    return this.getCourses(instructorOptions);
  }

  /**
   * Update course status
   */
  async updateCourseStatus(courseId: string | number, status: TCourseStatus): Promise<ICourse> {
    return this.updateCourse(courseId, { status });
  }

  /**
   * Archive a course
   */
  async archiveCourse(courseId: string | number): Promise<ICourse> {
    return this.updateCourseStatus(courseId, 'archived');
  }

  /**
   * Publish a course
   */
  async publishCourse(courseId: string | number): Promise<ICourse> {
    return this.updateCourseStatus(courseId, 'published');
  }

  /**
   * Get course progress for all students
   */
  async getCourseProgress(courseId: string | number): Promise<ITaskProgress[]> {
    const url = `${this.endpoints.courses.list}${courseId}/progress/`;

    return withManagedExceptions(async () => {
      const response = await this.apiClient.get(url);
      return this.normalizeArrayResponse<ITaskProgress>(response);
    });
  }

  /**
   * Get learning tasks for a course
   */
  async getCourseTasks(courseId: string | number): Promise<ILearningTask[]> {
    const url = this.buildUrl(this.endpoints.learningTasks.list, { course: courseId });

    return withManagedExceptions(async () => {
      const response = await this.apiClient.get(url);
      return this.normalizeArrayResponse<ILearningTask>(response);
    });
  }

  /**
   * Enroll a student in a course
   */
  async enrollStudent(courseId: string | number, studentId: string | number): Promise<boolean> {
    const url = `${this.endpoints.courses.list}${courseId}/enroll/`;

    return withManagedExceptions(async () => {
      await this.apiClient.post(url, { student_id: studentId });
      return true;
    });
  }

  /**
   * Get student progress summary for a course
   */
  async getStudentProgress(courseId: number): Promise<IStudentProgressSummary[]> {
    const url = `${this.endpoints.courses.list}${courseId}/student-progress/`;

    return withManagedExceptions(async () => {
      const response = await this.apiClient.get(url);
      return this.normalizeArrayResponse<IStudentProgressSummary>(response);
    });
  }

  /**
   * Transform user progress data to student progress summary
   * This utility method helps with data transformation patterns
   */
  transformUserProgressToStudentSummary(userProgress: IUserProgress): IStudentProgressSummary {
    console.log('CourseService: Transforming user progress to student summary');

    return {
      user_id: userProgress.user_id,
      username: userProgress.username || 'Unknown',
      email: userProgress.email || '',
      display_name: userProgress.display_name || userProgress.username || 'Unknown User',
      total_tasks: userProgress.tasks?.length || 0,
      completed_tasks: userProgress.tasks?.filter(task => task.completed).length || 0,
      completion_percentage: userProgress.tasks?.length ?
        Math.round((userProgress.tasks.filter(task => task.completed).length / userProgress.tasks.length) * 100) : 0,
      last_activity: userProgress.last_login || new Date().toISOString(),
      enrollment_date: userProgress.enrolled_at || new Date().toISOString(),
      total_time_spent: 0, // Would need to be calculated from task data
      average_score: 0 // Would need to be calculated from quiz/task scores
    };
  }
}