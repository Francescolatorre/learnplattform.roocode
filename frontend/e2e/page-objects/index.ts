// Export all page objects for easy importing in tests

import { CourseCreationPage } from './courses/CourseCreationPage';
import { CourseDetailPage } from './courses/CourseDetailPage';
import { InstructorCoursesPage, StudentCoursesPage } from './courses';
import { AdminDashboardPage, InstructorDashboardPage, StudentDashboardPage } from './DashboardPage';
import { LoginPage } from './LoginPage';
import { MarkdownEditorPage } from './MarkdownEditorPage';

// Base page object
export { BasePage } from './BasePage';

// Authentication & user management page objects
export { LoginPage } from './LoginPage';

// Dashboard page objects
export { StudentDashboardPage, InstructorDashboardPage, AdminDashboardPage } from './DashboardPage';

// Course management page objects
export { StudentCoursesPage, InstructorCoursesPage } from './courses';
export { CourseCreationPage } from './courses/CourseCreationPage';
export { CourseDetailPage } from './courses/CourseDetailPage';

// Component page objects
export { MarkdownEditorPage } from './MarkdownEditorPage';

/**
 * Helper function to create all needed page objects for a user role
 */
export function createPageObjectsForRole(
  page: any,
  role: 'student' | 'instructor' | 'admin' = 'student'
) {
  // Common page objects
  const loginPage = new LoginPage(page);
  const markdownEditor = new MarkdownEditorPage(page);
  const courseDetailPage = new CourseDetailPage(page);

  // Role-specific page objects
  if (role === 'instructor') {
    return {
      loginPage,
      dashboardPage: new InstructorDashboardPage(page),
      coursesPage: new InstructorCoursesPage(page),
      courseCreationPage: new CourseCreationPage(page),
      courseDetailPage,
      markdownEditor,
    };
  } else if (role === 'admin') {
    return {
      loginPage,
      dashboardPage: new AdminDashboardPage(page),
      courseDetailPage,
      markdownEditor,
    };
  } else {
    // Default to student role
    return {
      loginPage,
      dashboardPage: new StudentDashboardPage(page),
      coursesPage: new StudentCoursesPage(page),
      courseDetailPage,
      markdownEditor,
    };
  }
}
