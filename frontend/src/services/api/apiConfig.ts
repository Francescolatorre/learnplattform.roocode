let API_BASE_URL = 'http://localhost:8000'; // Change const to let for mutability
export const setApiBaseUrl = (url: string) => {
  API_BASE_URL = url; // Update the base URL
  API_CONFIG.baseURL = API_BASE_URL; // Update the API_CONFIG
};

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  endpoints: {
    auth: {
      login: '/auth/login/',
      register: '/auth/register/',
      logout: '/auth/logout/',
      refreshToken: '/auth/token/refresh/',
      validateToken: '/auth/validate-token/',
    },
    users: {
      list: '/api/v1/users/',
      details: (userId: string | number): string => `/api/v1/users/${userId}/`,
      create: '/api/v1/users/',
      update: (userId: string | number): string => `/api/v1/users/${userId}/`,
      delete: (userId: string | number): string => `/api/v1/users/${userId}/`,
      profile: '/users/profile/',
    },
    courses: {
      list: '/api/v1/courses/',
      create: '/api/v1/courses/', // Ensure this has a trailing slash
      details: (courseId: string | number): string => `/api/v1/courses/${courseId}/`,
      update: (courseId: string | number): string => `/api/v1/courses/${courseId}/`,
      delete: (courseId: string | number): string => `/api/v1/courses/${courseId}/`,
      enroll: (courseId: string | number): string => `/api/v1/courses/${courseId}/enroll/`,
      unenroll: (courseId: string | number): string => `/api/v1/courses/${courseId}/unenroll/`, // Added
      updateStatus: (courseId: string | number): string => `/api/v1/courses/${courseId}/status/`, // Added
      progress: (courseId: string | number): string => `/api/v1/courses/${courseId}/progress/`, // Added
      instructorCourses: '/api/v1/courses/instructor/courses/', // Fixed to match backend URL format
      courseDetails: (courseId: string | number): string => `/api/v1/courses/${courseId}/details/`,
      studentProgress: (courseId: string | number): string => `/api/v1/courses/${courseId}/student-progress/`,
      studentProgressDetail: (courseId: string | number, userId: string | number): string =>
        `/api/v1/courses/${courseId}/student-progress/${userId}/`,
      analytics: (courseId: string | number): string => `/api/v1/courses/${courseId}/analytics/`,
      taskAnalytics: (courseId: string | number): string => `/api/v1/courses/${courseId}/task-analytics/`,
      // Corrected based on Swagger - this should use the tasks endpoint, not a course subpath
      tasks: (courseId: string | number): string => `/api/v1/tasks/course/${courseId}/`,
    },
    courseVersions: {
      list: '/api/v1/course-versions/',
      create: '/api/v1/course-versions/',
      details: (versionId: string | number): string => `/api/v1/course-versions/${versionId}/`,
      update: (versionId: string | number): string => `/api/v1/course-versions/${versionId}/`,
      delete: (versionId: string | number): string => `/api/v1/course-versions/${versionId}/`,
    },
    tasks: {
      list: '/api/v1/tasks/',
      create: '/api/v1/tasks/',
      details: (taskId: string | number): string => `/api/v1/tasks/${taskId}/`,
      update: (taskId: string | number): string => `/api/v1/tasks/${taskId}/`,
      delete: (taskId: string | number): string => `/api/v1/tasks/${taskId}/`,
      byCourse: (courseId: string | number): string => `/api/v1/tasks/course/${courseId}/`,
      // Legacy endpoint references for backward compatibility
      legacyList: '/api/v1/learning-tasks/',
      legacyCreate: '/api/v1/learning-tasks/',
      legacyDetails: (taskId: string | number): string => `/api/v1/learning-tasks/${taskId}/`,
      legacyUpdate: (taskId: string | number): string => `/api/v1/learning-tasks/${taskId}/`,
      legacyDelete: (taskId: string | number): string => `/api/v1/learning-tasks/${taskId}/`,
      legacyByCourse: (courseId: string | number): string => `/api/v1/learning-tasks/course/${courseId}/`,
    },
    enrollments: {
      list: '/api/v1/enrollments/',
      byCourse: (courseId: string | number): string =>
        `${API_CONFIG.endpoints.enrollments.list}?course=${courseId}`,
      details: (enrollmentId: string | number): string => `/api/v1/enrollments/${enrollmentId}/`,
      create: '/api/v1/enrollments/',
      update: (enrollmentId: string | number): string => `/api/v1/enrollments/${enrollmentId}/`,
      delete: (enrollmentId: string | number): string => `/api/v1/enrollments/${enrollmentId}/`,
      updateStatus: (enrollmentId: string | number): string => `/api/v1/enrollments/${enrollmentId}/update_status/`,
      // Legacy endpoints
      legacyList: '/api/v1/course-enrollments/',
      legacyDetails: (enrollmentId: string | number): string => `/api/v1/course-enrollments/${enrollmentId}/`,
      legacyCreate: '/api/v1/course-enrollments/',
      legacyUpdate: (enrollmentId: string | number): string => `/api/v1/course-enrollments/${enrollmentId}/`,
      legacyDelete: (enrollmentId: string | number): string => `/api/v1/course-enrollments/${enrollmentId}/`,
    },
    taskProgress: {
      list: '/api/v1/task-progress/',
      create: '/api/v1/task-progress/',
      details: (progressId: string | number): string => `/api/v1/task-progress/${progressId}/`,
      update: (progressId: string | number): string => `/api/v1/task-progress/${progressId}/`,
      delete: (progressId: string | number): string => `/api/v1/task-progress/${progressId}/`,
      updateStatus: (progressId: string | number): string => `/api/v1/task-progress/${progressId}/update_status/`,
    },
    student: {
      progress: (studentId: string | number): string => `/api/v1/students/${studentId}/progress/`,
      quizPerformance: (studentId: string | number): string => `/api/v1/students/${studentId}/quiz-performance/`,
    },
    quizzes: {
      // Quiz tasks
      tasksList: '/api/v1/quiz-tasks/',
      taskCreate: '/api/v1/quiz-tasks/',
      taskDetails: (taskId: string | number): string => `/api/v1/quiz-tasks/${taskId}/`,
      taskUpdate: (taskId: string | number): string => `/api/v1/quiz-tasks/${taskId}/`,
      taskDelete: (taskId: string | number): string => `/api/v1/quiz-tasks/${taskId}/`,

      // Quiz questions
      questionsList: '/api/v1/quiz-questions/',
      questionCreate: '/api/v1/quiz-questions/',
      questionDetails: (questionId: string | number): string => `/api/v1/quiz-questions/${questionId}/`,
      questionUpdate: (questionId: string | number): string => `/api/v1/quiz-questions/${questionId}/`,
      questionDelete: (questionId: string | number): string => `/api/v1/quiz-questions/${questionId}/`,

      // Quiz options
      optionsList: '/api/v1/quiz-options/',
      optionCreate: '/api/v1/quiz-options/',
      optionDetails: (optionId: string | number): string => `/api/v1/quiz-options/${optionId}/`,
      optionUpdate: (optionId: string | number): string => `/api/v1/quiz-options/${optionId}/`,
      optionDelete: (optionId: string | number): string => `/api/v1/quiz-options/${optionId}/`,

      // Quiz attempts
      attemptsList: '/api/v1/quiz-attempts/',
      attemptCreate: '/api/v1/quiz-attempts/',
      attemptDetails: (attemptId: string | number): string => `/api/v1/quiz-attempts/${attemptId}/`,
      attemptUpdate: (attemptId: string | number): string => `/api/v1/quiz-attempts/${attemptId}/`,
      attemptDelete: (attemptId: string | number): string => `/api/v1/quiz-attempts/${attemptId}/`,
      attemptResponses: (attemptId: string | number): string => `/api/v1/quiz-attempts/${attemptId}/responses/`,
      submitResponses: (attemptId: string | number): string => `/api/v1/quiz-attempts/${attemptId}/submit_responses/`,
    },
    dashboard: {
      admin: '/api/v1/admin/dashboard/',
      adminSummary: '/api/v1/dashboard/admin-summary/',
      instructor: '/api/v1/instructor/dashboard/',
      student: (studentId: string | number): string => `/api/v1/students/${studentId}/dashboard/`,
    },
    health: {
      check: '/health/',
    },
  },
};
