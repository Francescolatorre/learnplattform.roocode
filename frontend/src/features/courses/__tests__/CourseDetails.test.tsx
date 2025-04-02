import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import CourseDetails from '../components/CourseDetails';
import React from 'react';
import { mockedApiService } from '../../../setupTests'; // Use global mocks

describe('CourseDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders course details', async () => {
    const mockCourse = {
      id: 1,
      title: 'Course 1',
      description: 'Detailed description of Course 1',
    };

    mockedApiService.getCourseDetails.mockResolvedValue(mockCourse);

    render(
      <BrowserRouter>
        <CourseDetails courseId={1} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Course 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Detailed description of Course 1/i)).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    mockedApiService.getCourseDetails.mockRejectedValue(
      new Error('Failed to fetch course details')
    );

    render(
      <BrowserRouter>
        <CourseDetails courseId={1} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch course details/i)).toBeInTheDocument();
    });
  });
});
