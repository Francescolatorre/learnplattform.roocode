import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import CourseList from '../components/CourseList';

import { mockedApiService, mockedUsedNavigate } from '../../../setupTests'; // Use global mocks

describe('CourseList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders course list', async () => {
    const mockCourses = [
      { id: 1, title: 'Course 1', description: 'Description 1' },
      { id: 2, title: 'Course 2', description: 'Description 2' },
    ];

    mockedApiService.getCourses.mockResolvedValue(mockCourses);

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <CourseList courses={[]} />,
        },
      ],
      { initialEntries: ['/'] }
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText(/Course 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Course 2/i)).toBeInTheDocument();
    });
  });

  it('navigates to course details on click', async () => {
    const mockCourses = [{ id: 1, title: 'Course 1', description: 'Description 1' }];

    mockedApiService.getCourses.mockResolvedValue(mockCourses);

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <CourseList courses={[]} />,
        },
      ],
      { initialEntries: ['/'] }
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText(/Course 1/i));
    });

    expect(mockedUsedNavigate).toHaveBeenCalledWith('/courses/1');
  });
});
