import {vi} from 'vitest';

export const mockApiService = {
    get: vi.fn((endpoint) => {
        if (endpoint.includes('student/progress')) {
            return Promise.resolve([]); // Expected to return an empty array
        }
        if (endpoint.includes('courses/studentProgress')) {
            return Promise.resolve({count: 0, next: null, previous: null, results: []}); // Adjusted to return an empty result
        }
        if (endpoint.includes('quizzes/attemptsList')) {
            return Promise.resolve([]); // Expected to return an empty array
        }
        return Promise.reject(new Error('Not Found'));
    }),
    post: vi.fn(() => Promise.resolve(null)),
    put: vi.fn(() => Promise.resolve(null)),
    delete: vi.fn(() => Promise.resolve(null)),
};
