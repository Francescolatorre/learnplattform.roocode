const API_BASE_URL = 'YOUR_API_BASE_URL';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  endpoints: {
    courses: {
      list: '/courses',
      create: '/courses',
      details: (courseId: string) => `/courses/${courseId}`,
      update: (courseId: string) => `/courses/${courseId}`,
      delete: (courseId: string) => `/courses/${courseId}`,
      enroll: (courseId: string) => `/courses/${courseId}/enroll`,
      unenroll: (courseId: string) => `/courses/${courseId}/unenroll`,
      instructorCourses: '/instructor/courses',
      updateStatus: (courseId: string) => `/courses/${courseId}/status`,
      progress: (courseId: string) => `/courses/${courseId}/progress`,
      tasks: (courseId: string) => `/courses/${courseId}/tasks`,
    },
  },
};
