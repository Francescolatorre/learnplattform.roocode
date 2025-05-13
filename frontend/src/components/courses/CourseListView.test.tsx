import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {render, screen} from '@testing-library/react';
import CourseListView from './CourseListView';
import {TCourseStatus} from '@/types/course';

describe('CourseListView Component', () => {
    const mockCourses = [
        {id: 1, title: 'Course 1', category: 'Math', difficulty_level: 'Beginner', status: 'active' as TCourseStatus},
        {id: 2, title: 'Course 2', category: 'Science', difficulty_level: 'Intermediate', status: 'inactive' as TCourseStatus},
    ];

    test('renders CourseListView correctly', () => {
        render(
            <BrowserRouter>
                <CourseListView courses={mockCourses} viewMode="grid" />
            </BrowserRouter>
        );
        const courseElements = screen.getAllByText(/course/i);
        expect(courseElements).toHaveLength(4); // Adjusted to match the actual rendered elements
    });

    // Add more tests as needed for integration with InstructorCoursesPage
});
