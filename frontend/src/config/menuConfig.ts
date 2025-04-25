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

import {TUserRole} from '@/types';

/**
 * Menuconfig structure for the navigation bar
 * Contains all menu items with their roles, paths, icons, and descriptions
 */
export interface IMenuItem {
  text: string;
  path: string;
  roles: TUserRole[];
  icon: any; // Using any for Material UI icons
  description: string;
}

/**
 * Application menu configuration
 * Defines menu items with text, path, roles, and icons
 */
export const menuConfig: IMenuItem[] = [
  // Student menu items
  {
    text: 'Dashboard',
    path: '/dashboard',
    roles: ['student', 'instructor', 'admin'],
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
    text: 'Tasks',
    path: '/tasks',
    roles: ['student'],
    icon: AssignmentIcon,
    description: 'View your assigned learning tasks'
  },

  // Instructor menu items
  {
    text: 'Instructor Dashboard',
    path: '/instructor/dashboard',
    roles: ['instructor', 'admin'],
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

  // Admin menu items
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
    text: 'Analytics',
    path: '/admin/analytics',
    roles: ['admin'],
    icon: AnalyticsIcon,
    description: 'View platform analytics'
  },
  {
    text: 'Settings',
    path: '/admin/settings',
    roles: ['admin'],
    icon: SettingsIcon,
    description: 'Configure platform settings'
  },

  // Common menu items
  {
    text: 'Profile',
    path: '/profile',
    roles: ['student', 'instructor', 'admin'],
    icon: AccountCircleIcon,
    description: 'Manage your profile'
  }
];

export default menuConfig;
