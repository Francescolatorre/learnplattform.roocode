import { render, screen } from '@testing-library/react';
// import React from 'react'; // Not needed in React 17+

import { TCourseStatus } from '@/types/course';

import StatsSummary from './StatsSummary';

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
    render(<StatsSummary courses={mockCourses} totalCourses={mockCourses.length} totalStudents={50} publishedCourses={2} tasksNeedingAttention={3} />);
    const summaryElement = screen.getByText(/total courses/i);
    expect(summaryElement).toBeInTheDocument();
  });

  // Add more tests as needed for integration with InstructorCoursesPage
});
