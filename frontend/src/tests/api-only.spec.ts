import { describe, it, expect } from 'vitest';

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

describe('Backend API Tests (no frontend)', () => {
  it('Health endpoint is accessible', async () => {
    const response = await fetch(`${API_URL}/health/`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
  });

  it('Login endpoint works', async () => {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: TEST_USERS.admin.username,
        password: TEST_USERS.admin.password,
      }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('access');
    expect(data).toHaveProperty('refresh');
  });

  it('Courses API requires authentication', async () => {
    const response = await fetch(`${API_URL}/api/v1/courses/`);
    expect(response.status).toBe(401);
  });

  it('Can access courses with authentication', async () => {
    const loginResponse = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: TEST_USERS.admin.username,
        password: TEST_USERS.admin.password,
      }),
    });

    const loginData = await loginResponse.json();
    const token = loginData.access;

    const coursesResponse = await fetch(`${API_URL}/api/v1/courses/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(coursesResponse.status).toBe(200);

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
