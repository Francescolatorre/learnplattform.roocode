// src/routes/routeConfig.ts
export const ROUTES = {
  // Public routes
  HOME: '/',
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:courseId',

  // Student routes
  STUDENT_TASKS: '/courses/:courseId/tasks',

  // Instructor routes
  INSTRUCTOR_DASHBOARD: '/instructor',
  INSTRUCTOR_COURSE_EDIT: '/instructor/courses/:courseId/edit',

  // Admin routes
  ADMIN_COURSES: '/admin/courses',
  ADMIN_COURSE_EDIT: '/admin/courses/:courseId/edit',

  // Shared routes
  TASKS: '/tasks',
  COURSE_DETAILS: '/courses/:courseId/details',
};
