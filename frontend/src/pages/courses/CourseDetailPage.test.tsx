import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { ICourse } from '@/types/course';
import { modernCourseService } from '@/services/resources/modernCourseService';

import CourseDetailPage from './CourseDetailPage';

// Mock the modern course service
vi.mock('@/services/resources/modernCourseService', () => ({
  modernCourseService: {
    getCourseDetails: vi.fn(),
  },
}));

// Mock react-router-dom's useParams
vi.mock('react-router-dom', () => ({
  useParams: vi.fn(() => ({ id: '1' })),
}));

const mockCourse: ICourse = {
  id: 1,
  title: 'Test Course',
  description: 'This is a test course description',
  instructor_name: 'John Doe',
  visibility: 'public',
  created_at: '2025-01-15T10:00:00Z',
  learning_objectives: 'Learn testing and modern development',
  prerequisites: 'Basic JavaScript knowledge',
  status: 'published',
};

const renderWithProviders = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <CourseDetailPage />
    </QueryClientProvider>
  );
};

describe('CourseDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays course details when data loads successfully', async () => {
    vi.mocked(modernCourseService.getCourseDetails).mockResolvedValue(mockCourse);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    expect(screen.getByText('This is a test course description')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Learn testing and modern development')).toBeInTheDocument();
  });

  it('calls modernCourseService.getCourseDetails with correct ID', async () => {
    vi.mocked(modernCourseService.getCourseDetails).mockResolvedValue(mockCourse);

    renderWithProviders();

    await waitFor(() => {
      expect(modernCourseService.getCourseDetails).toHaveBeenCalledWith(1);
    });
  });

  it('displays error message when course loading fails', async () => {
    const errorMessage = 'Failed to load course';
    vi.mocked(modernCourseService.getCourseDetails).mockRejectedValue(new Error(errorMessage));

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(`Error loading course details: ${errorMessage}`)).toBeInTheDocument();
    });
  });
});
