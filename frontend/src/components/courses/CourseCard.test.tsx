import React from 'react';
import {screen, fireEvent} from '../tests/testUtils';
import {render} from '../tests/testUtils';
import CourseCard from './CourseCard';
import {describe, it, expect, vi} from 'vitest';

// Mock react-router-dom's useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Test course data
const mockCourse = {
  id: 1,
  title: 'Test Course',
  description: 'This is a test course description',
  image_url: 'https://example.com/image.jpg',
  isEnrolled: false,
  isCompleted: false,
  instructor_name: 'Test Instructor',
  status: 'published',
  visibility: 'public',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-02T12:00:00Z',
};

describe('CourseCard Component', () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
  });
  it('renders the course card with title and description', () => {
    render(<CourseCard course={mockCourse} isInstructorView={false} />);

    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('This is a test course description')).toBeInTheDocument();
  });

  it('handles missing image by showing placeholder', () => {
    const courseWithoutImage = {...mockCourse, image_url: null};
    render(
      <CourseCard course={courseWithoutImage} />
      </BrowserRouter >
    );

    expect(screen.getByText('No image available')).toBeInTheDocument();
  });

  it('handles null description by showing default text', () => {
    const courseWithoutDescription = {...mockCourse, description: null};
    render(
      <BrowserRouter>
        <CourseCard course={courseWithoutDescription} />
      </BrowserRouter>
    );

    expect(screen.getByText('No description available')).toBeInTheDocument();
  });

  it('truncates long descriptions', () => {
    const longDesc = 'A'.repeat(150); // Creates a string longer than 120 chars
    const courseWithLongDesc = {...mockCourse, description: longDesc};

    render(
      <BrowserRouter>
        <CourseCard course={courseWithLongDesc} />
      </BrowserRouter>
    );

    // Should truncate to 120 chars + '...'
    expect(screen.getByText(`${'A'.repeat(120)}...`)).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    const {container} = render(
      <BrowserRouter>
        <CourseCard course={mockCourse} isLoading={true} />
      </BrowserRouter>
    );

    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('navigates to course page when View Course button is clicked', () => {
    render(
      <BrowserRouter>
        <CourseCard course={mockCourse} />
      </BrowserRouter>
    );

    const viewButton = screen.getByText('View Course');
    fireEvent.click(viewButton);

    expect(mockedNavigate).toHaveBeenCalledWith('/courses/1');
  });

  it('shows Continue Learning button for enrolled courses', () => {
    const enrolledCourse = {...mockCourse, isEnrolled: true};
    render(
      <BrowserRouter>
        <CourseCard course={enrolledCourse} />
      </BrowserRouter>
    );

    expect(screen.getByText('Continue Learning')).toBeInTheDocument();
  });

  it('shows instructor actions when isInstructorView is true', () => {
    render(
      <BrowserRouter>
        <CourseCard course={mockCourse} isInstructorView={true} />
      </BrowserRouter>
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
  });
});
