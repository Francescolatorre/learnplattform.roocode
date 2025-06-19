import React from 'react';
import { render, screen } from '@testing-library/react';
import StatsSummary from './StatsSummary';
import { TCourseStatus } from '@/types/course';

describe('StatsSummary Component', () => {
  const mockCourses = [
    {
      id: 1,
      title: 'Course 1',
      category: 'Math',
      difficulty_level: 'Beginner',
      status: 'active' as TCourseStatus,
    },
    {
      id: 2,
      title: 'Course 2',
      category: 'Science',
      difficulty_level: 'Intermediate',
      status: 'inactive' as TCourseStatus,
    },
  ];

  test('renders StatsSummary correctly', () => {
    render(<StatsSummary courses={mockCourses} totalCourses={mockCourses.length} />);
    const summaryElement = screen.getByText(/total courses/i);
    expect(summaryElement).toBeInTheDocument();
  });

  // Add more tests as needed for integration with InstructorCoursesPage
});
