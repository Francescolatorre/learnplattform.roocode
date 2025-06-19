import { renderWithProviders, screen, fireEvent } from '@/test-utils/renderWithProviders';
import CourseCard from './CourseCard';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { createCourse } from '@/test-utils/factories/courseFactory';

// Mock react-router-dom's useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('CourseCard Component', () => {
  mockCourse = createCourse();

  beforeEach(() => {
    mockedNavigate.mockClear();
  });
  it('renders the course card with title and description', () => {
    renderWithProviders(<CourseCard course={mockCourse} isInstructorView={false} />);

    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('This is a test course description')).toBeInTheDocument();
  });

  it('handles missing image by showing placeholder', () => {
    const courseWithoutImage = { ...mockCourse, image_url: null };
    renderWithProviders(<CourseCard course={courseWithoutImage} />);

    expect(screen.getByText('No image available')).toBeInTheDocument();
  });

  it('handles null description by showing default text', () => {
    const courseWithoutDescription = { ...mockCourse, description: null };
    renderWithProviders(
      <BrowserRouter>
        <CourseCard course={courseWithoutDescription} />
      </BrowserRouter>
    );

    expect(screen.getByText('No description available')).toBeInTheDocument();
  });

  it('truncates long descriptions', () => {
    const longDesc = 'A'.repeat(150); // Creates a string longer than 120 chars
    const courseWithLongDesc = { ...mockCourse, description: longDesc };

    renderWithProviders(
      <BrowserRouter>
        <CourseCard course={courseWithLongDesc} />
      </BrowserRouter>
    );

    // Should truncate to 120 chars + '...'
    expect(screen.getByText(`${'A'.repeat(120)}...`)).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    const { container } = renderWithProviders(
      <BrowserRouter>
        <CourseCard course={mockCourse} isLoading={true} />
      </BrowserRouter>
    );

    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('navigates to course page when View Course button is clicked', () => {
    renderWithProviders(
      <BrowserRouter>
        <CourseCard course={mockCourse} />
      </BrowserRouter>
    );

    const viewButton = screen.getByText('View Course');
    fireEvent.click(viewButton);

    expect(mockedNavigate).toHaveBeenCalledWith('/courses/1');
  });

  it('shows Continue Learning button for enrolled courses', () => {
    const enrolledCourse = { ...mockCourse, isEnrolled: true };
    renderWithProviders(
      <BrowserRouter>
        <CourseCard course={enrolledCourse} />
      </BrowserRouter>
    );

    expect(screen.getByText('Continue Learning')).toBeInTheDocument();
  });

  it('shows instructor actions when isInstructorView is true', () => {
    renderWithProviders(
      <BrowserRouter>
        <CourseCard course={mockCourse} isInstructorView={true} />
      </BrowserRouter>
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
  });
});
