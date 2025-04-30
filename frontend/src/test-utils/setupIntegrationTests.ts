// src/test-utils/setupIntegrationTests.ts

// Centralized test user configuration
export const TEST_USERS = {
    lead_instructor: {
        username: 'instructor',
        password: 'instructor123',
        expectedRole: 'instructor',
    },
    admin: {
        username: 'admin',
        password: 'adminpassword',
        expectedRole: 'admin',
    },
    student: {
        username: 'student',
        password: 'student123',
        expectedRole: 'student',
    },
};

console.info('🌐 Integration test setup loaded (real API used)');

// Optional: setup logging, auth tokens, etc.
