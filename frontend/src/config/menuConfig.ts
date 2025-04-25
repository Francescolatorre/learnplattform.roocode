import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  AccountCircle as AccountCircleIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';

/**
 * Application menu configuration
 * Defines menu items with text, path, roles, and icons
 */
export const menuConfig = [
  {
    text: 'Dashboard',
    path: '/dashboard',
    roles: ['student'],
    icon: DashboardIcon,
    description: 'View your personalized dashboard'
  },
  {
    text: 'Courses',
    path: '/courses',
    roles: ['student'],
    icon: SchoolIcon,
    description: 'Browse available courses'
  },
  {
    text: 'My Submissions',
    path: '/my-submission',
    roles: ['student'],
    icon: AssignmentIcon,
    description: 'View your submitted assignments'
  },
  {
    text: 'Instructor Dashboard',
    path: '/instructor/dashboard',
    roles: ['instructor'],
    icon: DashboardIcon,
    description: 'Instructor-specific dashboard'
  },
  {
    text: 'Manage Courses',
    path: '/instructor/courses',
    roles: ['instructor', 'admin'],
    icon: SchoolIcon,
    description: 'Create and manage courses'
  },
  // Admin-specific routes
  {
    text: 'Admin Dashboard',
    path: '/admin/dashboard',
    roles: ['admin'],
    icon: AdminPanelSettingsIcon,
    description: 'Administrative overview dashboard'
  },
  {
    text: 'User Management',
    path: '/admin/users',
    roles: ['admin'],
    icon: PeopleIcon,
    description: 'Manage users and permissions'
  },
  {
    text: 'Platform Analytics',
    path: '/admin/analytics',
    roles: ['admin'],
    icon: AnalyticsIcon,
    description: 'View platform-wide analytics'
  },
  {
    text: 'System Settings',
    path: '/admin/settings',
    roles: ['admin'],
    icon: SettingsIcon,
    description: 'Configure platform settings'
  },
  {
    text: 'Profile',
    path: '/profile',
    roles: ['admin', 'instructor', 'student'],
    icon: AccountCircleIcon,
    description: 'Manage your profile'
  }
];
