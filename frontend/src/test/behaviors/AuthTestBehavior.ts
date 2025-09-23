/**
 * Authentication Test Behavior Class
 *
 * Provides unified authentication testing utilities that focus on user behavior
 * and outcomes rather than implementation details. Supports role-based testing
 * scenarios specific to the educational platform context.
 *
 * ## Key Features
 * - Behavior-driven authentication testing patterns
 * - Role-based access control testing for educational context
 * - Navigation behavior verification for different user roles
 * - Authentication state management testing
 * - Educational workflow authentication scenarios
 *
 * ## Usage Example
 * ```typescript
 * // Setup student login behavior
 * const authBehavior = new AuthTestBehavior();
 * authBehavior.configureStudentLogin('john.doe@university.edu');
 *
 * // Test component behavior
 * render(<LoginPage />);
 * await user.click(loginButton);
 *
 * // Verify authentication behavior, not implementation
 * expect(authBehavior.verifyUserNavigatedTo('/student/dashboard')).toBe(true);
 * expect(authBehavior.getCurrentUserRole()).toBe(UserRoleEnum.STUDENT);
 * ```
 *
 * @since 2025-09-20 (TASK-059 Test Suite Modernization)
 */

import { TestDataBuilder } from '@/test/builders/TestDataBuilder';
import {
  ICompleteAuthService,
  AuthBehaviorResult,
  AccessBehaviorResult,
  NavigationBehaviorResult,
  EDUCATIONAL_PERMISSIONS,
  EducationalPermission,
} from '@/test/contracts/IAuthService';
import { IUser, UserRoleEnum } from '@/types/userTypes';

/**
 * Authentication test scenario configuration
 */
export interface AuthTestScenario {
  userRole: UserRoleEnum;
  isAuthenticated: boolean;
  permissions: EducationalPermission[];
  courseAccess: string[];
  navigationHistory: string[];
  lastAction: string;
}

/**
 * Authentication behavior verification results
 */
export interface AuthBehaviorVerification {
  loginAttempted: boolean;
  loginSuccessful: boolean;
  navigationOccurred: boolean;
  targetPath: string;
  userRole: UserRoleEnum;
  hasRequiredPermissions: boolean;
  sessionValid: boolean;
}

/**
 * Authentication Test Behavior Class
 *
 * Manages authentication behavior testing for educational platform scenarios.
 */
export class AuthTestBehavior {
  private currentUser: IUser | null = null;
  private authenticationState: AuthTestScenario;
  private interactionHistory: string[] = [];
  private navigationHistory: string[] = [];
  private permissionChecks: Record<string, boolean> = {};
  private lastAuthResult: AuthBehaviorResult | null = null;

  constructor() {
    this.authenticationState = {
      userRole: UserRoleEnum.GUEST,
      isAuthenticated: false,
      permissions: [],
      courseAccess: [],
      navigationHistory: [],
      lastAction: 'initialized',
    };
  }

  /**
   * Configure student login behavior
   */
  configureStudentLogin(email?: string): void {
    this.currentUser = TestDataBuilder.user()
      .asStudent()
      .withEmail(email || 'student@university.edu')
      .build();

    this.authenticationState = {
      userRole: UserRoleEnum.STUDENT,
      isAuthenticated: true,
      permissions: [
        EDUCATIONAL_PERMISSIONS.VIEW_COURSE,
        EDUCATIONAL_PERMISSIONS.SUBMIT_TASK,
      ],
      courseAccess: ['course-1', 'course-2'], // Mock enrolled courses
      navigationHistory: ['/student/dashboard'],
      lastAction: 'student_login_configured',
    };

    this.lastAuthResult = {
      success: true,
      message: 'Student login successful',
      data: {
        user: this.currentUser,
        tokens: { access: 'student-token', refresh: 'student-refresh' },
        redirectPath: '/student/dashboard',
      },
    };

    this.recordInteraction('configureStudentLogin');
  }

  /**
   * Configure instructor login behavior
   */
  configureInstructorLogin(email?: string): void {
    this.currentUser = TestDataBuilder.user()
      .asInstructor()
      .withEmail(email || 'instructor@university.edu')
      .build();

    this.authenticationState = {
      userRole: UserRoleEnum.INSTRUCTOR,
      isAuthenticated: true,
      permissions: [
        EDUCATIONAL_PERMISSIONS.VIEW_COURSE,
        EDUCATIONAL_PERMISSIONS.CREATE_COURSE,
        EDUCATIONAL_PERMISSIONS.EDIT_COURSE,
        EDUCATIONAL_PERMISSIONS.CREATE_TASK,
        EDUCATIONAL_PERMISSIONS.EDIT_TASK,
        EDUCATIONAL_PERMISSIONS.GRADE_STUDENTS,
        EDUCATIONAL_PERMISSIONS.VIEW_STUDENT_PROGRESS,
        EDUCATIONAL_PERMISSIONS.ENROLL_STUDENTS,
      ],
      courseAccess: ['course-1', 'course-2', 'course-3'], // Mock instructor courses
      navigationHistory: ['/instructor/courses'],
      lastAction: 'instructor_login_configured',
    };

    this.lastAuthResult = {
      success: true,
      message: 'Instructor login successful',
      data: {
        user: this.currentUser,
        tokens: { access: 'instructor-token', refresh: 'instructor-refresh' },
        redirectPath: '/instructor/courses',
      },
    };

    this.recordInteraction('configureInstructorLogin');
  }

  /**
   * Configure admin login behavior
   */
  configureAdminLogin(email?: string): void {
    this.currentUser = TestDataBuilder.user()
      .asAdmin()
      .withEmail(email || 'admin@university.edu')
      .build();

    this.authenticationState = {
      userRole: UserRoleEnum.ADMIN,
      isAuthenticated: true,
      permissions: Object.values(EDUCATIONAL_PERMISSIONS),
      courseAccess: ['*'], // Admin has access to all courses
      navigationHistory: ['/admin/dashboard'],
      lastAction: 'admin_login_configured',
    };

    this.lastAuthResult = {
      success: true,
      message: 'Admin login successful',
      data: {
        user: this.currentUser,
        tokens: { access: 'admin-token', refresh: 'admin-refresh' },
        redirectPath: '/admin/dashboard',
      },
    };

    this.recordInteraction('configureAdminLogin');
  }

  /**
   * Configure unauthenticated user behavior
   */
  configureUnauthenticatedUser(): void {
    this.currentUser = null;
    this.authenticationState = {
      userRole: UserRoleEnum.GUEST,
      isAuthenticated: false,
      permissions: [],
      courseAccess: [],
      navigationHistory: ['/login'],
      lastAction: 'unauthenticated_configured',
    };

    this.lastAuthResult = {
      success: false,
      message: 'User not authenticated',
      errorCode: 'UNAUTHENTICATED',
    };

    this.recordInteraction('configureUnauthenticatedUser');
  }

  /**
   * Configure login failure behavior
   */
  configureLoginFailure(errorMessage: string = 'Invalid credentials'): void {
    this.currentUser = null;
    this.authenticationState = {
      userRole: UserRoleEnum.GUEST,
      isAuthenticated: false,
      permissions: [],
      courseAccess: [],
      navigationHistory: ['/login'],
      lastAction: 'login_failure_configured',
    };

    this.lastAuthResult = {
      success: false,
      message: errorMessage,
      errorCode: 'INVALID_CREDENTIALS',
    };

    this.recordInteraction('configureLoginFailure');
  }

  /**
   * Configure user registration behavior
   */
  configureUserRegistration(role: UserRoleEnum = UserRoleEnum.STUDENT): void {
    this.currentUser = TestDataBuilder.user()
      .withUsername('newuser')
      .withEmail('newuser@university.edu')
      .build();

    this.currentUser.role = role;

    this.authenticationState = {
      userRole: role,
      isAuthenticated: true,
      permissions: this.getDefaultPermissionsForRole(role),
      courseAccess: [],
      navigationHistory: [this.getDefaultPathForRole(role)],
      lastAction: 'registration_configured',
    };

    this.lastAuthResult = {
      success: true,
      message: 'Registration successful',
      data: {
        user: this.currentUser,
        tokens: { access: 'new-user-token', refresh: 'new-user-refresh' },
        redirectPath: this.getDefaultPathForRole(role),
      },
    };

    this.recordInteraction('configureUserRegistration');
  }

  /**
   * Simulate navigation to specific path
   */
  simulateNavigationTo(path: string): void {
    this.navigationHistory.push(path);
    this.authenticationState.navigationHistory.push(path);
    this.authenticationState.lastAction = 'navigation';
    this.recordInteraction(`navigateTo:${path}`);
  }

  /**
   * Simulate course access attempt
   */
  simulateCourseAccess(courseId: string): AccessBehaviorResult {
    this.recordInteraction(`accessCourse:${courseId}`);

    const hasAccess = this.authenticationState.courseAccess.includes(courseId) ||
                     this.authenticationState.courseAccess.includes('*');

    const result: AccessBehaviorResult = {
      hasAccess,
      accessLevel: hasAccess ? 'read' : 'none',
      role: this.authenticationState.userRole,
      permissions: this.authenticationState.permissions,
      redirectRequired: !hasAccess && !this.authenticationState.isAuthenticated,
      redirectPath: !this.authenticationState.isAuthenticated ? '/login' : '/unauthorized',
    };

    if (this.authenticationState.userRole === UserRoleEnum.INSTRUCTOR) {
      result.accessLevel = hasAccess ? 'write' : 'none';
    }
    if (this.authenticationState.userRole === UserRoleEnum.ADMIN) {
      result.accessLevel = 'admin';
      result.hasAccess = true;
    }

    return result;
  }

  /**
   * Simulate permission check
   */
  simulatePermissionCheck(permission: EducationalPermission): boolean {
    this.recordInteraction(`checkPermission:${permission}`);
    const hasPermission = this.authenticationState.permissions.includes(permission);
    this.permissionChecks[permission] = hasPermission;
    return hasPermission;
  }

  /**
   * Verify user authentication attempt occurred
   */
  verifyAuthenticationAttempted(): boolean {
    return this.interactionHistory.some(action =>
      action.includes('configureStudentLogin') ||
      action.includes('configureInstructorLogin') ||
      action.includes('configureAdminLogin') ||
      action.includes('authenticateUser')
    );
  }

  /**
   * Alias for verifyAuthenticationAttempted (for test clarity)
   */
  wasAuthenticationAttempted(): boolean {
    return this.verifyAuthenticationAttempted();
  }

  /**
   * Verify user navigated to specific path
   */
  verifyUserNavigatedTo(expectedPath: string): boolean {
    return this.navigationHistory.includes(expectedPath);
  }

  /**
   * Verify user was redirected for authentication
   */
  verifyRedirectToLogin(): boolean {
    return this.navigationHistory.includes('/login') ||
           this.authenticationState.navigationHistory.includes('/login');
  }

  /**
   * Verify user has required permission
   */
  verifyUserHasPermission(permission: EducationalPermission): boolean {
    return this.authenticationState.permissions.includes(permission);
  }

  /**
   * Verify course access was granted
   */
  verifyCourseAccessGranted(courseId: string): boolean {
    return this.interactionHistory.includes(`accessCourse:${courseId}`) &&
           (this.authenticationState.courseAccess.includes(courseId) ||
            this.authenticationState.courseAccess.includes('*'));
  }

  /**
   * Get current user role
   */
  getCurrentUserRole(): UserRoleEnum {
    return this.authenticationState.userRole;
  }

  /**
   * Get current user
   */
  getCurrentUser(): IUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated(): boolean {
    return this.authenticationState.isAuthenticated;
  }

  /**
   * Get authentication result
   */
  getAuthenticationResult(): AuthBehaviorResult | null {
    return this.lastAuthResult;
  }

  /**
   * Get navigation history
   */
  getNavigationHistory(): string[] {
    return [...this.navigationHistory];
  }

  /**
   * Get interaction history for debugging
   */
  getInteractionHistory(): string[] {
    return [...this.interactionHistory];
  }

  /**
   * Get permission check results
   */
  getPermissionCheckResults(): Record<string, boolean> {
    return { ...this.permissionChecks };
  }

  /**
   * Get comprehensive behavior verification
   */
  getBehaviorVerification(): AuthBehaviorVerification {
    return {
      loginAttempted: this.verifyAuthenticationAttempted(),
      loginSuccessful: this.authenticationState.isAuthenticated,
      navigationOccurred: this.navigationHistory.length > 0,
      targetPath: this.navigationHistory[this.navigationHistory.length - 1] || '/',
      userRole: this.authenticationState.userRole,
      hasRequiredPermissions: this.authenticationState.permissions.length > 0,
      sessionValid: this.authenticationState.isAuthenticated,
    };
  }

  /**
   * Reset behavior state for test isolation
   */
  reset(): void {
    this.currentUser = null;
    this.authenticationState = {
      userRole: UserRoleEnum.GUEST,
      isAuthenticated: false,
      permissions: [],
      courseAccess: [],
      navigationHistory: [],
      lastAction: 'reset',
    };
    this.interactionHistory = [];
    this.navigationHistory = [];
    this.permissionChecks = {};
    this.lastAuthResult = null;
  }

  /**
   * Create mock auth service for testing
   */
  createMockAuthService(): Partial<ICompleteAuthService> {
    return {
      // Authentication methods
      authenticateUser: async (username: string, _password: string): Promise<AuthBehaviorResult> => {
        this.recordInteraction(`authenticateUser:${username}`);
        return this.lastAuthResult || {
          success: false,
          message: 'No authentication behavior configured',
          errorCode: 'NO_BEHAVIOR_CONFIGURED',
        };
      },

      getCurrentUser: async (): Promise<IUser | null> => {
        this.recordInteraction('getCurrentUser');
        return this.currentUser;
      },

      logoutUser: async (): Promise<AuthBehaviorResult> => {
        this.recordInteraction('logoutUser');
        this.currentUser = null;
        this.authenticationState.isAuthenticated = false;
        this.authenticationState.userRole = UserRoleEnum.GUEST;
        return {
          success: true,
          message: 'Logout successful',
        };
      },

      // Role and permission methods
      getUserRole: (userId?: string): UserRoleEnum => {
        this.recordInteraction(`getUserRole:${userId || 'current'}`);
        return this.authenticationState.userRole;
      },

      hasPermission: (permission: string, _userId?: string): boolean => {
        this.recordInteraction(`hasPermission:${permission}`);
        return this.simulatePermissionCheck(permission as EducationalPermission);
      },

      canAccessCourse: async (courseId: string | number, _userId?: string): Promise<AccessBehaviorResult> => {
        this.recordInteraction(`canAccessCourse:${courseId}`);
        return this.simulateCourseAccess(String(courseId));
      },

      // Navigation methods
      determinePostLoginDestination: (user: IUser): NavigationBehaviorResult => {
        const targetPath = this.getDefaultPathForRole(user.role);
        this.simulateNavigationTo(targetPath);
        return {
          shouldNavigate: true,
          targetPath,
          reason: 'Post-login navigation',
          userRole: user.role,
          isAuthenticated: true,
        };
      },

      getDefaultPathForRole: (role: UserRoleEnum): string => {
        return this.getDefaultPathForRole(role);
      },

      // Session management
      validateSession: async (): Promise<boolean> => {
        this.recordInteraction('validateSession');
        return this.authenticationState.isAuthenticated;
      },

      isSessionValid: (): boolean => {
        this.recordInteraction('isSessionValid');
        return this.authenticationState.isAuthenticated;
      },

      // State management
      getAuthenticationState: () => ({
        isAuthenticated: this.authenticationState.isAuthenticated,
        user: this.currentUser,
        role: this.authenticationState.userRole,
        isLoading: false,
        error: null,
      }),
    };
  }

  /**
   * Get default permissions for role
   */
  private getDefaultPermissionsForRole(role: UserRoleEnum): EducationalPermission[] {
    switch (role) {
      case UserRoleEnum.STUDENT:
        return [
          EDUCATIONAL_PERMISSIONS.VIEW_COURSE,
          EDUCATIONAL_PERMISSIONS.SUBMIT_TASK,
        ];
      case UserRoleEnum.INSTRUCTOR:
        return [
          EDUCATIONAL_PERMISSIONS.VIEW_COURSE,
          EDUCATIONAL_PERMISSIONS.CREATE_COURSE,
          EDUCATIONAL_PERMISSIONS.EDIT_COURSE,
          EDUCATIONAL_PERMISSIONS.CREATE_TASK,
          EDUCATIONAL_PERMISSIONS.EDIT_TASK,
          EDUCATIONAL_PERMISSIONS.GRADE_STUDENTS,
          EDUCATIONAL_PERMISSIONS.VIEW_STUDENT_PROGRESS,
          EDUCATIONAL_PERMISSIONS.ENROLL_STUDENTS,
        ];
      case UserRoleEnum.ADMIN:
        return Object.values(EDUCATIONAL_PERMISSIONS);
      default:
        return [];
    }
  }

  /**
   * Get default navigation path for role
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

  /**
   * Record interaction for behavior verification
   */
  private recordInteraction(action: string): void {
    this.interactionHistory.push(action);
    this.authenticationState.lastAction = action;
  }
}

/**
 * Convenience factory functions for common test scenarios
 */
export class AuthTestScenarios {
  /**
   * Create student authentication scenario
   */
  static studentLogin(email?: string): AuthTestBehavior {
    const behavior = new AuthTestBehavior();
    this.configureStudentLogin(email);
    return behavior;
  }

  /**
   * Create instructor authentication scenario
   */
  static instructorLogin(email?: string): AuthTestBehavior {
    const behavior = new AuthTestBehavior();
    this.configureInstructorLogin(email);
    return behavior;
  }

  /**
   * Create admin authentication scenario
   */
  static adminLogin(email?: string): AuthTestBehavior {
    const behavior = new AuthTestBehavior();
    this.configureAdminLogin(email);
    return behavior;
  }

  /**
   * Create unauthenticated user scenario
   */
  static unauthenticatedUser(): AuthTestBehavior {
    const behavior = new AuthTestBehavior();
    this.configureUnauthenticatedUser();
    return behavior;
  }

  /**
   * Create login failure scenario
   */
  static loginFailure(errorMessage?: string): AuthTestBehavior {
    const behavior = new AuthTestBehavior();
    this.configureLoginFailure(errorMessage);
    return behavior;
  }
}