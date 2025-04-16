import {API_CONFIG} from 'src/services/api/apiConfig';
import {ApiService} from 'src/services/api/apiService';
import {CourseEnrollment as Enrollment} from 'src/types/common/entities';

/**
 * Service for managing course enrollments, including CRUD operations, user enrollments, and course-specific queries.
 * All methods are asynchronous, strictly typed, and use centralized API_CONFIG endpoints.
 */
class EnrollmentService {
  private apiEnrollments = new ApiService<Enrollment[]>();
  private apiEnrollment = new ApiService<Enrollment>();
  private apiVoid = new ApiService<void>();

  /**
   * Fetch all enrollments.
   * @returns Promise resolving to an array of Enrollment objects.
   */
  async getAll(): Promise<Enrollment[]> {
    return this.apiEnrollments.get(API_CONFIG.enrollments.list);
  }

  /**
   * Fetch enrollment by ID.
   * @param id Enrollment ID.
   * @returns Promise resolving to the Enrollment object.
   */
  async getById(id: string | number): Promise<Enrollment> {
    return this.apiEnrollment.get(API_CONFIG.enrollments.details(id));
  }

  /**
   * Create a new enrollment.
   * @param data Enrollment creation data.
   * @returns Promise resolving to the created Enrollment object.
   */
  async create(data: Partial<Enrollment>): Promise<Enrollment> {
    return this.apiEnrollment.post(API_CONFIG.enrollments.create, data);
  }

  /**
   * Update an existing enrollment.
   * @param id Enrollment ID.
   * @param data Partial enrollment data to update.
   * @returns Promise resolving to the updated Enrollment object.
   */
  async update(id: string | number, data: Partial<Enrollment>): Promise<Enrollment> {
    return this.apiEnrollment.put(API_CONFIG.enrollments.update(id), data);
  }

  /**
   * Delete an enrollment by ID.
   * @param id Enrollment ID.
   * @returns Promise resolving when the enrollment is deleted.
   */
  async delete(id: string | number): Promise<void> {
    await this.apiVoid.delete(API_CONFIG.enrollments.delete(id));
  }

  /**
   * Fetch all enrollments for the current user.
   * @returns Promise resolving to an array of Enrollment objects.
   */
  async fetchUserEnrollments(): Promise<Enrollment[]> {
    return this.apiEnrollments.get(API_CONFIG.enrollments.userEnrollments);
  }

  /**
   * Enroll the current user in a course.
   * @param courseId Course ID.
   * @returns Promise resolving to the created Enrollment object.
   */
  async enrollInCourse(courseId: string | number): Promise<Enrollment> {
    return this.apiEnrollment.post(API_CONFIG.enrollments.enroll, {course: courseId});
  }

  /**
   * Unenroll the current user from a course.
   * @param enrollmentId Enrollment ID.
   * @returns Promise resolving when the user is unenrolled.
   */
  async unenrollFromCourse(enrollmentId: string | number): Promise<void> {
    await this.apiVoid.delete(API_CONFIG.enrollments.unenroll(enrollmentId));
  }

  /**
   * Fetch all enrollments for a specific course.
   * @param courseId Course ID.
   * @returns Promise resolving to an array of Enrollment objects.
   */
  async fetchEnrolledStudents(courseId: string | number): Promise<Enrollment[]> {
    return this.apiEnrollments.get(API_CONFIG.enrollments.byCourse(courseId));
  }

  /**
   * Find enrollments by filter.
   * @param filter Key-value filter object.
   * @returns Promise resolving to an array of Enrollment objects.
   */
  async findByFilter(filter: Record<string, unknown>): Promise<Enrollment[]> {
    // For filter, we append as query params
    const params = new URLSearchParams(
      Object.entries(filter).reduce<Record<string, string>>((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {})
    ).toString();
    const url = params
      ? `${API_CONFIG.enrollments.list}?${params}`
      : API_CONFIG.enrollments.list;
    return this.apiEnrollments.get(url);
  }
  /**
   * Set Authorization header for all ApiService instances (for integration tests).
   * @param token JWT access token
   */
  setAuthHeader(token: string) {
    const authHeader = {Authorization: `Bearer ${token}`};
    this.apiEnrollments.setHeaders(authHeader);
    this.apiEnrollment.setHeaders(authHeader);
    this.apiVoid.setHeaders(authHeader);
  }
}

// Singleton export
export const enrollmentService = new EnrollmentService();

// Backward compatibility exports (deprecated)
export const fetchUserEnrollments = async () => enrollmentService.fetchUserEnrollments();
export const enrollInCourse = async (courseId: string | number) => enrollmentService.enrollInCourse(courseId);
export const unenrollFromCourse = async (enrollmentId: string | number) => enrollmentService.unenrollFromCourse(enrollmentId);
export const fetchEnrolledStudents = async (courseId: string | number) => enrollmentService.fetchEnrolledStudents(courseId);
export const findByFilter = async (filter: Record<string, unknown>) => enrollmentService.findByFilter(filter);

/**
 * @deprecated Use the EnrollmentService class and singleton export instead.
 */
export default enrollmentService;
