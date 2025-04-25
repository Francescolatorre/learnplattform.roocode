import {IUserProgress} from '@/types/progress';
import {IStudentProgressSummary} from '@/types';

import {ApiService} from '@/services/api/apiService';
import {ICourse, TCourseStatus} from '@/types/course';
import {ILearningTask, ITaskProgress} from '@/types/task';
import {IPaginatedResponse} from 'src/types/paginatedResponse';

import {API_CONFIG} from '../api/apiConfig';

/**
 * Options for filtering courses in API requests
 */
export interface CourseFilterOptions {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  creator?: number | null;
  ordering?: string;
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
  private apiCourse = new ApiService<ICourse>();
  private apiCourses = new ApiService<IPaginatedResponse<ICourse>>();
  private apiVoid = new ApiService<void>();
  private apiAny = new ApiService<unknown>();
  private transformUserProgressToStudentSummary(userProgress: IUserProgress[]): IStudentProgressSummary[] {
    return userProgress.map(progress => ({
      user_id: progress.id, // Assuming 'id' corresponds to 'user_id'
      username: progress.label || 'Unknown', // Using 'label' as a fallback for username
      overall_progress: progress.percentage, // Using 'percentage' for overall progress
      courses_enrolled: 1 // Example logic, adjust as necessary
    }));
  }

  private apiTaskProgressArray = new ApiService<ITaskProgress[]>();
  private apiLearningTasks = new ApiService<IPaginatedResponse<ILearningTask>>();

  /**
   * Fetches a paginated list of courses with optional filtering
   * @param options
   */
  async fetchCourses(options: CourseFilterOptions = {}): Promise<IPaginatedResponse<ICourse>> {
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
  async createCourse(courseData: Partial<ICourse>): Promise<ICourse> {
    return this.apiCourse.post(API_CONFIG.endpoints.courses.create, courseData);
  }

  /**
   * Retrieves detailed information for a specific course
   * @param courseId
   */
  async getCourseDetails(courseId: string): Promise<ICourse> {
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
  async updateCourse(courseId: string, courseData: Partial<ICourse>): Promise<ICourse> {
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
  async fetchInstructorCourses(): Promise<IPaginatedResponse<ICourse>> {
    return this.apiCourses.get(API_CONFIG.endpoints.courses.instructorCourses);
  }

  /**
   * Changes the status of a course
   * @param courseId
   * @param status
   */
  async updateCourseStatus(courseId: string, status: TCourseStatus): Promise<ICourse> {
    return this.apiCourse.patch(`${API_CONFIG.endpoints.courses.updateStatus}/${courseId}`, {status});
  }

  /**
   * Archives a course
   * @param courseId
   */
  async archiveCourse(courseId: string): Promise<ICourse> {
    return this.updateCourseStatus(courseId, 'private');
  }

  /**
   * Publishes a course
   * @param courseId
   */
  async publishCourse(courseId: string): Promise<ICourse> {
    return this.updateCourseStatus(courseId, 'published');
  }

  /**
   * Fetches course progress for the current user
   * @param courseId - ID of the course to fetch progress for
   * @returns Promise containing an array of task progress records
   */
  async fetchCourseProgress(courseId: string): Promise<ITaskProgress[]> {
    return this.apiTaskProgressArray.get(`${API_CONFIG.endpoints.courses.progress}/${courseId}`);
  }

  /**
   * Fetches learning tasks associated with a specific course
   * @param courseId - ID of the course to fetch tasks for
   * @returns Promise containing a paginated response of learning tasks
   */
  async getCourseTasks(courseId: string): Promise<IPaginatedResponse<ILearningTask>> {
    return this.apiLearningTasks.get(API_CONFIG.endpoints.tasks.byCourse(courseId));
  }
}

export const courseService = new CourseService();
export default courseService;
