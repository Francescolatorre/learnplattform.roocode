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
      user_id: progress.id,
      username: progress.label || 'Unknown',
      overall_progress: progress.percentage,
      courses_enrolled: 1,
      progress: progress.percentage // Assuming 'percentage' corresponds to 'progress'
    }));
  }

  private apiTaskProgressArray = new ApiService<ITaskProgress[]>();
  private apiLearningTasks = new ApiService<IPaginatedResponse<ILearningTask>>();

  /**
   * Fetches a paginated list of courses with optional filtering
   * @param options
   */
  async fetchCourses(options: CourseFilterOptions = {}): Promise<IPaginatedResponse<ICourse>> {
    console.info('CourseService: fetchCourses called with options:', options);
    const queryParams = new URLSearchParams();

    if (options.page) queryParams.append('page', options.page.toString());
    if (options.page_size) queryParams.append('page_size', options.page_size.toString());
    if (options.search) queryParams.append('search', options.search);
    if (options.status) queryParams.append('status', options.status);
    if (options.creator) queryParams.append('creator', options.creator.toString());

    const url = `${API_CONFIG.endpoints.courses.list}?${queryParams.toString()}`;
    console.debug('CourseService: Fetching courses with URL:', url);

    try {
      const response = await this.apiCourses.get(url);
      console.info('CourseService: fetchCourses succeeded', {
        count: response.count,
        resultsLength: response.results?.length || 0
      });
      return response;
    } catch (error) {
      console.error('CourseService: fetchCourses failed', error);
      throw error;
    }
  }

  /**
   * Creates a new course
   * @param courseData
   */
  async createCourse(courseData: Partial<ICourse>): Promise<ICourse> {
    try {
      console.info('CourseService: Creating course with data:', courseData);
      // Make sure we're using token from localStorage
      this.ensureAuthToken();

      const course = await this.apiCourse.post(API_CONFIG.endpoints.courses.create, courseData);
      console.info('CourseService: Course created successfully:', {
        id: course.id,
        title: course.title
      });
      return course;
    } catch (error) {
      console.error('CourseService: Failed to create course:', error);
      // Add better error information
      if (error instanceof Error) {
        const response = (error as any).response;
        if (response) {
          console.error('CourseService: Error response:', {
            status: response.status,
            data: response.data
          });
        }
      }
      throw error;
    }
  }

  /**
   * Retrieves detailed information for a specific course
   * @param courseId
   */
  async getCourseDetails(courseId: string): Promise<ICourse> {
    console.info(`CourseService: Getting details for course ${courseId}`);
    try {
      const response = await this.apiCourse.get(API_CONFIG.endpoints.courses.details(courseId));
      if (!response) {
        console.error(`CourseService: Course ${courseId} not found`);
        throw new Error('Course not found');
      }
      console.info(`CourseService: Successfully retrieved course ${courseId}`, {
        title: response.title,
        status: response.status
      });
      return response;
    } catch (error) {
      console.error(`CourseService: Failed to get course details for ${courseId}`, error);
      throw error;
    }
  }

  /**
   * Updates an existing course
   * @param courseId
   * @param courseData
   */
  async updateCourse(courseId: string, courseData: Partial<ICourse>): Promise<ICourse> {
    console.info(`CourseService: Updating course ${courseId}`, courseData);
    try {
      const response = await this.apiCourse.patch(
        API_CONFIG.endpoints.courses.update(courseId),
        courseData
      );
      console.info(`CourseService: Successfully updated course ${courseId}`);
      return response;
    } catch (error) {
      console.error(`CourseService: Failed to update course ${courseId}`, error);
      throw error;
    }
  }

  /**
   * Deletes a course
   * @param courseId
   */
  async deleteCourse(courseId: string): Promise<void> {
    console.info(`CourseService: Deleting course ${courseId}`);
    try {
      await this.apiVoid.delete(API_CONFIG.endpoints.courses.delete(courseId));
      console.info(`CourseService: Successfully deleted course ${courseId}`);
    } catch (error) {
      console.error(`CourseService: Failed to delete course ${courseId}`, error);
      throw error;
    }
  }

  /**
   * Enrolls the current user in a course
   * @param courseId
   */

  /**
     * Fetches courses where the current user is an instructor
     * @param options Optional pagination and filtering options
     */
  async fetchInstructorCourses(options: CourseFilterOptions = {}): Promise<IPaginatedResponse<ICourse>> {
    console.info('CourseService: Fetching instructor courses with options:', options);
    try {
      // Prepare query parameters
      const queryParams = new URLSearchParams();
      if (options.page) queryParams.append('page', options.page.toString());
      if (options.page_size) queryParams.append('page_size', options.page_size.toString());
      if (options.search) queryParams.append('search', options.search);
      if (options.status) queryParams.append('status', options.status);

      // Construct URL with query parameters
      const url = queryParams.toString()
        ? `${API_CONFIG.endpoints.courses.instructorCourses}?${queryParams.toString()}`
        : API_CONFIG.endpoints.courses.instructorCourses;

      console.debug('CourseService: Instructor courses endpoint:', url);

      // Ensure token is set before making the request
      this.ensureAuthToken();

      // Get the current token for debugging
      const token = localStorage.getItem('accessToken');
      console.debug('CourseService: Using access token:', token ? `${token.substring(0, 10)}...` : 'No token found');

      // Make the request
      const response = await this.apiAny.get(url);
      console.debug('CourseService: Raw instructor courses response:', response);

      // Handle both array response and paginated response formats
      let formattedResponse: IPaginatedResponse<ICourse>;

      if (Array.isArray(response)) {
        // If the response is an array, convert it to paginated format
        console.debug('CourseService: Converting array response to paginated format');
        formattedResponse = {
          count: response.length,
          next: null,
          previous: null,
          results: response
        };
      } else if (response && typeof response === 'object') {
        // If it's already in paginated format or some other format
        if (response && typeof response === 'object' && 'results' in response && Array.isArray((response as any).results)) {
          // It's already in the expected paginated format
          formattedResponse = response as IPaginatedResponse<ICourse>;
        } else {
          // It's in some other object format, but not paginated
          // Try to extract results or use whole response as results
          console.warn('CourseService: Unexpected response format, attempting to extract courses');
          formattedResponse = {
            count: (response as any).count || 0,
            next: (response as any).next || null,
            previous: (response as any).previous || null,
            results: (response as any).results || []
          };
        }
      } else {
        // Fallback for unexpected response type
        console.error('CourseService: Unexpected response type', typeof response);
        formattedResponse = {
          count: 0,
          next: null,
          previous: null,
          results: []
        };
      }

      // Log detailed response information
      console.info('CourseService: Instructor courses fetch succeeded', {
        endpoint: url,
        courseCount: formattedResponse.results?.length || 0,
        totalCount: formattedResponse.count || 0,
        hasNextPage: !!formattedResponse.next,
        hasPrevPage: !!formattedResponse.previous
      });

      // Log first course details for debugging (if available)
      if (formattedResponse.results?.length > 0) {
        const firstCourse = formattedResponse.results[0];
        console.debug('CourseService: First course details:', {
          id: firstCourse.id,
          title: firstCourse.title,
          status: firstCourse.status,
          createdAt: firstCourse.created_at
        });
      } else {
        console.debug('CourseService: No instructor courses found in response');
      }

      return formattedResponse;
    } catch (error) {
      console.error('CourseService: Failed to fetch instructor courses', error);

      // Enhanced error logging
      if (error instanceof Error) {
        if ((error as any).response) {
          console.error('CourseService: Error response details:', {
            status: (error as any).response.status,
            statusText: (error as any).response.statusText,
            data: (error as any).response.data,
            headers: (error as any).response.headers
          });
        } else if ((error as any).request) {
          console.error('CourseService: No response received, request details:', {
            method: (error as any).request.method,
            url: (error as any).request.url,
            headers: (error as any).request.headers
          });
        } else {
          console.error('CourseService: Error setting up request:', error.message);
        }
      }

      throw error;
    }
  }

  /**
   * Changes the status of a course
   * @param courseId
   * @param status
   */
  async updateCourseStatus(courseId: string, status: TCourseStatus): Promise<ICourse> {
    console.info(`CourseService: Updating course ${courseId} status to ${status}`);
    try {
      const response = await this.apiCourse.patch(`${API_CONFIG.endpoints.courses.updateStatus}/${courseId}`, {status});
      console.info(`CourseService: Successfully updated course ${courseId} status to ${status}`);
      return response;
    } catch (error) {
      console.error(`CourseService: Failed to update course ${courseId} status`, error);
      throw error;
    }
  }

  /**
   * Archives a course
   * @param courseId
   */
  async archiveCourse(courseId: string): Promise<ICourse> {
    console.info(`CourseService: Archiving course ${courseId}`);
    return this.updateCourseStatus(courseId, 'archived');
  }

  /**
   * Publishes a course
   * @param courseId
   */
  async publishCourse(courseId: string): Promise<ICourse> {
    console.info(`CourseService: Publishing course ${courseId}`);
    return this.updateCourseStatus(courseId, 'published');
  }

  /**
   * Fetches course progress for the current user
   * @param courseId - ID of the course to fetch progress for
   * @returns Promise containing an array of task progress records
   */
  async fetchCourseProgress(courseId: string): Promise<ITaskProgress[]> {
    console.info(`CourseService: Fetching progress for course ${courseId}`);
    try {
      const response = await this.apiTaskProgressArray.get(`${API_CONFIG.endpoints.courses.progress}/${courseId}`);
      console.info(`CourseService: Retrieved progress for course ${courseId}`, {itemCount: response.length});
      return response;
    } catch (error) {
      console.error(`CourseService: Failed to fetch progress for course ${courseId}`, error);
      throw error;
    }
  }

  /**
   * Fetches learning tasks associated with a specific course
   * @param courseId - ID of the course to fetch tasks for
   * @returns Promise containing a paginated response of learning tasks
   */
  async getCourseTasks(courseId: string): Promise<IPaginatedResponse<ILearningTask>> {
    console.info(`CourseService: Fetching tasks for course ${courseId}`);
    try {
      const response = await this.apiLearningTasks.get(API_CONFIG.endpoints.tasks.byCourse(courseId));

      // Ensure response is in the correct format
      const formattedResponse: IPaginatedResponse<ILearningTask> = {
        count: Array.isArray(response) ? response.length : (response.count ?? 0),
        next: response.next || null,
        previous: response.previous || null,
        results: Array.isArray(response) ? response : (response.results || [])
      };

      console.info(`CourseService: Retrieved tasks for course ${courseId}`, {
        count: formattedResponse.count,
        taskCount: formattedResponse.results?.length || 0
      });

      return formattedResponse;
    } catch (error) {
      console.error(`CourseService: Failed to fetch tasks for course ${courseId}`, error);
      throw error;
    }
  }

  /**
   * Explicitly sets the authentication token for all API service instances
   * This is primarily used for testing scenarios where localStorage isn't available
   * @param token JWT auth token to use for API requests
   */
  setAuthToken(token: string): void {
    if (!token) {
      console.warn('CourseService: Attempted to set empty auth token');
      return;
    }

    // Set auth token on all API service instances
    this.apiCourse.setAuthToken(token);
    this.apiCourses.setAuthToken(token);
    this.apiVoid.setAuthToken(token);
    this.apiAny.setAuthToken(token);
    this.apiTaskProgressArray.setAuthToken(token);
    this.apiLearningTasks.setAuthToken(token);

    console.debug('CourseService: Auth tokens explicitly set on all API service instances');
  }

  /**
   * Ensures all API service instances have the auth token set
   * This helps prevent auth issues when tokens are refreshed
   */
  private ensureAuthToken(): void {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('CourseService: No access token found in localStorage');
      return;
    }

    // Set auth token on all API service instances
    this.apiCourse.setAuthToken(token);
    this.apiCourses.setAuthToken(token);
    this.apiVoid.setAuthToken(token);
    this.apiAny.setAuthToken(token);
    this.apiTaskProgressArray.setAuthToken(token);
    this.apiLearningTasks.setAuthToken(token);

    console.debug('CourseService: Auth tokens refreshed on all API service instances');
  }
}

export const courseService = new CourseService();
export default courseService;
