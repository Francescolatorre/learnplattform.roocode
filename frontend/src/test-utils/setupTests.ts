import '@testing-library/jest-dom';
import {vi} from 'vitest';

// Clear mocks and localStorage before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Mock `@services/auth/authService` globally
vi.mock('@/services/auth/authService', () => ({
  login: vi.fn().mockResolvedValue({
    access: 'mockAccessToken',
    refresh: 'mockRefreshToken',
  }),
  // ...other mocks...
}));

// Mock `react-router-dom` globally
const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: mockedUsedNavigate,
  };
});

export {mockedUsedNavigate};

// Mock `apiService` globally
const mockedApiService = {
  getCourses: vi.fn(async () => {
    console.log('Mocked getCourses called'); // Debug log
    return [
      {id: 1, title: 'Course 1', description: 'Description 1'},
      {id: 2, title: 'Course 2', description: 'Description 2'},
    ];
  }),
  getCourseDetails: vi.fn(),
  getDashboard: vi.fn(),
  getUserProfile: vi.fn(),
  getQuiz: vi.fn(),
  submitQuiz: vi.fn(),
};
vi.mock('@/services/api/apiService', () => {
  return {
    default: mockedApiService,
  };
});

// Export the mocked `mockedApiService` for use in tests
export {mockedApiService};
