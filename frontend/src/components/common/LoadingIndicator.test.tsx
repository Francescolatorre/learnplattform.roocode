import { render, screen } from '@testing-library/react';
import React from 'react';

import LoadingIndicator from './LoadingIndicator';

describe('LoadingIndicator Component', () => {
  test('renders LoadingIndicator correctly', () => {
    render(<LoadingIndicator />);
    const loadingElement = screen.getByRole('progressbar');
    expect(loadingElement).toBeInTheDocument();
  });

  // Add more tests as needed for integration with InstructorCoursesPage
});
