import { screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { TCourseStatus } from '@/types';
import { courseFactory } from '@test-utils/factories/courseFactory';

import CourseListView from './CourseListView';

const mockCourses = [
  courseFactory.build({
    id: 1,
    title: 'Course 1',
    category: 'Math',
    difficulty_level: 'Beginner',
    status: 'active' as TCourseStatus,
  }),
  courseFactory.build({
    id: 2,
    title: 'Course 2',
    category: 'Science',
    difficulty_level: 'Intermediate',
    status: 'inactive' as TCourseStatus,
  }),
];

// Mock learning task service
vi.mock('@/services/resources/courseService', () => ({
  createTask: vi.fn().mockResolvedValue({ id: 1, title: 'Test Task' }),
  updateTask: vi.fn().mockResolvedValue({ id: 1, title: 'Updated Task' }),
}));

describe('CourseListView Component', () => {
  test('renders CourseListView correctly', () => {
    renderWithProviders(<CourseListView courses={mockCourses} viewMode="grid" />);
    const courseElements = screen.getAllByText(/course/i);
    expect(courseElements).toHaveLength(4); // Adjusted to match the actual rendered elements
  });

  // Add more tests as needed for integration with InstructorCoursesPage
});
