/**
 * Education Service Contracts for Behavior-Driven Testing
 *
 * Defines behavior-focused interfaces for educational platform services
 * to enable consistent testing patterns and service abstraction.
 *
 * These contracts focus on educational outcomes and user behaviors
 * rather than implementation details, supporting reliable testing
 * that survives service refactoring.
 *
 * @since 2025-09-20 (TASK-059 Test Suite Modernization)
 */

import { ICourse, TCourseStatus } from '@/types/course';
import { ILearningTask, ITaskCreationData } from '@/types/Task';
import { ICourseEnrollment, IEnrollmentStatus } from '@/types/entities';
import { IPaginatedResponse } from '@/types/paginatedResponse';

/**
 * Educational behavior outcomes for testing
 */
export interface EducationalOutcome {
  success: boolean;
  message: string;
  data?: unknown;
  errorCode?: string;
}

/**
 * Course enrollment behavior result
 */
export interface EnrollmentBehaviorResult extends EducationalOutcome {
  data?: {
    enrollmentId?: number;
    courseId: string | number;
    studentId: string | number;
    enrollmentDate: string;
    status: string;
  };
}

/**
 * Task submission behavior result
 */
export interface TaskSubmissionBehaviorResult extends EducationalOutcome {
  data?: {
    taskId: string;
    submissionId?: string;
    submittedAt: string;
    status: string;
  };
}

/**
 * Course access behavior result
 */
export interface CourseAccessBehaviorResult extends EducationalOutcome {
  data?: {
    courseId: string | number;
    hasAccess: boolean;
    accessLevel: 'view' | 'edit' | 'admin' | 'none';
    enrollmentStatus?: 'enrolled' | 'pending' | 'dropped' | 'not_enrolled';
  };
}

/**
 * Course Management Service Contract
 *
 * Focuses on educational course management behaviors
 * rather than implementation details.
 */
export interface ICourseManagementService {
  // Course Discovery & Access Behaviors
  discoverCourses(filters?: Record<string, unknown>): Promise<IPaginatedResponse<ICourse>>;
  accessCourse(courseId: string | number): Promise<CourseAccessBehaviorResult>;
  getCourseContent(courseId: string | number): Promise<ICourse>;

  // Course Creation & Management Behaviors
  createCourse(courseData: Partial<ICourse>): Promise<EducationalOutcome>;
  modifyCourse(courseId: string | number, updates: Partial<ICourse>): Promise<EducationalOutcome>;
  publishCourse(courseId: string | number): Promise<EducationalOutcome>;
  archiveCourse(courseId: string | number): Promise<EducationalOutcome>;
  deleteCourse(courseId: string | number): Promise<EducationalOutcome>;

  // Instructor Course Management
  getInstructorCourses(instructorId?: string | number): Promise<IPaginatedResponse<ICourse>>;
  getStudentCourses(studentId?: string | number): Promise<IPaginatedResponse<ICourse>>;

  // Course Progress & Analytics
  getCourseProgress(courseId: string | number): Promise<EducationalOutcome>;
  getStudentProgress(courseId: string | number): Promise<EducationalOutcome>;
}

/**
 * Learning Task Management Service Contract
 *
 * Focuses on educational task and assignment behaviors.
 */
export interface ILearningTaskService {
  // Task Discovery & Access
  getTasksForCourse(courseId: string): Promise<ILearningTask[]>;
  getTasksForStudent(studentId: string): Promise<ILearningTask[]>;
  getTaskDetails(taskId: string): Promise<ILearningTask>;

  // Task Creation & Management
  createTask(taskData: ITaskCreationData, notifyStudents?: boolean): Promise<TaskSubmissionBehaviorResult>;
  updateTask(taskId: string, updates: Partial<ILearningTask>): Promise<EducationalOutcome>;
  deleteTask(taskId: string): Promise<EducationalOutcome>;

  // Task Submission & Progress
  submitTask(taskId: string, submissionData: unknown): Promise<TaskSubmissionBehaviorResult>;
  getTaskProgress(taskId: string): Promise<EducationalOutcome>;
  getTaskSubmissions(taskId: string): Promise<EducationalOutcome>;
}

/**
 * Student Enrollment Service Contract
 *
 * Focuses on enrollment and course access behaviors.
 */
export interface IEnrollmentService {
  // Enrollment Behaviors
  enrollInCourse(courseId: string | number, studentId?: string | number): Promise<EnrollmentBehaviorResult>;
  unenrollFromCourse(courseId: string | number, studentId?: string | number): Promise<EnrollmentBehaviorResult>;

  // Enrollment Status & Discovery
  getEnrollmentStatus(courseId: string | number, studentId?: string | number): Promise<IEnrollmentStatus>;
  getStudentEnrollments(studentId?: string | number): Promise<ICourseEnrollment[]>;
  getEnrolledStudents(courseId: string | number): Promise<ICourseEnrollment[]>;

  // Enrollment Management
  updateEnrollmentStatus(enrollmentId: string | number, status: string): Promise<EducationalOutcome>;
  getEnrollmentHistory(studentId: string | number): Promise<EducationalOutcome>;
}

/**
 * Combined Education Service Interface
 *
 * Aggregates all educational service behaviors for comprehensive testing.
 */
export interface IEducationService extends ICourseManagementService, ILearningTaskService, IEnrollmentService {
  // Service Health & Status
  isServiceHealthy(): Promise<boolean>;
  getServiceStatus(): Promise<{ status: string; version: string; capabilities: string[] }>;
}

/**
 * Service Contract Validator Interface
 *
 * Validates that service implementations comply with behavioral contracts.
 */
export interface IServiceContractValidator {
  validateCourseManagementContract(service: ICourseManagementService): Promise<boolean>;
  validateLearningTaskContract(service: ILearningTaskService): Promise<boolean>;
  validateEnrollmentContract(service: IEnrollmentService): Promise<boolean>;
  validateEducationServiceContract(service: IEducationService): Promise<boolean>;

  getValidationReport(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    contractsCovered: string[];
  };
}

/**
 * Behavior Test Specification Interface
 *
 * Defines expected behaviors for educational workflows.
 */
export interface IBehaviorTestSpec {
  name: string;
  description: string;
  workflow: string; // e.g., "course_enrollment", "task_submission", "course_creation"
  steps: {
    action: string;
    expectedOutcome: EducationalOutcome;
    preconditions?: string[];
    postconditions?: string[];
  }[];
  educationalContext: {
    userRole: 'student' | 'instructor' | 'admin';
    courseType?: string;
    learningObjectives?: string[];
  };
}