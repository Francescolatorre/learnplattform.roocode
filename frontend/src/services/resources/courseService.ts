import { ApiService } from '@/services/api/apiService';
import { IStudentProgressSummary } from '@/types';
import { ICourse, TCourseStatus } from '@/types/course';
import { IUserProgress } from '@/types/progress';
import { ILearningTask, ITaskProgress } from '@/types/task';
import { IPaginatedResponse } from 'src/types/paginatedResponse';
import { withManagedExceptions } from 'src/utils/errorHandling';

import { API_CONFIG } from '../api/apiConfig';

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

  private apiTaskProgressArray = new ApiService<ITaskProgress[]>();
  private apiLearningTasks = new ApiService<IPaginatedResponse<ILearningTask>>();

  /**
   * Enroll a student in a course.
   * @param courseId - The ID of the course to enroll in.
   * @param studentId - The ID of the student to enroll.
   * @returns The enrollment response from the backend.
   */
  enrollStudent = withManagedExceptions(
    async (courseId: string | number, studentId: string | number): Promise<any> => {
      this.ensureAuthToken();
      const body = { course: courseId, student: studentId };
      const response = await this.apiAny.post(API_CONFIG.endpoints.enrollments.create, body);
      return response;
    },
    {
      serviceName: 'CourseService',
      methodName: 'enrollStudent',
    }
  );

  /**
   * Fetches a paginated list of courses with optional filtering
   * @param options
   */
  fetchCourses = withManagedExceptions(
    async (options: CourseFilterOptions = {}): Promise<IPaginatedResponse<ICourse>> => {
      console.info('CourseService: fetchCourses called with options:', options);
      const queryParams = new URLSearchParams();

      if (options.page) queryParams.append('page', options.page.toString());
      if (options.page_size) queryParams.append('page_size', options.page_size.toString());
      if (options.search) queryParams.append('search', options.search);
      if (options.status) queryParams.append('status', options.status);
      if (options.creator) queryParams.append('creator', options.creator.toString());

      const url = `${API_CONFIG.endpoints.courses.list}?${queryParams.toString()}`;
      console.debug('CourseService: Fetching courses with URL:', url);

      const response = await this.apiCourses.get(url);
      console.info('CourseService: fetchCourses succeeded', {
        count: response.count,
        resultsLength: response.results?.length || 0,
      });
      return response;
    },
    {
      serviceName: 'CourseService',
      methodName: 'fetchCourses',
    }
  );

  /**
   * Creates a new course
   * @param courseData
   */
  createCourse = withManagedExceptions(
    async (courseData: Partial<ICourse>): Promise<ICourse> => {
      console.info('CourseService: Creating course with data:', courseData);
      // Make sure we're using token from localStorage
      this.ensureAuthToken();

      const course = await this.apiCourse.post(API_CONFIG.endpoints.courses.create, courseData);
      console.info('CourseService: Course created successfully:', {
        id: course.id,
        title: course.title,
      });
      return course;
    },
    {
      serviceName: 'CourseService',
      methodName: 'createCourse',
    }
  );

  /**
   * Retrieves detailed information for a specific course
   * @param courseId
   */
  getCourseDetails = withManagedExceptions(
    async (courseId: string): Promise<ICourse> => {
      console.info(`CourseService: Getting details for course ${courseId}`);
      const response = await this.apiCourse.get(API_CONFIG.endpoints.courses.details(courseId));
      if (!response) {
        console.error(`CourseService: Course ${courseId} not found`);
        throw new Error(`Course with ID ${courseId} not found`);
      }
      console.info(`CourseService: Successfully retrieved course ${courseId}`, {
        title: response.title,
        status: response.status,
      });
      return response;
    },
    {
      serviceName: 'CourseService',
      methodName: 'getCourseDetails',
    }
  );

  /**
   * Updates an existing course
   * @param courseId
   * @param courseData
   */
  updateCourse = withManagedExceptions(
    async (courseId: string, courseData: Partial<ICourse>): Promise<ICourse> => {
      console.info(`CourseService: Updating course ${courseId}`, courseData);
      const response = await this.apiCourse.patch(
        API_CONFIG.endpoints.courses.update(courseId),
        courseData
      );
      console.info(`CourseService: Successfully updated course ${courseId}`);
      return response;
    },
    {
      serviceName: 'CourseService',
      methodName: 'updateCourse',
    }
  );

  /**
   * Deletes a course
   * @param courseId
   */
  deleteCourse = withManagedExceptions(
    async (courseId: string): Promise<void> => {
      console.info(`CourseService: Deleting course ${courseId}`);
      await this.apiVoid.delete(API_CONFIG.endpoints.courses.delete(courseId));
      console.info(`CourseService: Successfully deleted course ${courseId}`);
    },
    {
      serviceName: 'CourseService',
      methodName: 'deleteCourse',
    }
  );

  /**
   * Enrolls the current user in a course
   * @param courseId
   */

  /**
   * Fetches courses where the current user is an instructor
   * @param options Optional pagination and filtering options
   */
  fetchInstructorCourses = withManagedExceptions(
    async (options: CourseFilterOptions = {}): Promise<IPaginatedResponse<ICourse>> => {
      console.info('CourseService: Fetching instructor courses with options:', options);

      // Prepare query parameters
      const queryParams = new URLSearchParams();
      if (options.page) queryParams.append('page', options.page.toString());
      if (options.page_size) queryParams.append('page_size', options.page_size.toString());
      if (options.search) queryParams.append('search', options.search);
      if (options.status && options.status !== '') queryParams.append('status', options.status);

      // Construct URL with query parameters
      const url = queryParams.toString()
        ? `${API_CONFIG.endpoints.courses.instructorCourses}?${queryParams.toString()}`
        : API_CONFIG.endpoints.courses.instructorCourses;

      console.debug('CourseService: Instructor courses endpoint:', url);

      // Ensure token is set before making the request
      this.ensureAuthToken();

      // Get the current token for debugging
      const token = localStorage.getItem('accessToken');
      console.debug(
        'CourseService: Using access token:',
        token ? `${token.substring(0, 10)}...` : 'No token found'
      );

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
          results: response,
        };
      } else if (response && typeof response === 'object') {
        // If it's already in paginated format or some other format
        if (
          response &&
          typeof response === 'object' &&
          'results' in response &&
          Array.isArray((response as any).results)
        ) {
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
            results: (response as any).results || [],
          };
        }
      } else {
        // Fallback for unexpected response type
        console.error('CourseService: Unexpected response type', typeof response);
        formattedResponse = {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      }

      // Log detailed response information
      console.info('CourseService: Instructor courses fetch succeeded', {
        endpoint: url,
        courseCount: formattedResponse.results?.length || 0,
        totalCount: formattedResponse.count || 0,
        hasNextPage: !!formattedResponse.next,
        hasPrevPage: !!formattedResponse.previous,
      });

      // Log first course details for debugging (if available)
      if (formattedResponse.results?.length > 0) {
        const firstCourse = formattedResponse.results[0];
        console.debug('CourseService: First course details:', {
          id: firstCourse.id,
          title: firstCourse.title,
          status: firstCourse.status,
          createdAt: firstCourse.created_at,
        });
      } else {
        console.debug('CourseService: No instructor courses found in response');
      }

      return formattedResponse;
    },
    {
      serviceName: 'CourseService',
      methodName: 'fetchInstructorCourses',
    }
  );

  /**
   * Changes the status of a course
   * @param courseId
   * @param status
   */
  updateCourseStatus = withManagedExceptions(
    async (courseId: string, status: TCourseStatus): Promise<ICourse> => {
      console.info(`CourseService: Updating course ${courseId} status to ${status}`);
      const response = await this.apiCourse.patch(
        `${API_CONFIG.endpoints.courses.updateStatus}/${courseId}`,
        { status }
      );
      console.info(`CourseService: Successfully updated course ${courseId} status to ${status}`);
      return response;
    },
    {
      serviceName: 'CourseService',
      methodName: 'updateCourseStatus',
    }
  );

  /**
   * Archives a course
   * @param courseId
   */
  archiveCourse = withManagedExceptions(
    async (courseId: string): Promise<ICourse> => {
      console.info(`CourseService: Archiving course ${courseId}`);
      return this.updateCourseStatus(courseId, 'archived');
    },
    {
      serviceName: 'CourseService',
      methodName: 'archiveCourse',
    }
  );

  /**
   * Publishes a course
   * @param courseId
   */
  publishCourse = withManagedExceptions(
    async (courseId: string): Promise<ICourse> => {
      console.info(`CourseService: Publishing course ${courseId}`);
      return this.updateCourseStatus(courseId, 'published');
    },
    {
      serviceName: 'CourseService',
      methodName: 'publishCourse',
    }
  );

  /**
   * Fetches course progress for the current user
   * @param courseId - ID of the course to fetch progress for
   * @returns Promise containing an array of task progress records
   */
  fetchCourseProgress = withManagedExceptions(
    async (courseId: string): Promise<ITaskProgress[]> => {
      console.info(`CourseService: Fetching progress for course ${courseId}`);
      const response = await this.apiTaskProgressArray.get(
        `${API_CONFIG.endpoints.courses.progress}/${courseId}`
      );
      console.info(`CourseService: Retrieved progress for course ${courseId}`, {
        itemCount: response.length,
      });
      return response;
    },
    {
      serviceName: 'CourseService',
      methodName: 'fetchCourseProgress',
    }
  );

  /**
   * Fetches learning tasks associated with a specific course
   * @param courseId - ID of the course to fetch tasks for
   * @returns Promise containing a paginated response of learning tasks
   */
  getCourseTasks = withManagedExceptions(
    async (courseId: string): Promise<IPaginatedResponse<ILearningTask>> => {
      console.info(`CourseService: Fetching tasks for course ${courseId}`);
      const response = await this.apiLearningTasks.get(
        API_CONFIG.endpoints.tasks.byCourse(courseId)
      );

      // Ensure response is in the correct format
      const formattedResponse: IPaginatedResponse<ILearningTask> = {
        count: Array.isArray(response) ? response.length : (response.count ?? 0),
        next: response.next || null,
        previous: response.previous || null,
        results: Array.isArray(response) ? response : response.results || [],
      };

      console.info(`CourseService: Retrieved tasks for course ${courseId}`, {
        count: formattedResponse.count,
        taskCount: formattedResponse.results?.length || 0,
      });

      return formattedResponse;
    },
    {
      serviceName: 'CourseService',
      methodName: 'getCourseTasks',
    }
  );

  /**
   * Transforms a simple user progress object into a student progress summary
   * @param progress - The user progress object to transform
   * @returns A student progress summary object
   */
  transformUserProgressToStudentSummary = (progress: IUserProgress): IStudentProgressSummary => {
    console.info('CourseService: Transforming user progress to student summary');

    // Create a default student progress summary with data from the user progress
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
  };

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
