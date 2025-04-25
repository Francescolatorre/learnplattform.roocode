import {
  IProgressAnalytics,
  IStudentProgressSummary,
  IInstructorDashboardData,
  ICourseStructureAnalytics,
  IGradingData,
  ITaskProgressUpdateData,
  ITaskSubmissionData
} from '@/types';
import {
  IUserProgress,
  ICourse,
  IQuizAttempt,
  IPaginatedResponse,
  IDashboardResponse,
  ITaskProgress
} from '@/types';


import {API_CONFIG} from '../api/apiConfig';
import {ApiService} from '../api/apiService';

/**
 * Service for managing progress-related operations, including student progress, quiz history,
 * content effectiveness, task progress, submissions, grading, analytics, and dashboard data.
 * All methods are asynchronous, strictly typed, and use centralized API_CONFIG endpoints.
 */
class ProgressService {
  private apiUserProgress = new ApiService<IUserProgress>();
  private apiUserProgressArr = new ApiService<IUserProgress[]>();
  private apiQuizAttemptArr = new ApiService<IQuizAttempt[]>();
  private apiAny = new ApiService<unknown>();
  private apiCourse = new ApiService<ICourse>();
  // private apiTaskProgress = new ApiService<ITaskProgress>();

  /**
   * Fetches the progress of a student across all courses.
   * @param studentId The ID of the student.
   * @returns A promise that resolves to an array of UserProgress objects.
   */
  async fetchStudentProgressByUser(studentId: string): Promise<IUserProgress[]> {
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
  ): Promise<IUserProgress | null> {
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
  ): Promise<IPaginatedResponse<IUserProgress>> {
    console.log('Fetching all students progress for course:', courseId);
    const endpoint = API_CONFIG.endpoints.courses.studentProgress(courseId);
    return this.apiAny.get(endpoint) as Promise<IPaginatedResponse<IUserProgress>>;
  }

  /**
   * Fetches quiz attempts for a course or a specific student.
   * @param courseId The ID of the course.
   * @param studentId The ID of the student (optional).
   * @returns A promise that resolves to an array of QuizAttempt objects.
   */
  async getIQuizHistory(
    courseId: string,
    studentId?: string
  ): Promise<IQuizAttempt[]> {
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
   * @returns A promise that resolves to the updated task progress.
   */
  async updateTaskProgress(
    courseId: string,
    taskId: string,
    progressData: ITaskProgressUpdateData
  ): Promise<ITaskProgress> {
    const endpoint = API_CONFIG.endpoints.tasks.details(taskId);
    return this.apiAny.put(endpoint, progressData) as Promise<ITaskProgress>;
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
    submissionData: ITaskSubmissionData
  ): Promise<ITaskProgress> {
    const endpoint = API_CONFIG.endpoints.tasks.details(taskId);
    return this.apiAny.post(endpoint, submissionData) as Promise<ITaskProgress>;
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
    gradingData: IGradingData
  ): Promise<ITaskProgress> {
    const endpoint = `${API_CONFIG.endpoints.tasks.details(taskId)}grade/`;
    return this.apiAny.post(endpoint, gradingData) as Promise<ITaskProgress>;
  }

  /**
   * Fetches course details.
   * @param courseId The ID of the course.
   * @returns A promise that resolves to a Course object.
   * @throws Error if the course is not found.
   */
  async fetchCourseDetails(courseId: string): Promise<ICourse> {
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
  async fetchProgressAnalytics(courseId: string): Promise<IProgressAnalytics> {
    const endpoint = API_CONFIG.endpoints.courses.analytics(courseId);
    return this.apiAny.get(endpoint) as Promise<IProgressAnalytics>;
  }

  /**
   * Fetches a summary of a student's progress.
   * @param studentId - The ID of the student.
   * @returns A promise that resolves to the student's progress summary.
   */
  async fetchStudentProgressSummary(studentId: string): Promise<IStudentProgressSummary> {
    const endpoint = API_CONFIG.endpoints.student.progress(studentId);
    return this.apiAny.get(endpoint) as Promise<IStudentProgressSummary>;
  }

  /**
   * Fetches data for the instructor's dashboard.
   * @returns A promise that resolves to the instructor's dashboard data.
   */
  async fetchInstructorDashboardData(): Promise<IInstructorDashboardData> {
    try {
      const response = await this.apiAny.get(API_CONFIG.endpoints.dashboard.instructor);
      return response as IInstructorDashboardData;
    } catch (error) {
      console.error('Error fetching instructor dashboard data:', error);
      throw new Error('Instructor dashboard data not found');
    }
  }


  /**
   * Fetches analytics data related to the structure of a course.
   * @param courseId - The ID of the course.
   * @returns A promise that resolves to the course structure analytics data.
   */
  async fetchCourseStructure(courseId: string): Promise<ICourseStructureAnalytics> {
    const endpoint = API_CONFIG.endpoints.courses.analytics(courseId);
    return this.apiAny.get(endpoint) as Promise<ICourseStructureAnalytics>;
  }

  /**
   * Fetches dashboard data for a student.
   * @param studentId - The ID of the student.
   * @returns A promise that resolves to the student's dashboard data.
   */
  async getStudentDashboard(studentId?: number | string | null): Promise<IDashboardResponse> {
    if (!studentId) {
      throw new Error('Student ID is required');
    }

    // Update to use a valid endpoint from API_CONFIG
    const endpoint = API_CONFIG.endpoints.dashboard.student
      ? API_CONFIG.endpoints.dashboard.student(studentId.toString())
      : API_CONFIG.endpoints.dashboard.instructor + `?student_id=${studentId.toString()}`;

    return this.apiAny.get(endpoint) as Promise<IDashboardResponse>;
  }
}

// Singleton export
const progressService = new ProgressService();

// Backward compatibility exports (deprecated)
export const fetchStudentProgressByUser = async (studentId: string): Promise<IUserProgress[]> =>
  progressService.fetchStudentProgressByUser(studentId);

export const fetchStudentProgressByCourse = async (courseId: string, studentId: string): Promise<IUserProgress | null> =>
  progressService.fetchStudentProgressByCourse(courseId, studentId);

export const fetchAllStudentsProgress = async (courseId: string): Promise<IPaginatedResponse<IUserProgress>> =>
  progressService.fetchAllStudentsProgress(courseId);

export const getIQuizHistory = async (courseId: string, studentId?: string): Promise<IQuizAttempt[]> =>
  progressService.getIQuizHistory(courseId, studentId);

export const updateTaskProgress = async (courseId: string, taskId: string, progressData: ITaskProgressUpdateData): Promise<ITaskProgress> =>
  progressService.updateTaskProgress(courseId, taskId, progressData);

export const submitTask = async (courseId: string, taskId: string, submissionData: ITaskSubmissionData): Promise<ITaskProgress> =>
  progressService.submitTask(courseId, taskId, submissionData);

export const gradeSubmission = async (courseId: string, taskId: string, studentId: string, gradingData: IGradingData): Promise<ITaskProgress> =>
  progressService.gradeSubmission(courseId, taskId, studentId, gradingData);

export const fetchCourseDetails = async (courseId: string): Promise<ICourse> =>
  progressService.fetchCourseDetails(courseId);

export const fetchProgressAnalytics = async (courseId: string): Promise<IProgressAnalytics> =>
  progressService.fetchProgressAnalytics(courseId);

export const fetchStudentProgressSummary = async (studentId: string): Promise<IStudentProgressSummary> =>
  progressService.fetchStudentProgressSummary(studentId);

export const fetchInstructorDashboardData = async (): Promise<IInstructorDashboardData> =>
  progressService.fetchInstructorDashboardData();

export const fetchCourseStructure = async (courseId: string): Promise<ICourseStructureAnalytics> =>
  progressService.fetchCourseStructure(courseId);

export const getStudentDashboard = async (studentId?: number | string | null): Promise<IDashboardResponse> => {
  if (!studentId) {
    throw new Error('Student ID is required');
  }

  // Use the existing progressService instance to call the method
  return progressService.getStudentDashboard(studentId);
};


export default progressService;
