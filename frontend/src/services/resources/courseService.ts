import {ApiService} from '@/services/api/apiService';
import {IPaginatedResponse} from 'src/types/common';
import {Course, CourseStatus} from 'src/types/common/entities';

import {API_CONFIG} from '../api/apiConfig';

export interface CourseFilterOptions {
  page?: number;
  page_size?: number;
  search?: string;
  status?: CourseStatus;
  creator?: number;
}

/**
 * Service for managing course-related operations, including CRUD, enrollment, status updates, and progress tracking.
 *
 * This service provides a standardized API for interacting with course resources via the backend API.
 * All methods are asynchronous and return typed promises. Error handling is consistent and domain-focused.
 *
 * Dependencies:
 * - apiService: Handles HTTP requests to the backend API.
 * - API_CONFIG: Provides endpoint configuration for course-related API routes.
 *
 * Usage:
 *   import { courseService } from './courseService';
 *   const courses = await courseService.fetchCourses();
 *
 * All public methods are documented with TSDoc.
 */
class CourseService {
  private apiCourse = new ApiService<Course>();
  private apiCourses = new ApiService<IPaginatedResponse<Course>>();
  private apiVoid = new ApiService<void>();
  private apiAny = new ApiService<unknown>();

  /**
   * Fetches a paginated list of courses with optional filtering
   * @param options
   */
  async fetchCourses(options: CourseFilterOptions = {}): Promise<IPaginatedResponse<Course>> {
    const queryParams = new URLSearchParams();

    if (options.page) queryParams.append('page', options.page.toString());
    if (options.page_size) queryParams.append('page_size', options.page_size.toString());
    if (options.search) queryParams.append('search', options.search);
    if (options.status) queryParams.append('status', options.status);
    if (options.creator) queryParams.append('creator', options.creator.toString());

    const url = `${API_CONFIG.endpoints.courses.list}?${queryParams.toString()}`;

    return this.apiCourses.get(url);
  }

  /**
   * Creates a new course
   * @param courseData
   */
  async createCourse(courseData: Partial<Course>): Promise<Course> {
    return this.apiCourse.post(API_CONFIG.endpoints.courses.create, courseData);
  }

  /**
   * Retrieves detailed information for a specific course
   * @param courseId
   */
  async getCourseDetails(courseId: string): Promise<Course> {
    const response = await this.apiCourse.get(API_CONFIG.endpoints.courses.details(courseId));
    if (!response) {
      throw new Error('Course not found');
    }
    return response;
  }

  /**
   * Updates an existing course
   * @param courseId
   * @param courseData
   */
  async updateCourse(courseId: string, courseData: Partial<Course>): Promise<Course> {
    return this.apiCourse.patch(
      API_CONFIG.endpoints.courses.update(courseId),
      courseData
    );
  }

  /**
   * Deletes a course
   * @param courseId
   */
  async deleteCourse(courseId: string): Promise<void> {
    await this.apiVoid.delete(API_CONFIG.endpoints.courses.delete(courseId));
  }

  /**
   * Enrolls the current user in a course
   * @param courseId
   */
  async enrollInCourse(courseId: string): Promise<void> {
    await this.apiVoid.post(API_CONFIG.endpoints.courses.enroll(courseId), {course_id: courseId});
  }



  /**
   * Fetches courses where the current user is an instructor
   */
  async fetchInstructorCourses(): Promise<IPaginatedResponse<Course>> {
    return this.apiCourses.get(API_CONFIG.endpoints.courses.instructorCourses);
  }

  /**
   * Changes the status of a course
   * @param courseId
   * @param status
   */
  async updateCourseStatus(courseId: string, status: CourseStatus): Promise<Course> {
    return this.apiCourse.patch(`${API_CONFIG.endpoints.courses.updateStatus}/${courseId}`, {status});
  }

  /**
   * Archives a course
   * @param courseId
   */
  async archiveCourse(courseId: string): Promise<Course> {
    return this.updateCourseStatus(courseId, 'private');
  }

  /**
   * Publishes a course
   * @param courseId
   */
  async publishCourse(courseId: string): Promise<Course> {
    return this.updateCourseStatus(courseId, 'published');
  }

  /**
   * Fetches course progress for the current user
   * @param courseId
   */
  async fetchCourseProgress(courseId: string): Promise<unknown> {
    return this.apiAny.get(`${API_CONFIG.endpoints.courses.progress}/${courseId}`);
  }

  /**
   * Fetches tasks for a specific course
   * @param courseId
   */
  async getCourseTasks(courseId: string): Promise<unknown> {
    return this.apiAny.get(API_CONFIG.endpoints.courses.tasks(courseId));
  }
}

export const courseService = new CourseService();
export default courseService;
