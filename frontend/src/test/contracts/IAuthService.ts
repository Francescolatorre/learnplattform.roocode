/**
 * Authentication Service Contracts for Behavior-Driven Testing
 *
 * Defines behavior-focused interfaces for authentication and authorization
 * in the educational platform context, enabling consistent testing patterns
 * that focus on user outcomes rather than implementation details.
 *
 * These contracts support role-based access control specific to educational
 * workflows (student, instructor, admin) and authentication behaviors.
 *
 * @since 2025-09-20 (TASK-059 Test Suite Modernization)
 */

import { IUser, UserRoleEnum } from '@/types/userTypes';

/**
 * Authentication behavior outcomes
 */
export interface AuthBehaviorResult {
  success: boolean;
  message: string;
  data?: {
    user?: IUser;
    tokens?: {
      access?: string;
      refresh?: string;
    };
    redirectPath?: string;
  };
  errorCode?: string;
}

/**
 * Role-based access behavior result
 */
export interface AccessBehaviorResult {
  hasAccess: boolean;
  accessLevel: 'none' | 'read' | 'write' | 'admin';
  role: UserRoleEnum;
  permissions: string[];
  redirectRequired?: boolean;
  redirectPath?: string;
}

/**
 * Navigation behavior result for role-based routing
 */
export interface NavigationBehaviorResult {
  shouldNavigate: boolean;
  targetPath: string;
  reason: string;
  userRole: UserRoleEnum;
  isAuthenticated: boolean;
}

/**
 * Registration data for new users
 */
export interface IRegistrationData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRoleEnum;
  institutionId?: string;
}

/**
 * Password reset behavior data
 */
export interface IPasswordResetData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Authentication Service Contract
 *
 * Focuses on authentication behaviors and user experience outcomes
 * rather than implementation details.
 */
export interface IAuthService {
  // Core Authentication Behaviors
  authenticateUser(username: string, password: string): Promise<AuthBehaviorResult>;
  registerUser(registrationData: IRegistrationData): Promise<AuthBehaviorResult>;
  logoutUser(): Promise<AuthBehaviorResult>;

  // Session & Token Management Behaviors
  validateSession(): Promise<boolean>;
  refreshSession(): Promise<AuthBehaviorResult>;
  isSessionValid(): boolean;
  getSessionDuration(): number; // in minutes

  // User Profile & Identity Behaviors
  getCurrentUser(): Promise<IUser | null>;
  getUserProfile(userId?: string): Promise<IUser | null>;
  updateUserProfile(updates: Partial<IUser>): Promise<AuthBehaviorResult>;

  // Password Management Behaviors
  requestPasswordReset(email: string): Promise<AuthBehaviorResult>;
  resetPassword(resetData: IPasswordResetData): Promise<AuthBehaviorResult>;
  changePassword(currentPassword: string, newPassword: string): Promise<AuthBehaviorResult>;

  // Service Health
  isServiceHealthy(): Promise<boolean>;
}

/**
 * Role-Based Access Control Service Contract
 *
 * Educational platform specific role and permission behaviors.
 */
export interface IRoleBasedAccessService {
  // Role Management Behaviors
  getUserRole(userId?: string): UserRoleEnum;
  hasRole(role: UserRoleEnum, userId?: string): boolean;
  canAssignRole(targetRole: UserRoleEnum, assignerUserId?: string): boolean;

  // Permission Behaviors
  hasPermission(permission: string, userId?: string): boolean;
  getPermissions(userId?: string): string[];
  canAccessResource(resourceType: string, resourceId: string | number, userId?: string): Promise<AccessBehaviorResult>;

  // Educational Platform Specific Access
  canAccessCourse(courseId: string | number, userId?: string): Promise<AccessBehaviorResult>;
  canModifyCourse(courseId: string | number, userId?: string): Promise<AccessBehaviorResult>;
  canGradeStudents(courseId: string | number, userId?: string): Promise<AccessBehaviorResult>;
  canManageEnrollments(courseId: string | number, userId?: string): Promise<AccessBehaviorResult>;

  // Administrative Access
  canAccessAdminPanel(userId?: string): Promise<AccessBehaviorResult>;
  canManageUsers(userId?: string): Promise<AccessBehaviorResult>;
  canViewAnalytics(scope: 'course' | 'institution' | 'global', userId?: string): Promise<AccessBehaviorResult>;
}

/**
 * Authentication Navigation Service Contract
 *
 * Handles role-based navigation and routing behaviors.
 */
export interface IAuthNavigationService {
  // Navigation Decision Behaviors
  determinePostLoginDestination(user: IUser): NavigationBehaviorResult;
  validateAccessToPath(path: string, user?: IUser): AccessBehaviorResult;
  getDefaultPathForRole(role: UserRoleEnum): string;

  // Route Protection Behaviors
  requiresAuthentication(path: string): boolean;
  requiresRole(path: string): UserRoleEnum | null;
  getRedirectPath(user: IUser | null, intendedPath: string): string;

  // Educational Platform Navigation
  getStudentDashboardPath(): string;
  getInstructorDashboardPath(): string;
  getAdminDashboardPath(): string;
  getLoginPath(): string;
  getRegisterPath(): string;
}

/**
 * Combined Authentication Service Interface
 *
 * Aggregates all authentication-related behaviors for comprehensive testing.
 */
export interface ICompleteAuthService extends IAuthService, IRoleBasedAccessService, IAuthNavigationService {
  // Authentication State Behaviors
  getAuthenticationState(): {
    isAuthenticated: boolean;
    user: IUser | null;
    role: UserRoleEnum;
    isLoading: boolean;
    error: string | null;
  };

  // Authentication Events
  onAuthenticationChange(callback: (state: { isAuthenticated: boolean; user: IUser | null }) => void): void;
  onRoleChange(callback: (role: UserRoleEnum) => void): void;
  onError(callback: (error: string) => void): void;
}

/**
 * Authentication Behavior Test Specification
 *
 * Defines expected behaviors for authentication workflows in educational context.
 */
export interface IAuthBehaviorTestSpec {
  name: string;
  description: string;
  userRole: UserRoleEnum;
  scenario: 'login' | 'register' | 'logout' | 'access_control' | 'navigation' | 'password_reset';
  steps: {
    action: string;
    expectedBehavior: AuthBehaviorResult | AccessBehaviorResult | NavigationBehaviorResult;
    userVisible: boolean; // Whether the behavior is visible to the user
    preconditions?: string[];
    postconditions?: string[];
  }[];
  educationalContext: {
    courseAccess?: string[];
    administrativeAccess?: boolean;
    studentGroups?: string[];
    institutionRole?: string;
  };
}

/**
 * Authentication Service Contract Validator
 *
 * Validates authentication service implementations against behavioral contracts.
 */
export interface IAuthServiceContractValidator {
  validateAuthServiceContract(service: IAuthService): Promise<boolean>;
  validateRoleAccessContract(service: IRoleBasedAccessService): Promise<boolean>;
  validateNavigationContract(service: IAuthNavigationService): Promise<boolean>;
  validateCompleteAuthContract(service: ICompleteAuthService): Promise<boolean>;

  getAuthValidationReport(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    contractsCovered: string[];
    roleTestResults: Record<UserRoleEnum, boolean>;
    navigationTestResults: Record<string, boolean>;
  };
}

/**
 * Educational Platform Authentication Constants
 */
export const EDUCATIONAL_PERMISSIONS = {
  // Course Management
  CREATE_COURSE: 'course:create',
  EDIT_COURSE: 'course:edit',
  DELETE_COURSE: 'course:delete',
  VIEW_COURSE: 'course:view',

  // Student Management
  ENROLL_STUDENTS: 'student:enroll',
  VIEW_STUDENT_PROGRESS: 'student:progress:view',
  GRADE_STUDENTS: 'student:grade',

  // Task Management
  CREATE_TASK: 'task:create',
  EDIT_TASK: 'task:edit',
  DELETE_TASK: 'task:delete',
  SUBMIT_TASK: 'task:submit',

  // Administrative
  MANAGE_USERS: 'admin:users',
  VIEW_ANALYTICS: 'admin:analytics',
  SYSTEM_CONFIG: 'admin:config',
} as const;

export type EducationalPermission = typeof EDUCATIONAL_PERMISSIONS[keyof typeof EDUCATIONAL_PERMISSIONS];