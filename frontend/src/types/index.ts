/**
 * Central type definitions export file
 * Re-exports all type definitions from specific domain files
 * for easier importing throughout the application
 */

// Re-export all types from their respective files
export type { UserRoleEnum, IUser, IAuthState, IRegisterRequest } from './userTypes';
export type { TUserRole } from '../context/auth/types';
export type {
  TCourseStatus,
  ICourseVersion,
  ICourse,
  ICourseStructure,
  ICourseCreationData,
} from './course';
export type {
  TTaskStatus,
  ILearningTask,
  ITaskCreationData,
  IBaseTaskProgress,
  ITaskProgress,
  ITaskProgressUpdateData,
  ITaskSubmissionData,
  IQuizHistory,
  ITaskProgressBase,
} from './Task';
export type {
  TCompletionStatus,
  TQuizCompletionStatus,
  ICourseEnrollment,
  IQuizOption,
  IQuizQuestion,
  IQuizTask,
  IQuizResponse,
  IQuizAttempt,
} from './entities';
export type {
  IGradingData,
  IProgressAnalytics,
  IStudentProgressSummary,
  IInstructorDashboardData,
  ICourseStructureAnalytics,
  IProgressChartData,
  ITaskEffectivenessData,
  IAdminDashboardSummary,
} from './gradingTypes';
export type {
  IActivityEntry,
  IDetailedCourseProgress,
  ICourseProgressSummary,
  ICourseProgressResponse,
  IDashboardUserInfo,
  IDashboardOverallStats,
  IDashboardCourseInfo,
  IDashboardResponse,
  IProgressResponse,
  IUserProgressDetails,
  ICourseProgress,
  IUserProgress,
} from './progress';
export type { IPaginatedResponse } from './paginatedResponse';
export type {
  ILoginRequest,
  ILoginResponse,
  ITokenRefreshResponse,
  ITokenRefresh,
  ICustomTokenObtainPair,
  IRegister,
} from './authTypes';
