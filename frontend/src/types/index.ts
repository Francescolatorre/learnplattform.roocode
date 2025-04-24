// src/types/common/index.ts

export type {IUser, IUserDetails} from './user';

// Explizite Re-Exporte aus entities.ts für Basistypen
export type {
    TCompletionStatus,
    TQuizCompletionStatus,
    ICourseEnrollment,
    IQuizOption,
    IQuizQuestion,
    IQuizTask,
    IQuizResponse,
    IQuizAttempt,
    IUserProgress,

} from './entities';

export type {
    ICourse,
    ICourseVersion,
    ICourseStructure,
    TCourseStatus

} from './course';

// Explizite Re-Exporte aus tasks.ts
export type {
    ITaskProgress,
    ITaskCreationData,
    IQuizHistory,
    ITaskProgressUpdateData,
    ITaskSubmissionData,
    ILearningTask,
    IBaseTaskProgress,
    TTaskStatus,

} from './task';

// Explizite Re-Exporte aus progressTypes.ts
export type {
    IActivityEntry,
    IDetailedCourseProgress,
    ICourseProgressSummary,
    ICourseProgressResponse,
    IDashboardUserInfo,
    IDashboardOverallStats,
    IDashboardCourseInfo,
    IDashboardResponse
} from './progressTypes';

// Explizite Re-Exporte aus authTypes.ts
export type {
    ILoginResponse,
    ITokenRefreshResponse,
    ICustomTokenObtainPair,
    IRegister,
    ITokenRefresh,
} from './authTypes';

// Explizite Re-Exporte aus moduleTypes.ts
export type {
    IModuleProgress,
    IModuleData
} from './moduleTypes';

// Re-Export der paginierten Response
export type {
    IPaginatedResponse
} from './paginatedResponse';



export type {
    IGradingData,
    IProgressAnalytics
} from './gradingTypes';

/**
 * HINWEIS: Diese Datei dient als zentraler Export-Punkt für alle gemeinsamen Typen.
 * Verwenden Sie explizite Named Exports anstelle von Wildcard-Exporten,
 * um Namenskonflikte zu vermeiden.
 */
