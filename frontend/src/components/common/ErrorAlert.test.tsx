import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorAlert from './ErrorAlert';

describe('ErrorAlert Component', () => {
  test('renders ErrorAlert correctly when error is present', () => {
    const error = new Error('Test error message');
    render(<ErrorAlert error={error} />);
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveTextContent('Test error message');
  });

  test('does not render ErrorAlert when error is absent', () => {
    render(<ErrorAlert error={null} />);
    const alertElement = screen.queryByRole('alert');
    expect(alertElement).not.toBeInTheDocument();
  });

  // Add more tests as needed for integration with InstructorCoursesPage
});
