import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import MainNavigation from './MainNavigation';

test('renders Instructor Views menu entry for instructors', () => {
  // Mock localStorage to return 'instructor' for user_role
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(key => {
    if (key === 'user_role') return 'instructor';
    return null;
  });

  render(
    <MemoryRouter>
      <MainNavigation />
    </MemoryRouter>
  );

  // Check if the Instructor Views menu entry is present
  const instructorMenuEntry = screen.getByText(/Instructor Views/i);
  expect(instructorMenuEntry).toBeInTheDocument();
});

test('does not render Instructor Views menu entry for non-instructors', () => {
  // Mock localStorage to return 'student' for user_role
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(key => {
    if (key === 'user_role') return 'student';
    return null;
  });

  render(
    <MemoryRouter>
      <MainNavigation />
    </MemoryRouter>
  );

  // Check if the Instructor Views menu entry is not present
  const instructorMenuEntry = screen.queryByText(/Instructor Views/i);
  expect(instructorMenuEntry).not.toBeInTheDocument();
});
