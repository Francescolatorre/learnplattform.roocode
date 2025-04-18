import {
  UserProgress,
  TaskProgress,
  Course,
  QuizAttempt,
  QuizTask,
  QuizResponse,
  QuizOption,
} from 'src/types/common/entities';

import {API_CONFIG} from '../api/apiConfig';
import {ApiService} from '../api/apiService';

/**
 * Service for managing progress-related operations, including student progress, quiz history,
 * content effectiveness, task progress, submissions, grading, analytics, and dashboard data.
 * All methods are asynchronous, strictly typed, and use centralized API_CONFIG endpoints.
 */
class ProgressService {
  private apiUserProgress = new ApiService<UserProgress>();
  private apiUserProgressArr = new ApiService<UserProgress[]>();
  private apiTaskProgress = new ApiService<TaskProgress>();
  private apiTaskProgressArr = new ApiService<TaskProgress[]>();
  private apiQuizAttemptArr = new ApiService<QuizAttempt[]>();
  private apiAny = new ApiService<any>();
  private apiCourse = new ApiService<Course>();

  /**
   * Fetches the progress of a student across all courses.
   * @param studentId The ID of the student.
   * @returns A promise that resolves to an array of UserProgress objects.
   */

  async fetchStudentProgressByUser(studentId: string): Promise<UserProgress[]> {
    console.log('Fetching student progress by user:', studentId);
    const endpoint = API_CONFIG.endpoints.student.progress(studentId);
    return this.apiUserProgressArr.get(endpoint);
  }

  /**
   * Fetches the progress of a student in a specific course.
   * @param courseId The ID of the course.
   * @param studentId The ID of the student.
   * @param includeDetails Whether to include detailed progress information.
   * @returns A promise that resolves to a UserProgress object or null if not found.
   */
  async fetchStudentProgressByCourse(
    courseId: string,
    studentId: string,
    includeDetails = false
  ): Promise<UserProgress | null> {
    console.log('Fetching student progress by course:', courseId, studentId);
    const endpoint = API_CONFIG.endpoints.courses.studentProgressDetail(courseId, studentId);
    return this.apiUserProgress.get(endpoint);
  }

  /**
   * Fetches the progress of all students in a specific course.
   * @param courseId The ID of the course.
   * @returns A promise that resolves to an object containing the count, next page, previous page, and results.
   */
  async fetchAllStudentsProgress(
    courseId: string
  ): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: UserProgress[];
  }> {
    console.log('Fetching all students progress for course:', courseId);
    const endpoint = API_CONFIG.endpoints.courses.studentProgress(courseId);
    return this.apiAny.get(endpoint);
  }

  /**
   * Fetches quiz attempts for a course or a specific student.
   * @param courseId The ID of the course.
   * @param studentId The ID of the student (optional).
   * @returns A promise that resolves to an array of QuizAttempt objects.
   */
  async getQuizHistory(
    courseId: string,
    studentId?: string
  ): Promise<QuizAttempt[]> {
    console.log('Getting quiz history for course:', courseId, 'and student:', studentId);
    const endpoint = API_CONFIG.endpoints.quizzes.attemptsList;
    // If studentId is provided, filter by studentId (assuming API supports query param)
    const url = studentId ? `${endpoint}?student=${studentId}` : endpoint;
    return this.apiQuizAttemptArr.get(url);
  }

  /**
   * Updates task progress for a student in a course.
   * @param courseId The ID of the course.
   * @param taskId The ID of the task.
   * @param progressData The progress data to update.
   * @returns A promise that resolves to any.
   */
  async updateTaskProgress(
    courseId: string,
    taskId: string,
    progressData: any
  ): Promise<any> {
    const endpoint = API_CONFIG.endpoints.tasks.details(taskId);
    return this.apiAny.put(endpoint, progressData);
  }

  /**
   * Submits a task for a student in a course.
   * @param courseId The ID of the course.
   * @param taskId The ID of the task.
   * @param submissionData The submission data to be submitted.
   * @returns A promise that resolves to the server response.
   */
  async submitTask(
    courseId: string,
    taskId: string,
    submissionData: any
  ): Promise<any> {
    const endpoint = API_CONFIG.endpoints.tasks.details(taskId);
    return this.apiAny.post(endpoint, submissionData);
  }

  /**
   * Grades a submission for a student in a course.
   * @param courseId The ID of the course.
   * @param taskId The ID of the task.
   * @param studentId The ID of the student.
   * @param gradingData The grading data to apply.
   * @returns A promise that resolves to the server response.
   */
  async gradeSubmission(
    courseId: string,
    taskId: string,
    studentId: string,
    gradingData: any
  ): Promise<any> {
    const endpoint = `${API_CONFIG.endpoints.tasks.details(taskId)}grade/`;
    return this.apiAny.post(endpoint, gradingData);
  }

  /**
   * Fetches course details.
   * @param courseId The ID of the course.
   * @returns A promise that resolves to a Course object.
   * @throws Error if the course is not found.
   */
  async fetchCourseDetails(courseId: string): Promise<Course> {
    const response = await this.apiCourse.get(API_CONFIG.endpoints.courses.details(courseId));
    if (!response) {
      throw new Error('Course not found');
    }
    return response;
  }

  /**
   * Fetches progress analytics for a course.
   * @param courseId The ID of the course.
   * @returns A promise that resolves to analytics data.
   */
  async fetchProgressAnalytics(courseId: string): Promise<any> {
    const endpoint = API_CONFIG.endpoints.courses.analytics(courseId);
    return this.apiAny.get(endpoint);
  }

  /**
   * Fetches a summary of a student's progress.
   * @param studentId - The ID of the student.
   * @returns A promise that resolves to the student's progress summary.
   */
  async fetchStudentProgressSummary(studentId: string): Promise<any> {
    const endpoint = API_CONFIG.endpoints.student.progress(studentId);
    return this.apiAny.get(endpoint);
  }

  /**
   * Fetches data for the instructor's dashboard.
   * @returns A promise that resolves to the instructor's dashboard data.
   */
  async fetchInstructorDashboardData(): Promise<any> {
    const endpoint = API_CONFIG.endpoints.dashboard.instructor;
    return this.apiAny.get(endpoint);
  }

  /**
   * Fetches analytics data related to the structure of a course.
   * @param courseId - The ID of the course.
   * @returns A promise that resolves to the course structure analytics data.
   */
  async fetchCourseStructure(courseId: string): Promise<any> {
    const endpoint = API_CONFIG.endpoints.courses.analytics(courseId);
    return this.apiAny.get(endpoint);
  }

}

// Singleton export
export const progressService = new ProgressService();

// Backward compatibility exports (deprecated)
export const fetchStudentProgressByUser = async (studentId: string) => progressService.fetchStudentProgressByUser(studentId);
export const fetchStudentProgressByCourse = async (courseId: string, studentId: string, includeDetails = false) => progressService.fetchStudentProgressByCourse(courseId, studentId, includeDetails);
export const fetchAllStudentsProgress = async (courseId: string) => progressService.fetchAllStudentsProgress(courseId);
export const getQuizHistory = async (courseId: string, studentId?: string) => progressService.getQuizHistory(courseId, studentId);
export const updateTaskProgress = async (courseId: string, taskId: string, progressData: any) => progressService.updateTaskProgress(courseId, taskId, progressData);
export const submitTask = async (courseId: string, taskId: string, submissionData: any) => progressService.submitTask(courseId, taskId, submissionData);
export const gradeSubmission = async (courseId: string, taskId: string, studentId: string, gradingData: any) => progressService.gradeSubmission(courseId, taskId, studentId, gradingData);
export const fetchCourseDetails = async (courseId: string) => progressService.fetchCourseDetails(courseId);
export const fetchProgressAnalytics = async (courseId: string) => progressService.fetchProgressAnalytics(courseId);
export const fetchStudentProgressSummary = async (studentId: string) => progressService.fetchStudentProgressSummary(studentId);
export const fetchInstructorDashboardData = async () => progressService.fetchInstructorDashboardData();
export const fetchCourseStructure = async (courseId: string) => progressService.fetchCourseStructure(courseId);

export default progressService;
