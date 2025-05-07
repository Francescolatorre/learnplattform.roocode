/*
  * EnrollmentService.ts
  * Service for managing course enrollments, including CRU operations, user enrollments, and course-specific queries.
  * All methods are asynchronous, strictly typed, and use centralized API_CONFIG endpoints.
  *
  * @module EnrollmentService
  * @description Provides a comprehensive interface for working with course enrollments in the Learning Platform.
  *
  * Relevant Design decisions:
  * - no Delete method is provided, as enrollments should not be deleted but rather marked as inactive or unenrolled.
  */

import {ICourseEnrollment} from '@/types/entities';
import {API_CONFIG} from 'src/services/api/apiConfig';
import {ApiService} from 'src/services/api/apiService';
import {IPaginatedResponse} from 'src/types/paginatedResponse';
import {authEventService} from '@context/auth/AuthEventService';
import {AuthEventType} from '@context/auth/types';

/**
 * Interface for enrollment response data
 */
export interface IEnrollmentResponse {
  success: boolean;
  message: string;
  courseId: string;
  status: string;
  enrollmentId?: number;
}

/**
 * Interface for API responses that may return paginated results
 */
interface IPossiblyPaginatedResponse<T> {
  results?: T[];
  [key: string]: any;
}

/**
 * Service for managing course enrollments, including CRUD operations, user enrollments, and course-specific queries.
 * All methods are asynchronous, strictly typed, and use centralized API_CONFIG endpoints.
 *
 * @class EnrollmentService
 * @description Provides a comprehensive interface for working with course enrollments in the Learning Platform.
 */
class EnrollmentService {
  /** @private API service instance for handling enrollment collections */
  private apiEnrollments = new ApiService<ICourseEnrollment[]>();

  /** @private API service instance for handling single enrollment operations */
  private apiEnrollment = new ApiService<ICourseEnrollment>();

  /** @private API service instance for operations without response data */
  private apiVoid = new ApiService<void>();

  /** @private API service instance for paginated enrollment results */
  private apiEnrollmentsPaginatedResults = new ApiService<IPaginatedResponse<ICourseEnrollment>>();

  /** @private API service instance for handling various response types */
  private apiAny = new ApiService<unknown>();

  /** @private Cache for user profiles */
  private userProfileCache: Record<string, any> = {};

  private authToken: string | null = null;

  /**
   * Fetch all enrollments.
   * @returns {Promise<ICourseEnrollment[]>} Promise resolving to an array of Enrollment objects.
   * @throws {Error} If the API request fails.
   */
  async getAll(): Promise<ICourseEnrollment[]> {
    return this.apiEnrollments.get(API_CONFIG.endpoints.enrollments.list);
  }

  /**
   * Fetch enrollment by ID.
   * @param {string | number} id - Enrollment ID.
   * @returns {Promise<ICourseEnrollment>} Promise resolving to the Enrollment object.
   * @throws {Error} If the enrollment is not found or the API request fails.
   */
  async getById(id: string | number): Promise<ICourseEnrollment> {
    return this.apiEnrollment.get(API_CONFIG.endpoints.enrollments.details(id));
  }

  /**
   * Create a new enrollment.
   * @param {Partial<ICourseEnrollment>} data - Enrollment creation data.
   * @returns {Promise<ICourseEnrollment>} Promise resolving to the created Enrollment object.
   * @throws {Error} If enrollment creation fails.
   */
  async create(data: Partial<ICourseEnrollment>): Promise<ICourseEnrollment> {
    return this.apiEnrollment.post(API_CONFIG.endpoints.enrollments.create, data);
  }

  /**
   * Update an existing enrollment.
   * @param {string | number} id - Enrollment ID.
   * @param {Partial<ICourseEnrollment>} data - Partial enrollment data to update.
   * @returns {Promise<ICourseEnrollment>} Promise resolving to the updated Enrollment object.
   * @throws {Error} If enrollment update fails or the enrollment is not found.
   */
  async update(id: string | number, data: Partial<ICourseEnrollment>): Promise<ICourseEnrollment> {
    try {
      // First get the current enrollment to ensure we have all required fields
      const currentEnrollment = await this.getById(id);

      // Merge the existing enrollment data with the update data
      // This ensures required fields like user and course are included
      const completeData = {
        ...currentEnrollment,
        ...data
      };

      console.info(`EnrollmentService: Updating enrollment ${id} with data:`, data);
      return this.apiEnrollment.put(API_CONFIG.endpoints.enrollments.update(id), completeData);
    } catch (error) {
      console.error(`EnrollmentService: Failed to update enrollment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fetch all enrollments for the current user.
   * @returns {Promise<ICourseEnrollment[]>} Promise resolving to an array of Enrollment objects for the current user.
   * @throws {Error} If the API request fails or the user is not authenticated.
   */
  async fetchUserEnrollments(): Promise<ICourseEnrollment[]> {
    return this.apiEnrollments.get(API_CONFIG.endpoints.enrollments.list);
  }

  /**
   * Enroll the current user in a course.
   * @param {string | number} courseId - Course ID to enroll in.
   * @returns {Promise<ICourseEnrollment>} Promise resolving to the created Enrollment object.
   * @throws {Error} If enrollment fails, the course is not found, or the user is already enrolled.
   */
  async enrollInCourse(courseId: string | number): Promise<ICourseEnrollment> {
    try {
      // Get the current user's ID - Since we can't directly access AuthContext here,
      // we use the token from localStorage which contains the user ID
      const accessToken = this.authToken || localStorage.getItem('accessToken');

      if (!accessToken) {
        throw new Error('User not authenticated. Please log in to enroll in courses.');
      }

      // Since we don't have access to the auth context directly in a service,
      // we need to get the current user ID from the backend
      let profile;
      const cacheKey = accessToken.substring(0, 10); // Use part of token as cache key

      if (this.userProfileCache[cacheKey]) {
        profile = this.userProfileCache[cacheKey];
      } else {
        const authService = await import('@services/auth/authService');
        profile = await authService.default.getUserProfile(accessToken);
        this.userProfileCache[cacheKey] = profile;
      }

      if (!profile || !profile.id) {
        throw new Error('User profile not available. Please log in again.');
      }

      // Set up enrollment data with user ID from the profile
      const enrollmentData = {
        user: profile.id,
        course: courseId,
        status: 'active' // Default status for new enrollments
      };

      console.info('Enrolling in course:', courseId, 'for user:', profile.id);
      console.debug('Enrollment payload:', enrollmentData);

      // Send the enrollment request
      const response = await this.apiEnrollment.post(
        API_CONFIG.endpoints.enrollments.create,
        enrollmentData
      );

      // Publish an event when enrollment succeeds
      authEventService.publish({
        type: AuthEventType.ENROLLMENT_SUCCESS,
        payload: {
          message: `Successfully enrolled in course ${courseId}`
        }
      });

      return response;
    } catch (error: any) {
      console.error('Enrollment failed:', error);

      // Enhanced error reporting
      if (error.response?.data) {
        console.error('Server responded with:', error.response.data);

        // Check for specific error conditions
        if (error.response.status === 400) {
          // If we have detailed validation errors, include them in the message
          const detailedMessage = error.response.data.detail ||
            Object.entries(error.response.data)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join(', ');

          throw new Error(`Failed to enroll in course: ${detailedMessage}`);
        } else if (error.response.status === 401) {
          throw new Error('You must be logged in to enroll in courses.');
        } else if (error.response.status === 409) {
          throw new Error('You are already enrolled in this course.');
        }
      }

      // Generic error if we don't have specific details
      throw new Error('Failed to enroll in course. Please try again later.');
    }
  }


  /**
   * Unenroll from a course by course ID
   * Updates enrollment status to "dropped" instead of deleting records
   *
   * @param courseId The course ID to unenroll from
   * @returns Response with status of the unenrollment operation
   */
  async unenrollFromCourseById(courseId: number | string): Promise<IEnrollmentResponse> {
    try {
      console.log(`Unenrolling from course ID: ${courseId}`);

      // Call the primary enrollments unenroll endpoint
      const response = await this.apiAny.post(
        API_CONFIG.endpoints.enrollments.unenroll(courseId),
        {}
      ) as Record<string, any>;

      console.log(`Successfully unenrolled from course ${courseId} using enrollments unenroll endpoint`);

      // Special handling for "not enrolled" case from backend
      if (response?.message?.includes('not enrolled')) {
        return {
          success: true,
          message: 'You are not enrolled in this course',
          courseId: String(courseId),
          status: 'not_enrolled'
        };
      }

      return {
        success: true,
        message: response?.message || 'Successfully unenrolled from course',
        courseId: String(courseId),
        status: response?.status || 'dropped',
        enrollmentId: response?.enrollmentId
      };
    } catch (error) {
      console.error(`Error during unenrollment from course ${courseId}:`, error);

      // For not enrolled cases in errors, return a formatted response
      if (error instanceof Error &&
        (error.message.includes('not enrolled') ||
          (error as any)?.response?.data?.detail?.includes('not enrolled') ||
          (error as any)?.response?.data?.message?.includes('not enrolled'))) {
        return {
          success: true,
          message: 'You are not enrolled in this course',
          courseId: String(courseId),
          status: 'not_enrolled'
        };
      }

      // Otherwise throw the error
      throw new Error(`Failed to complete unenrollment operation: ${(error as Error).message}`);
    }
  }

  /**
   * Updates an enrollment with new data.
   * Alias for the update() method with more descriptive name.
   *
   * @param {string | number} id - Enrollment ID to update.
   * @param {Partial<ICourseEnrollment>} data - Enrollment data to update.
   * @returns {Promise<ICourseEnrollment>} Promise resolving to the updated enrollment.
   */
  async updateEnrollment(id: string | number, data: Partial<ICourseEnrollment>): Promise<ICourseEnrollment> {
    return this.update(id, data);
  }

  /**
   * Fetch all enrollments for a specific course.
   * @param {string | number} courseId - Course ID.
   * @returns {Promise<ICourseEnrollment[]>} Promise resolving to an array of Enrollment objects for the specified course.
   * @throws {Error} If the API request fails or the course is not found.
   */
  async fetchEnrolledStudents(courseId: string | number): Promise<ICourseEnrollment[]> {
    return this.apiEnrollments.get(API_CONFIG.endpoints.enrollments.byCourse(courseId));
  }

  /**
   * Find enrollments by filter criteria
   *
   * @param filter An object with filter criteria
   * @returns Array of enrollments matching the filter
   */
  async findByFilter(filter: Record<string, unknown>): Promise<ICourseEnrollment[]> {
    try {
      const queryParams = Object.entries(filter)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      const endpoint = queryParams
        ? `${API_CONFIG.endpoints.enrollments.list}?${queryParams}`
        : API_CONFIG.endpoints.enrollments.list;

      const response = await this.apiAny.get(endpoint) as ICourseEnrollment[] | IPossiblyPaginatedResponse<ICourseEnrollment>;

      // Handle different API response formats - some return direct arrays, some have a results property
      if (Array.isArray(response)) {
        return response;
      } else if (response && 'results' in response && Array.isArray(response.results)) {
        return response.results;
      } else {
        console.warn('Unexpected response format from enrollment API:', response);
        return [];
      }
    } catch (error) {
      console.error('Error finding enrollments by filter:', error);
      throw error;
    }
  }

  /**
   * Set authentication token for all ApiService instances.
   * Primarily used for integration tests or when manually handling authentication.
   *
   * @param {string} token - JWT access token to use for authorization.
   * @returns {void}
   */
  setAuthToken(token: string): void {
    this.apiEnrollments.setAuthToken(token);
    this.apiEnrollment.setAuthToken(token);
    this.apiVoid.setAuthToken(token);
    this.apiEnrollmentsPaginatedResults.setAuthToken(token);
    this.apiAny.setAuthToken(token);
    this.authToken = token;
  }
}

/**
 * Singleton instance of the EnrollmentService.
 * Use this exported instance throughout the application to maintain consistent state.
 */
export const enrollmentService = new EnrollmentService();

/**
 * @deprecated Use enrollmentService.fetchUserEnrollments() instead.
 * @returns {Promise<ICourseEnrollment[]>} Promise resolving to user enrollments.
 */
export const fetchUserEnrollments = async () => enrollmentService.fetchUserEnrollments();

/**
 * @deprecated Use enrollmentService.enrollInCourse() instead.
 * @param {string | number} courseId - Course ID to enroll in.
 * @returns {Promise<ICourseEnrollment>} Promise resolving to the created enrollment.
 */
export const enrollInCourse = async (courseId: string | number) => enrollmentService.enrollInCourse(courseId);


/**
 * @deprecated Use enrollmentService.fetchEnrolledStudents() instead.
 * @param {string | number} courseId - Course ID.
 * @returns {Promise<ICourseEnrollment[]>} Promise resolving to enrolled students.
 */
export const fetchEnrolledStudents = async (courseId: string | number) => enrollmentService.fetchEnrolledStudents(courseId);

/**
 * @deprecated Use enrollmentService.findByFilter() instead.
 * @param {Record<string, unknown>} filter - Key-value filter object.
 * @returns {Promise<ICourseEnrollment[]>} Promise resolving to filtered enrollments.
 */
export const findByFilter = async (filter: Record<string, unknown>) => enrollmentService.findByFilter(filter);

/**
 * @deprecated Use the enrollmentService singleton export instead.
 */
export default enrollmentService;
