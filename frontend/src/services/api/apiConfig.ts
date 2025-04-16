const API_BASE_URL = 'http://localhost:8000';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  endpoints: {
    courses: {
      list: '/api/v1/courses/',
      create: '/api/v1/courses/',
      details: (courseId: string): string => `/api/v1/courses/${courseId}/`,
      update: (courseId: string): string => `/api/v1/courses/${courseId}/`,
      delete: (courseId: string): string => `/api/v1/courses/${courseId}/`,
      enroll: (courseId: string): string => `/api/v1/courses/${courseId}/enroll/`,
      unenroll: (courseId: string): string => `/api/v1/courses/${courseId}/unenroll/`,
      instructorCourses: '/api/v1/instructor/courses/',
      updateStatus: (courseId: string): string => `/api/v1/courses/${courseId}/status/`,
      progress: (courseId: string): string => `/api/v1/courses/${courseId}/progress/`,
      tasks: (courseId: string): string => `/api/v1/courses/${courseId}/tasks/`,
    },
  },
  enrollments: {
    list: '/api/v1/enrollments',
    details: (enrollmentId: string | number): string => `/api/v1/enrollments/${enrollmentId}`,
    create: '/api/v1/enrollments',
    update: (enrollmentId: string | number): string => `/api/v1/enrollments/${enrollmentId}`,
    delete: (enrollmentId: string | number): string => `/api/v1/enrollments/${enrollmentId}`,
    userEnrollments: '/api/v1/course-enrollments/',
    enroll: '/api/v1/course-enrollments/',
    unenroll: (enrollmentId: string | number): string => `/api/v1/course-enrollments/${enrollmentId}/`,
    byCourse: (courseId: string | number): string => `/api/v1/course-enrollments/?course=${courseId}`,
  },
};
