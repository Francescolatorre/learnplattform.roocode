export const menuConfig = [
  {
    text: 'Dashboard',
    path: '/dashboard',
    roles: ['admin', 'instructor', 'student'],
  },
  {
    text: 'Instructor Views',
    path: '/instructor',
    roles: ['admin', 'instructor'],
  },
  {
    text: 'Manage Courses',
    path: '/instructor/courses',
    roles: ['instructor', 'admin'], // Visible to instructors and admins
  },
  {
    text: 'My Submissions',
    path: '/my-submission',
    roles: ['student'],
  },
  {
    text: 'Courses',
    path: '/courses',
    roles: ['student'],
  },
  {
    text: 'Profile',
    path: '/profile',
    roles: ['admin', 'instructor', 'student'],
  },
  {
    text: 'Student Courses',
    path: '/courses',
    roles: ['student'],
  },
  {
    text: 'Instructor Dashboard',
    path: '/instructor/dashboard',
    roles: ['instructor', 'admin'],
  },
];
