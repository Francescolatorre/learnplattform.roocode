import { render, screen } from '@testing-library/react';
// import React from 'react'; // Not needed in React 17+
import { BrowserRouter } from 'react-router-dom';

import NoCoursesMessage from './NoCoursesMessage';

describe('NoCoursesMessage Component', () => {
  test('renders NoCoursesMessage correctly', () => {
    render(
      <BrowserRouter>
        <NoCoursesMessage />
      </BrowserRouter>
    );
    const messageElement = screen.getByText(/you haven't created any courses yet/i);
    expect(messageElement).toBeInTheDocument();
  });

  // Add more tests as needed for integration with InstructorCoursesPage
});
