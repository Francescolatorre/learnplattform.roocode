import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {render, screen} from '@testing-library/react';
import PageHeader from './PageHeader';

describe('PageHeader Component', () => {
    test('renders PageHeader correctly', () => {
        render(
            <BrowserRouter>
                <PageHeader />
            </BrowserRouter>
        );
        const headerElement = screen.getByRole('heading', {name: /Manage Courses/i});
        expect(headerElement).toBeInTheDocument();
    });

    // Add more tests as needed for integration with InstructorCoursesPage
});
