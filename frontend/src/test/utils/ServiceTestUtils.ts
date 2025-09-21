/**
 * Service Test Utilities for Behavior-Driven Testing
 *
 * Provides service abstraction injection and behavior testing utilities
 * for the educational platform. Enables testing component behaviors
 * rather than implementation details through service abstraction layers.
 *
 * ## Key Features
 * - ServiceFactory integration for dependency injection
 * - Behavior-based service doubles for predictable testing
 * - Educational domain-specific test behaviors
 * - Service contract compliance validation
 * - Test isolation and cleanup utilities
 *
 * ## Usage Example
 * ```typescript
 * // Setup behavior-driven service testing
 * const courseUtils = ServiceTestUtils.createCourseBehavior();
 * courseUtils.configureCourseAccess('read', { enrolled: true });
 *
 * // Test component behavior, not implementation
 * render(<CourseDetailsPage courseId="123" />);
 * expect(screen.getByText('Course Content')).toBeInTheDocument();
 * expect(courseUtils.wasCourseAccessed()).toBe(true);
 * ```
 *
 * @since 2025-09-20 (TASK-059 Test Suite Modernization)
 */

import { ServiceFactory } from '@/services/factory/serviceFactory';
import { ModernCourseService } from '@/services/resources/modernCourseService';
import { ModernLearningTaskService } from '@/services/resources/modernLearningTaskService';
import { ModernEnrollmentService } from '@/services/resources/modernEnrollmentService';

import {
  IEducationService,
  ICourseManagementService,
  ILearningTaskService,
  IEnrollmentService,
  EducationalOutcome,
  CourseAccessBehaviorResult,
  EnrollmentBehaviorResult,
  TaskSubmissionBehaviorResult,
} from '@/test/contracts/IEducationService';

import {
  ICompleteAuthService,
  IAuthService,
  IRoleBasedAccessService,
  IAuthNavigationService,
  AuthBehaviorResult,
  AccessBehaviorResult,
  NavigationBehaviorResult,
} from '@/test/contracts/IAuthService';

import { UserRoleEnum } from '@/types/userTypes';
import { ICourse } from '@/types/course';
import { ILearningTask } from '@/types/Task';
import { ICourseEnrollment } from '@/types/entities';

/**
 * Service behavior configuration for testing
 */
export interface ServiceBehaviorConfig {
  shouldSucceed: boolean;
  responseDelay?: number;
  errorMessage?: string;
  errorCode?: string;
  customResponse?: unknown;
}

/**
 * Test service registry for managing service doubles
 */
export interface TestServiceRegistry {
  courseService?: Partial<ICourseManagementService>;
  taskService?: Partial<ILearningTaskService>;
  enrollmentService?: Partial<IEnrollmentService>;
  authService?: Partial<ICompleteAuthService>;
}

/**
 * Service interaction tracking for behavior verification
 */
export interface ServiceInteractionTracker {
  methodCalls: string[];
  parameters: Record<string, unknown[]>;
  results: Record<string, unknown>;
  timestamps: Record<string, number>;
}

/**
 * Service Test Utilities Class
 *
 * Central utility for service abstraction and behavior testing.
 */
export class ServiceTestUtils {
  private static serviceFactory: ServiceFactory;
  private static interactionTracker: ServiceInteractionTracker = {
    methodCalls: [],
    parameters: {},
    results: {},
    timestamps: {},
  };

  /**
   * Initialize test environment with service abstractions
   */
  static initialize(): void {
    this.serviceFactory = ServiceFactory.getInstance();
    this.resetInteractionTracker();
  }

  /**
   * Create course behavior testing utilities
   */
  static createCourseBehavior(): CourseTestBehavior {
    return new CourseTestBehavior(this.serviceFactory, this.interactionTracker);
  }

  /**
   * Create authentication behavior testing utilities
   */
  static createAuthBehavior(): AuthTestBehavior {
    return new AuthTestBehavior(this.serviceFactory, this.interactionTracker);
  }

  /**
   * Create enrollment behavior testing utilities
   */
  static createEnrollmentBehavior(): EnrollmentTestBehavior {
    return new EnrollmentTestBehavior(this.serviceFactory, this.interactionTracker);
  }

  /**
   * Create task behavior testing utilities
   */
  static createTaskBehavior(): TaskTestBehavior {
    return new TaskTestBehavior(this.serviceFactory, this.interactionTracker);
  }

  /**
   * Inject test service doubles into ServiceFactory
   */
  static injectTestServices(services: TestServiceRegistry): void {
    // Inject test services directly using registerOverride
    if (services.courseService) {
      this.serviceFactory.registerOverride('ModernCourseService', services.courseService);
    }
    if (services.taskService) {
      this.serviceFactory.registerOverride('ModernLearningTaskService', services.taskService);
    }
    if (services.enrollmentService) {
      this.serviceFactory.registerOverride('ModernEnrollmentService', services.enrollmentService);
    }
    if (services.authService) {
      this.serviceFactory.registerOverride('AuthService', services.authService);
    }
  }

  /**
   * Clean up test environment
   */
  static cleanup(): void {
    // Clear all services for test isolation
    this.serviceFactory.clearServices();
    this.resetInteractionTracker();
  }

  /**
   * Reset interaction tracking
   */
  static resetInteractionTracker(): void {
    this.interactionTracker.methodCalls = [];
    this.interactionTracker.parameters = {};
    this.interactionTracker.results = {};
    this.interactionTracker.timestamps = {};
  }

  /**
   * Get interaction history for verification
   */
  static getInteractionHistory(): ServiceInteractionTracker {
    return { ...this.interactionTracker };
  }

  /**
   * Verify specific service interaction occurred
   */
  static verifyInteraction(methodName: string, expectedParams?: unknown[]): boolean {
    const occurred = this.interactionTracker.methodCalls.includes(methodName);
    if (!occurred) return false;

    if (expectedParams) {
      const actualParams = this.interactionTracker.parameters[methodName] || [];
      return this.deepEquals(actualParams, expectedParams);
    }

    return true;
  }

  /**
   * Deep equality check for parameter verification
   */
  private static deepEquals(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  /**
   * Create mock service with behavior configuration
   */
  static createMockService<T>(
    baseService: Partial<T>,
    behaviorConfig: ServiceBehaviorConfig
  ): T {
    const tracker = this.interactionTracker;

    return new Proxy(baseService as T, {
      get(target: any, prop: string) {
        if (typeof target[prop] === 'function') {
          return (...args: unknown[]) => {
            // Track interaction
            tracker.methodCalls.push(prop);
            tracker.parameters[prop] = args;
            tracker.timestamps[prop] = Date.now();

            // Apply behavior configuration
            if (behaviorConfig.responseDelay) {
              return new Promise(resolve => {
                setTimeout(() => {
                  if (behaviorConfig.shouldSucceed) {
                    const result = behaviorConfig.customResponse || { success: true };
                    tracker.results[prop] = result;
                    resolve(result);
                  } else {
                    const error = new Error(behaviorConfig.errorMessage || 'Test error');
                    tracker.results[prop] = error;
                    throw error;
                  }
                }, behaviorConfig.responseDelay);
              });
            }

            if (behaviorConfig.shouldSucceed) {
              const result = behaviorConfig.customResponse || { success: true };
              tracker.results[prop] = result;
              return Promise.resolve(result);
            } else {
              const error = new Error(behaviorConfig.errorMessage || 'Test error');
              tracker.results[prop] = error;
              throw error;
            }
          };
        }
        return target[prop];
      },
    });
  }
}

/**
 * Course Behavior Testing Utilities
 *
 * Focuses on course-related educational behaviors for testing.
 */
export class CourseTestBehavior {
  constructor(
    private serviceFactory: ServiceFactory,
    private tracker: ServiceInteractionTracker
  ) {}

  /**
   * Configure course access behavior
   */
  configureCourseAccess(
    accessLevel: 'view' | 'edit' | 'admin' | 'none',
    context: { enrolled?: boolean; role?: UserRoleEnum } = {}
  ): void {
    const mockService = ServiceTestUtils.createMockService<ICourseManagementService>(
      {
        accessCourse: async (courseId: string | number): Promise<CourseAccessBehaviorResult> => ({
          success: accessLevel !== 'none',
          message: accessLevel === 'none' ? 'Access denied' : 'Access granted',
          data: {
            courseId,
            hasAccess: accessLevel !== 'none',
            accessLevel,
            enrollmentStatus: context.enrolled ? 'enrolled' : 'not_enrolled',
          },
        }),
      },
      { shouldSucceed: accessLevel !== 'none' }
    );

    this.serviceFactory.registerOverride('ModernCourseService', mockService);
  }

  /**
   * Configure course creation behavior
   */
  configureCourseCreation(shouldSucceed: boolean, errorMessage?: string): void {
    const mockService = ServiceTestUtils.createMockService<ICourseManagementService>(
      {
        createCourse: async (courseData: Partial<ICourse>): Promise<EducationalOutcome> => ({
          success: shouldSucceed,
          message: shouldSucceed ? 'Course created successfully' : errorMessage || 'Course creation failed',
          data: shouldSucceed ? { courseId: 'test-course-123', ...courseData } : undefined,
        }),
      },
      { shouldSucceed, errorMessage }
    );

    this.serviceFactory.registerOverride('ModernCourseService', mockService);
  }

  /**
   * Configure course update behavior
   */
  configureCourseUpdate(shouldSucceed: boolean, errorMessage?: string): void {
    const mockService = ServiceTestUtils.createMockService<ICourseManagementService>(
      {
        modifyCourse: async (courseId: string | number, updates: Partial<ICourse>): Promise<EducationalOutcome> => ({
          success: shouldSucceed,
          message: shouldSucceed ? 'Course updated successfully' : errorMessage || 'Course update failed',
          data: shouldSucceed ? { courseId, ...updates } : undefined,
        }),
      },
      { shouldSucceed, errorMessage }
    );

    this.serviceFactory.registerOverride('ModernCourseService', mockService);
  }

  /**
   * Verify course was accessed
   */
  wasCourseAccessed(): boolean {
    return ServiceTestUtils.verifyInteraction('accessCourse');
  }

  /**
   * Verify course was created
   */
  wasCourseSaved(): boolean {
    return ServiceTestUtils.verifyInteraction('createCourse') || ServiceTestUtils.verifyInteraction('modifyCourse');
  }

  /**
   * Get course interaction details
   */
  getCourseInteractions(): { accessed: boolean; created: boolean; updated: boolean } {
    const history = ServiceTestUtils.getInteractionHistory();
    return {
      accessed: history.methodCalls.includes('accessCourse'),
      created: history.methodCalls.includes('createCourse'),
      updated: history.methodCalls.includes('modifyCourse'),
    };
  }
}

/**
 * Authentication Behavior Testing Utilities
 *
 * Focuses on authentication and authorization behaviors.
 */
export class AuthTestBehavior {
  constructor(
    private serviceFactory: ServiceFactory,
    private tracker: ServiceInteractionTracker
  ) {}

  /**
   * Configure user login behavior
   */
  configureLogin(role: UserRoleEnum, shouldSucceed: boolean = true): void {
    const mockService = ServiceTestUtils.createMockService<ICompleteAuthService>(
      {
        authenticateUser: async (username: string, password: string): Promise<AuthBehaviorResult> => ({
          success: shouldSucceed,
          message: shouldSucceed ? 'Login successful' : 'Invalid credentials',
          data: shouldSucceed ? {
            user: { id: 'test-user', username, role },
            tokens: { access: 'test-token', refresh: 'test-refresh' },
            redirectPath: this.getDefaultPathForRole(role),
          } : undefined,
        }),
        getUserRole: () => role,
      },
      { shouldSucceed }
    );

    this.serviceFactory.registerOverride('AuthService', mockService);
  }

  /**
   * Configure role-based access behavior
   */
  configureRoleAccess(role: UserRoleEnum, permissions: string[] = []): void {
    const mockService = ServiceTestUtils.createMockService<IRoleBasedAccessService>(
      {
        getUserRole: () => role,
        hasRole: (targetRole: UserRoleEnum) => targetRole === role,
        hasPermission: (permission: string) => permissions.includes(permission),
        getPermissions: () => permissions,
      },
      { shouldSucceed: true }
    );

    this.serviceFactory.registerOverride('AuthService', mockService);
  }

  /**
   * Configure navigation behavior
   */
  configureNavigation(user: { role: UserRoleEnum; isAuthenticated: boolean }): void {
    const mockService = ServiceTestUtils.createMockService<IAuthNavigationService>(
      {
        determinePostLoginDestination: (userObj): NavigationBehaviorResult => ({
          shouldNavigate: true,
          targetPath: this.getDefaultPathForRole(userObj.role),
          reason: 'Post-login navigation',
          userRole: userObj.role,
          isAuthenticated: user.isAuthenticated,
        }),
        getDefaultPathForRole: (role: UserRoleEnum) => this.getDefaultPathForRole(role),
      },
      { shouldSucceed: true }
    );

    this.serviceFactory.registerOverride('AuthService', mockService);
  }

  /**
   * Verify authentication attempt occurred
   */
  wasAuthenticationAttempted(): boolean {
    return ServiceTestUtils.verifyInteraction('authenticateUser');
  }

  /**
   * Verify navigation occurred
   */
  verifyNavigation(expectedPath: string): boolean {
    const history = ServiceTestUtils.getInteractionHistory();
    const navigationResult = history.results['determinePostLoginDestination'] as NavigationBehaviorResult;
    return navigationResult?.targetPath === expectedPath;
  }

  /**
   * Get default path for user role
   */
  private getDefaultPathForRole(role: UserRoleEnum): string {
    switch (role) {
      case UserRoleEnum.STUDENT:
        return '/student/dashboard';
      case UserRoleEnum.INSTRUCTOR:
        return '/instructor/courses';
      case UserRoleEnum.ADMIN:
        return '/admin/dashboard';
      default:
        return '/';
    }
  }
}

/**
 * Enrollment Behavior Testing Utilities
 */
export class EnrollmentTestBehavior {
  constructor(
    private serviceFactory: ServiceFactory,
    private tracker: ServiceInteractionTracker
  ) {}

  configureEnrollment(shouldSucceed: boolean, errorMessage?: string): void {
    const mockService = ServiceTestUtils.createMockService<IEnrollmentService>(
      {
        enrollInCourse: async (courseId: string | number): Promise<EnrollmentBehaviorResult> => ({
          success: shouldSucceed,
          message: shouldSucceed ? 'Enrollment successful' : errorMessage || 'Enrollment failed',
          data: shouldSucceed ? {
            enrollmentId: 123,
            courseId,
            studentId: 'test-student',
            enrollmentDate: new Date().toISOString(),
            status: 'active',
          } : undefined,
        }),
      },
      { shouldSucceed, errorMessage }
    );

    this.serviceFactory.registerOverride('ModernEnrollmentService', mockService);
  }

  wasEnrollmentAttempted(): boolean {
    return ServiceTestUtils.verifyInteraction('enrollInCourse');
  }
}

/**
 * Task Behavior Testing Utilities
 */
export class TaskTestBehavior {
  constructor(
    private serviceFactory: ServiceFactory,
    private tracker: ServiceInteractionTracker
  ) {}

  configureTaskSubmission(shouldSucceed: boolean, errorMessage?: string): void {
    const mockService = ServiceTestUtils.createMockService<ILearningTaskService>(
      {
        submitTask: async (taskId: string, submissionData: unknown): Promise<TaskSubmissionBehaviorResult> => ({
          success: shouldSucceed,
          message: shouldSucceed ? 'Task submitted successfully' : errorMessage || 'Task submission failed',
          data: shouldSucceed ? {
            taskId,
            submissionId: 'test-submission-123',
            submittedAt: new Date().toISOString(),
            status: 'submitted',
          } : undefined,
        }),
      },
      { shouldSucceed, errorMessage }
    );

    this.serviceFactory.registerOverride('ModernLearningTaskService', mockService);
  }

  wasTaskSubmitted(): boolean {
    return ServiceTestUtils.verifyInteraction('submitTask');
  }
}

// Initialize on module load
ServiceTestUtils.initialize();