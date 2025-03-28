import { test, expect } from '@playwright/test';

/**
 * Test user credentials
 */
const TEST_USERS = {
  admin: {
    username: 'admin',
    password: 'adminpassword',
  },
};

/**
 * Base API URL
 */
const API_URL = 'http://localhost:8000';

test.describe('Backend API Tests (no frontend)', () => {
  test('Health endpoint is accessible', async ({ request }) => {
    // Test the health endpoint
    const response = await request.get(`${API_URL}/health/`);

    console.log(`Health endpoint status: ${response.status()}`);
    console.log(`Response body: ${await response.text()}`);

    // Expect a successful response
    expect(response.ok()).toBeTruthy();

    // Parse the response as JSON
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('Login endpoint works', async ({ request }) => {
    // Test the login endpoint
    const response = await request.post(`${API_URL}/auth/login/`, {
      data: {
        username: TEST_USERS.admin.username,
        password: TEST_USERS.admin.password,
      },
    });

    console.log(`Login endpoint status: ${response.status()}`);

    // For security reasons, log only the response structure, not the actual tokens
    const data = await response.json();
    console.log('Response contains access token:', !!data.access);
    console.log('Response contains refresh token:', !!data.refresh);

    // Expect a successful response
    expect(response.ok()).toBeTruthy();

    // Verify token structure
    expect(data.access).toBeTruthy();
    expect(data.refresh).toBeTruthy();
  });

  test('Courses API requires authentication', async ({ request }) => {
    // Try to access courses without authentication
    const response = await request.get(`${API_URL}/api/v1/courses/`);

    console.log(`Unauthenticated courses request status: ${response.status()}`);
    console.log(`Response body: ${await response.text()}`);

    // Expect 401 Unauthorized
    expect(response.status()).toBe(401);
  });

  test('Can access courses with authentication', async ({ request }) => {
    // First login to get token
    const loginResponse = await request.post(`${API_URL}/auth/login/`, {
      data: {
        username: TEST_USERS.admin.username,
        password: TEST_USERS.admin.password,
      },
    });

    const loginData = await loginResponse.json();
    const token = loginData.access;

    // Now try to access courses with the token
    const coursesResponse = await request.get(`${API_URL}/api/v1/courses/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`Authenticated courses request status: ${coursesResponse.status()}`);

    // Expect a successful response
    expect(coursesResponse.ok()).toBeTruthy();

    // Log some course data if available
    const coursesData = await coursesResponse.json();
    if (Array.isArray(coursesData) && coursesData.length > 0) {
      console.log(`Found ${coursesData.length} courses`);
      console.log(`First course title: ${coursesData[0].title}`);
    } else if (
      coursesData.results &&
      Array.isArray(coursesData.results) &&
      coursesData.results.length > 0
    ) {
      console.log(`Found ${coursesData.results.length} courses`);
      console.log(`First course title: ${coursesData.results[0].title}`);
    } else {
      console.log('No courses found');
    }
  });
});
