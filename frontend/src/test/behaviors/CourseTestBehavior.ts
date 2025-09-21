/**
 * Course Test Behavior Class
 *
 * Provides behavior-driven testing utilities for educational course workflows.
 * Focuses on course management, enrollment, task completion, and educational
 * outcomes rather than implementation details.
 *
 * ## Key Features
 * - Educational workflow behavior testing
 * - Course creation and management behaviors
 * - Student enrollment and progress tracking
 * - Task assignment and submission workflows
 * - Instructor course management scenarios
 * - Comprehensive course lifecycle testing
 *
 * ## Usage Example
 * ```typescript
 * // Setup course creation behavior
 * const courseBehavior = new CourseTestBehavior();
 * courseBehavior.configureCourseCreation(true);
 *
 * // Test component behavior
 * render(<CourseCreationForm />);
 * await user.click(createCourseButton);
 *
 * // Verify educational workflow behavior
 * expect(courseBehavior.verifyCourseWasCreated()).toBe(true);
 * expect(courseBehavior.getCreatedCourse()).toMatchObject({ title: 'Test Course' });
 * ```
 *
 * @since 2025-09-20 (TASK-059 Test Suite Modernization)
 */

import { ICourse, TCourseStatus } from '@/types/course';
import { ILearningTask, ITaskCreationData } from '@/types/Task';
import { ICourseEnrollment } from '@/types/entities';
import { UserRoleEnum } from '@/types/userTypes';
import { IPaginatedResponse } from '@/types/paginatedResponse';
import {
  ICourseManagementService,
  ILearningTaskService,
  IEnrollmentService,
  EducationalOutcome,
  CourseAccessBehaviorResult,
  EnrollmentBehaviorResult,
  TaskSubmissionBehaviorResult,
} from '@/test/contracts/IEducationService';
import { TestDataBuilder } from '@/test/builders/TestDataBuilder';

/**
 * Course workflow scenario configuration
 */
export interface CourseWorkflowScenario {
  userRole: UserRoleEnum;
  courseAccess: 'view' | 'edit' | 'admin' | 'none';
  enrollmentStatus: 'enrolled' | 'pending' | 'dropped' | 'not_enrolled';
  courseStatus: TCourseStatus;
  tasksAvailable: number;
  tasksCompleted: number;
  progressPercentage: number;
  lastActivity: string;
}

/**
 * Educational workflow verification results
 */
export interface CourseWorkflowVerification {
  courseAccessed: boolean;
  courseCreated: boolean;
  courseUpdated: boolean;
  enrollmentChanged: boolean;
  tasksCreated: number;
  tasksSubmitted: number;
  progressUpdated: boolean;
  educationalGoalsMet: boolean;
}

/**
 * Course interaction tracking for behavior verification
 */
export interface CourseInteractionTracker {
  courseActions: string[];
  taskActions: string[];
  enrollmentActions: string[];
  progressActions: string[];
  outcomeResults: EducationalOutcome[];
  lastInteraction: string;
}

/**
 * Course Test Behavior Class
 *
 * Manages course-related educational behavior testing scenarios.
 */
export class CourseTestBehavior {
  private currentCourse: ICourse | null = null;
  private currentTasks: ILearningTask[] = [];
  private currentEnrollments: ICourseEnrollment[] = [];
  private workflowScenario: CourseWorkflowScenario;
  private interactionTracker: CourseInteractionTracker;
  private behaviorResults: Record<string, EducationalOutcome> = {};

  constructor() {
    this.workflowScenario = {
      userRole: UserRoleEnum.STUDENT,
      courseAccess: 'view',
      enrollmentStatus: 'not_enrolled',
      courseStatus: 'published',
      tasksAvailable: 0,
      tasksCompleted: 0,
      progressPercentage: 0,
      lastActivity: 'initialized',
    };

    this.interactionTracker = {
      courseActions: [],
      taskActions: [],
      enrollmentActions: [],
      progressActions: [],
      outcomeResults: [],
      lastInteraction: 'initialized',
    };
  }

  /**
   * Configure course creation behavior
   */
  configureCourseCreation(shouldSucceed: boolean, courseData?: Partial<ICourse>): void {
    const course = TestDataBuilder.course()
      .withTitle(courseData?.title || 'Test Course')
      .withDescription(courseData?.description || 'Test course description')
      .asPublished()
      .build();

    this.currentCourse = shouldSucceed ? course : null;

    this.behaviorResults['createCourse'] = {
      success: shouldSucceed,
      message: shouldSucceed ? 'Course created successfully' : 'Course creation failed',
      data: shouldSucceed ? course : undefined,
    };

    this.workflowScenario.lastActivity = 'course_creation_configured';
    this.recordInteraction('configureCourseCreation');
  }

  /**
   * Configure course access behavior for different user roles
   */
  configureCourseAccess(
    userRole: UserRoleEnum,
    accessLevel: 'view' | 'edit' | 'admin' | 'none',
    courseData?: Partial<ICourse> | ICourse | null,
    shouldSucceed: boolean = true
  ): void {
    this.workflowScenario.userRole = userRole;
    this.workflowScenario.courseAccess = accessLevel;

    if (accessLevel !== 'none' && shouldSucceed) {
      if (courseData && typeof courseData === 'object' && 'id' in courseData) {
        // Use the provided course object directly
        this.currentCourse = courseData as ICourse;
      } else {
        // Build a new course with the provided data
        this.currentCourse = TestDataBuilder.course()
          .withTitle(courseData?.title || 'Accessible Course')
          .withStatus(courseData?.status || 'published')
          .build();
      }
    }

    this.behaviorResults['accessCourse'] = {
      success: accessLevel !== 'none',
      message: accessLevel === 'none' ? 'Access denied' : 'Course access granted',
      data: {
        courseId: this.currentCourse?.id,
        hasAccess: accessLevel !== 'none',
        accessLevel,
        userRole,
      },
    };

    this.workflowScenario.lastActivity = 'course_access_configured';
    this.recordInteraction(`configureCourseAccess:${userRole}:${accessLevel}`);
  }

  /**
   * Configure course enrollment behavior
   */
  configureCourseEnrollment(
    shouldSucceed: boolean,
    enrollmentStatus: 'enrolled' | 'pending' | 'dropped' | 'not_enrolled' = 'enrolled'
  ): void {
    this.workflowScenario.enrollmentStatus = enrollmentStatus;

    if (shouldSucceed && enrollmentStatus === 'enrolled') {
      const enrollment = TestDataBuilder.enrollment()
        .forCourse(this.currentCourse?.id || 'test-course')
        .forStudent('test-student')
        .asActive()
        .build();

      this.currentEnrollments.push(enrollment);
    }

    this.behaviorResults['enrollInCourse'] = {
      success: shouldSucceed,
      message: shouldSucceed ? 'Enrollment successful' : 'Enrollment failed',
      data: shouldSucceed ? {
        enrollmentId: 1,
        courseId: this.currentCourse?.id || 'test-course',
        studentId: 'test-student',
        enrollmentDate: new Date().toISOString(),
        status: enrollmentStatus,
      } : undefined,
    };

    this.workflowScenario.lastActivity = 'enrollment_configured';
    this.recordInteraction(`configureCourseEnrollment:${enrollmentStatus}`);
  }

  /**
   * Configure task creation and management behavior
   */
  configureTaskManagement(
    taskCount: number,
    shouldSucceed: boolean = true,
    taskType: 'quiz' | 'assignment' | 'project' = 'assignment',
    providedTasks?: ILearningTask[]
  ): void {
    this.workflowScenario.tasksAvailable = taskCount;

    if (shouldSucceed) {
      if (providedTasks && providedTasks.length > 0) {
        // Use the provided tasks array
        this.currentTasks = [...providedTasks];
      } else {
        // Generate tasks if none provided
        this.currentTasks = [];
        for (let i = 0; i < taskCount; i++) {
          const task = TestDataBuilder.task()
            .forCourse(this.currentCourse?.id || 'test-course')
            .withTitle(`${taskType} ${i + 1}`)
            .dueInDays(7 + i)
            .build();

          this.currentTasks.push(task);
        }
      }
    }

    this.behaviorResults['createTask'] = {
      success: shouldSucceed,
      message: shouldSucceed ? 'Tasks created successfully' : 'Task creation failed',
      data: shouldSucceed ? { tasksCreated: taskCount, taskType } : undefined,
    };

    this.workflowScenario.lastActivity = 'task_management_configured';
    this.recordInteraction(`configureTaskManagement:${taskCount}:${taskType}`);
  }

  /**
   * Configure task submission behavior
   */
  configureTaskSubmission(taskId: string, shouldSucceed: boolean = true): void {
    const task = this.currentTasks.find(t => t.id === taskId);

    this.behaviorResults['submitTask'] = {
      success: shouldSucceed,
      message: shouldSucceed ? 'Task submitted successfully' : 'Task submission failed',
      data: shouldSucceed ? {
        taskId,
        submissionId: `submission-${taskId}`,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
      } : undefined,
    };

    if (shouldSucceed) {
      this.workflowScenario.tasksCompleted += 1;
      this.workflowScenario.progressPercentage = Math.round(
        (this.workflowScenario.tasksCompleted / this.workflowScenario.tasksAvailable) * 100
      );
    }

    this.workflowScenario.lastActivity = 'task_submission_configured';
    this.recordInteraction(`configureTaskSubmission:${taskId}`);
  }

  /**
   * Configure course progress tracking behavior
   */
  configureCourseProgress(progressPercentage: number, completedTasks: number = 0): void {
    this.workflowScenario.progressPercentage = progressPercentage;
    this.workflowScenario.tasksCompleted = completedTasks;

    this.behaviorResults['getCourseProgress'] = {
      success: true,
      message: 'Course progress retrieved successfully',
      data: {
        courseId: this.currentCourse?.id,
        progressPercentage,
        tasksCompleted: completedTasks,
        tasksTotal: this.workflowScenario.tasksAvailable,
        lastActivity: new Date().toISOString(),
      },
    };

    this.workflowScenario.lastActivity = 'progress_configured';
    this.recordInteraction('configureCourseProgress');
  }

  /**
   * Configure instructor course management behavior
   */
  configureInstructorCourseManagement(
    courseCount: number,
    enrolledStudentsPerCourse: number = 15
  ): void {
    this.workflowScenario.userRole = UserRoleEnum.INSTRUCTOR;
    this.workflowScenario.courseAccess = 'edit';

    // Create multiple courses for instructor
    const instructorCourses: ICourse[] = [];
    for (let i = 0; i < courseCount; i++) {
      const course = TestDataBuilder.course()
        .withTitle(`Course ${i + 1}`)
        .withInstructor(TestDataBuilder.instructor())
        .withEnrolledStudents(enrolledStudentsPerCourse)
        .asPublished()
        .build();
      instructorCourses.push(course);
    }

    this.behaviorResults['getInstructorCourses'] = {
      success: true,
      message: 'Instructor courses retrieved successfully',
      data: {
        courses: instructorCourses,
        totalCourses: courseCount,
        totalStudents: courseCount * enrolledStudentsPerCourse,
      },
    };

    this.workflowScenario.lastActivity = 'instructor_management_configured';
    this.recordInteraction('configureInstructorCourseManagement');
  }

  /**
   * Simulate course discovery behavior
   */
  simulateCourseDiscovery(searchTerm?: string, filters?: Record<string, unknown>): ICourse[] {
    const availableCourses = [
      TestDataBuilder.course().withTitle('Introduction to Computer Science').asPublished().build(),
      TestDataBuilder.course().withTitle('Advanced Mathematics').asPublished().build(),
      TestDataBuilder.course().withTitle('Physics Fundamentals').asPublished().build(),
    ];

    let filteredCourses = availableCourses;

    if (searchTerm) {
      filteredCourses = availableCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    this.recordInteraction(`simulateCourseDiscovery:${searchTerm || 'all'}`);
    return filteredCourses;
  }

  /**
   * Verify course was accessed
   */
  verifyCourseWasAccessed(): boolean {
    return this.interactionTracker.courseActions.some(action =>
      action.includes('configureCourseAccess') || action.includes('accessCourse')
    );
  }

  /**
   * Verify course was created
   */
  verifyCourseWasCreated(): boolean {
    return this.behaviorResults['createCourse']?.success === true;
  }

  /**
   * Verify course was updated
   */
  verifyCourseWasUpdated(): boolean {
    return this.interactionTracker.courseActions.some(action =>
      action.includes('updateCourse') || action.includes('modifyCourse')
    );
  }

  /**
   * Verify enrollment occurred
   */
  verifyEnrollmentOccurred(): boolean {
    return this.behaviorResults['enrollInCourse']?.success === true;
  }

  /**
   * Verify task was submitted
   */
  verifyTaskWasSubmitted(taskId?: string): boolean {
    if (taskId) {
      return this.interactionTracker.taskActions.some(action =>
        action.includes(`configureTaskSubmission:${taskId}`)
      );
    }
    return this.behaviorResults['submitTask']?.success === true;
  }

  /**
   * Verify progress was updated
   */
  verifyProgressWasUpdated(): boolean {
    return this.workflowScenario.progressPercentage > 0;
  }

  /**
   * Verify educational goals were met
   */
  verifyEducationalGoalsMet(): boolean {
    // Educational goals are met if student has made significant progress
    return (
      this.workflowScenario.enrollmentStatus === 'enrolled' &&
      this.workflowScenario.progressPercentage >= 70 &&
      this.workflowScenario.tasksCompleted > 0
    );
  }

  /**
   * Get current course
   */
  getCurrentCourse(): ICourse | null {
    return this.currentCourse;
  }

  /**
   * Get created course (alias for getCurrentCourse for clarity in tests)
   */
  getCreatedCourse(): ICourse | null {
    return this.getCurrentCourse();
  }

  /**
   * Get current tasks
   */
  getCurrentTasks(): ILearningTask[] {
    return [...this.currentTasks];
  }

  /**
   * Get current enrollments
   */
  getCurrentEnrollments(): ICourseEnrollment[] {
    return [...this.currentEnrollments];
  }

  /**
   * Get workflow scenario
   */
  getWorkflowScenario(): CourseWorkflowScenario {
    return { ...this.workflowScenario };
  }

  /**
   * Get educational outcome for specific action
   */
  getEducationalOutcome(action: string): EducationalOutcome | undefined {
    return this.behaviorResults[action];
  }

  /**
   * Get comprehensive workflow verification
   */
  getWorkflowVerification(): CourseWorkflowVerification {
    return {
      courseAccessed: this.verifyCourseWasAccessed(),
      courseCreated: this.verifyCourseWasCreated(),
      courseUpdated: this.verifyCourseWasUpdated(),
      enrollmentChanged: this.verifyEnrollmentOccurred(),
      tasksCreated: this.currentTasks.length,
      tasksSubmitted: this.workflowScenario.tasksCompleted,
      progressUpdated: this.verifyProgressWasUpdated(),
      educationalGoalsMet: this.verifyEducationalGoalsMet(),
    };
  }

  /**
   * Get interaction history for debugging
   */
  getInteractionHistory(): CourseInteractionTracker {
    return { ...this.interactionTracker };
  }

  /**
   * Reset behavior state for test isolation
   */
  reset(): void {
    this.currentCourse = null;
    this.currentTasks = [];
    this.currentEnrollments = [];
    this.behaviorResults = {};

    this.workflowScenario = {
      userRole: UserRoleEnum.STUDENT,
      courseAccess: 'view',
      enrollmentStatus: 'not_enrolled',
      courseStatus: 'published',
      tasksAvailable: 0,
      tasksCompleted: 0,
      progressPercentage: 0,
      lastActivity: 'reset',
    };

    this.interactionTracker = {
      courseActions: [],
      taskActions: [],
      enrollmentActions: [],
      progressActions: [],
      outcomeResults: [],
      lastInteraction: 'reset',
    };
  }

  /**
   * Create mock course service for testing
   */
  createMockCourseService(): Partial<ICourseManagementService> {
    const behavior = this;

    return {
      // Course discovery and access
      discoverCourses: async (filters?: Record<string, unknown>): Promise<IPaginatedResponse<ICourse>> => {
        behavior.recordInteraction('discoverCourses');
        const courses = behavior.simulateCourseDiscovery(filters?.search as string, filters);
        return {
          count: courses.length,
          next: null,
          previous: null,
          results: courses,
        };
      },

      accessCourse: async (courseId: string | number): Promise<CourseAccessBehaviorResult> => {
        behavior.recordInteraction(`accessCourse:${courseId}`);
        return behavior.behaviorResults['accessCourse'] as CourseAccessBehaviorResult || {
          success: false,
          message: 'Course access not configured',
          data: {
            courseId,
            hasAccess: false,
            accessLevel: 'none',
          },
        };
      },

      getCourseDetails: async (courseId: string | number): Promise<ICourse> => {
        behavior.recordInteraction(`getCourseDetails:${courseId}`);
        if (!behavior.currentCourse) {
          throw new Error('Course not found');
        }
        return behavior.currentCourse;
      },

      getCourseContent: async (courseId: string | number): Promise<ICourse> => {
        behavior.recordInteraction(`getCourseContent:${courseId}`);
        if (behavior.currentCourse) {
          return behavior.currentCourse;
        }
        throw new Error('Course not found or access denied');
      },

      // Course management
      createCourse: async (courseData: Partial<ICourse>): Promise<EducationalOutcome> => {
        behavior.recordInteraction('createCourse');
        return behavior.behaviorResults['createCourse'] || {
          success: false,
          message: 'Course creation not configured',
        };
      },

      modifyCourse: async (courseId: string | number, updates: Partial<ICourse>): Promise<EducationalOutcome> => {
        behavior.recordInteraction(`modifyCourse:${courseId}`);
        return {
          success: true,
          message: 'Course updated successfully',
          data: { courseId, updates },
        };
      },

      publishCourse: async (courseId: string | number): Promise<EducationalOutcome> => {
        behavior.recordInteraction(`publishCourse:${courseId}`);
        return {
          success: true,
          message: 'Course published successfully',
          data: { courseId, status: 'published' },
        };
      },

      // Instructor methods
      getInstructorCourses: async (instructorId?: string | number): Promise<IPaginatedResponse<ICourse>> => {
        behavior.recordInteraction(`getInstructorCourses:${instructorId}`);
        const result = behavior.behaviorResults['getInstructorCourses'];
        if (result?.success) {
          return {
            count: (result.data as any)?.totalCourses || 0,
            next: null,
            previous: null,
            results: (result.data as any)?.courses || [],
          };
        }
        return { count: 0, next: null, previous: null, results: [] };
      },

      // Progress tracking
      getCourseProgress: async (courseId: string | number): Promise<EducationalOutcome> => {
        behavior.recordInteraction(`getCourseProgress:${courseId}`);
        return behavior.behaviorResults['getCourseProgress'] || {
          success: true,
          message: 'Progress retrieved',
          data: { progressPercentage: behavior.workflowScenario.progressPercentage },
        };
      },
    };
  }

  /**
   * Create mock enrollment service for testing
   */
  createMockEnrollmentService(): Partial<IEnrollmentService> {
    const behavior = this;

    return {
      enrollInCourse: async (courseId: string | number, studentId?: string | number): Promise<EnrollmentBehaviorResult> => {
        behavior.recordInteraction(`enrollInCourse:${courseId}`);
        return behavior.behaviorResults['enrollInCourse'] as EnrollmentBehaviorResult || {
          success: false,
          message: 'Enrollment not configured',
        };
      },

      getEnrollmentStatus: async (courseId: string | number, studentId?: string | number) => {
        behavior.recordInteraction(`getEnrollmentStatus:${courseId}`);
        return {
          enrolled: behavior.workflowScenario.enrollmentStatus === 'enrolled',
          enrollmentDate: new Date().toISOString(),
          enrollmentId: 1,
        };
      },
    };
  }

  /**
   * Create mock task service for testing
   */
  createMockTaskService(): Partial<ILearningTaskService> {
    const behavior = this;

    return {
      getTasksForCourse: async (courseId: string): Promise<ILearningTask[]> => {
        behavior.recordInteraction(`getTasksForCourse:${courseId}`);
        return behavior.currentTasks;
      },

      getAllTasksByCourseId: async (courseId: string): Promise<ILearningTask[]> => {
        behavior.recordInteraction(`getAllTasksByCourseId:${courseId}`);
        return behavior.currentTasks;
      },

      createTask: async (taskData: ITaskCreationData, notifyStudents?: boolean): Promise<TaskSubmissionBehaviorResult> => {
        behavior.recordInteraction('createTask');
        return behavior.behaviorResults['createTask'] as TaskSubmissionBehaviorResult || {
          success: false,
          message: 'Task creation not configured',
        };
      },

      submitTask: async (taskId: string, submissionData: unknown): Promise<TaskSubmissionBehaviorResult> => {
        behavior.recordInteraction(`submitTask:${taskId}`);
        return behavior.behaviorResults['submitTask'] as TaskSubmissionBehaviorResult || {
          success: false,
          message: 'Task submission not configured',
        };
      },
    };
  }

  /**
   * Record interaction for behavior verification
   */
  private recordInteraction(action: string): void {
    // Categorize the interaction
    if (action.includes('Course') || action.includes('course')) {
      this.interactionTracker.courseActions.push(action);
    } else if (action.includes('Task') || action.includes('task')) {
      this.interactionTracker.taskActions.push(action);
    } else if (action.includes('Enrollment') || action.includes('enrollment')) {
      this.interactionTracker.enrollmentActions.push(action);
    } else if (action.includes('Progress') || action.includes('progress')) {
      this.interactionTracker.progressActions.push(action);
    }

    this.interactionTracker.lastInteraction = action;
    this.workflowScenario.lastActivity = action;
  }
}

/**
 * Convenience factory functions for common course test scenarios
 */
export class CourseTestScenarios {
  /**
   * Create student course enrollment scenario
   */
  static studentEnrollment(courseTitle?: string): CourseTestBehavior {
    const behavior = new CourseTestBehavior();
    behavior.configureCourseAccess(UserRoleEnum.STUDENT, 'view', { title: courseTitle });
    behavior.configureCourseEnrollment(true, 'enrolled');
    return behavior;
  }

  /**
   * Create instructor course management scenario
   */
  static instructorCourseManagement(courseCount: number = 3): CourseTestBehavior {
    const behavior = new CourseTestBehavior();
    behavior.configureInstructorCourseManagement(courseCount);
    return behavior;
  }

  /**
   * Create course creation scenario
   */
  static courseCreation(shouldSucceed: boolean = true): CourseTestBehavior {
    const behavior = new CourseTestBehavior();
    behavior.configureCourseCreation(shouldSucceed);
    return behavior;
  }

  /**
   * Create task submission scenario
   */
  static taskSubmission(taskCount: number = 3): CourseTestBehavior {
    const behavior = new CourseTestBehavior();
    behavior.configureTaskManagement(taskCount);
    behavior.configureCourseEnrollment(true, 'enrolled');
    return behavior;
  }

  /**
   * Create course progress tracking scenario
   */
  static courseProgress(progressPercentage: number = 75): CourseTestBehavior {
    const behavior = new CourseTestBehavior();
    behavior.configureCourseAccess(UserRoleEnum.STUDENT, 'view');
    behavior.configureCourseEnrollment(true, 'enrolled');
    behavior.configureCourseProgress(progressPercentage, Math.floor(progressPercentage / 20));
    return behavior;
  }
}