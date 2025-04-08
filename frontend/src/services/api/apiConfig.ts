export const API_CONFIG = {
  baseURL: 'http://localhost:8000',
  version: 'api/v1',
  endpoints: {
    courses: {
      list: '/courses/',
      details: (id: string) => `/courses/${id}/`,
      enroll: (id: string) => `/courses/${id}/enroll/`,
      tasks: (id: string) => `/tasks/course/${id}/`,  // Update to match backend URL pattern
      instructorCourses: '/instructor/courses/',
      create: '/courses/',
      update: (id: string) => `/courses/${id}/`,
      updateStatus: (id: string) => `/api/courses/${id}/status/`, // Added this line
      unenroll: (id: string) => `/courses/${id}/unenroll/`,
      delete: (id: string) => `/courses/${id}/`,
    },
    tasks: {
      list: '/learning-tasks/',
      details: (id: string) => `/learning-tasks/${id}/`
    },
    progress: {
      student: (id: string) => `/students/${id}/progress/`,
      course: (courseId: string, studentId: string) =>
        `/courses/${courseId}/student-progress/${studentId}/`
    }
  }
};
