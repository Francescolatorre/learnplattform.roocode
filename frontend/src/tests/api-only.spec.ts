/**
 * These tests require a running backend server at http://localhost:8000.
 * Ensure the Django backend is started before running this test suite.
 */

import {describe, it, expect} from 'vitest';

/**
 * Test user credentials
 */
const TEST_USERS = {
  student: {
    username: 'student',
    password: 'student123',
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
    expect(data).toHaveProperty('status', 'healthy');
  });

  it('Login endpoint works', async () => {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: TEST_USERS.student.username,
        password: TEST_USERS.student.password,
      }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('access');
    expect(data).toHaveProperty('refresh');
  });

  it('Courses API requires authentication', async () => {
    const response = await fetch(`${API_URL}/api/v1/courses/`);
    // The backend should return 401 Unauthorized for unauthenticated requests
    expect(response.status).toBe(401);
  });

  it('Can access courses with authentication', async () => {
    const loginResponse = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: TEST_USERS.student.username,
        password: TEST_USERS.student.password,
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
      console.info(`Found ${coursesData.results.length} courses`);
      console.info(`First course title: ${coursesData.results[0].title}`);
    } else {
      console.info('No courses found');
    }

    describe('Courses API Integration', () => {
      let token: string;
      let createdCourseId: number | null = null;

      beforeAll(async () => {
        // Authenticate as student
        const loginResponse = await fetch(`${API_URL}/auth/login/`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            username: TEST_USERS.student.username,
            password: TEST_USERS.student.password,
          }),
        });
        const loginData = await loginResponse.json();
        token = loginData.access;
      });

      it('can create, fetch, update, and delete a course', async () => {
        // Create
        const createResponse = await fetch(`${API_URL}/api/v1/courses/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: 'Integration Test Course',
            description: 'Created by integration test',
            version: 1,
            status: 'published',
            visibility: 'public',
            learning_objectives: 'Test objectives',
            prerequisites: 'None',
          }),
        });
        expect(createResponse.status).toBe(201);
        const created = await createResponse.json();
        expect(created).toHaveProperty('id');
        createdCourseId = created.id;

        // Fetch details
        const detailResponse = await fetch(`${API_URL}/api/v1/courses/${createdCourseId}/`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        expect(detailResponse.status).toBe(200);
        const detail = await detailResponse.json();
        expect(detail).toHaveProperty('title', 'Integration Test Course');

        // Update
        const updateResponse = await fetch(`${API_URL}/api/v1/courses/${createdCourseId}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...detail,
            title: 'Updated Integration Test Course',
          }),
        });
        expect(updateResponse.status).toBe(200);
        const updated = await updateResponse.json();
        expect(updated).toHaveProperty('title', 'Updated Integration Test Course');

        // Delete
        const deleteResponse = await fetch(`${API_URL}/api/v1/courses/${createdCourseId}/`, {
          method: 'DELETE',
          headers: {Authorization: `Bearer ${token}`},
        });
        expect([200, 204]).toContain(deleteResponse.status);
      });
    });

  });


  describe('Learning Tasks API Integration', () => {
    let token: string;
    let createdTaskId: number | null = null;

    beforeAll(async () => {
      // Authenticate as student
      const loginResponse = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          username: TEST_USERS.student.username,
          password: TEST_USERS.student.password,
        }),
      });
      const loginData = await loginResponse.json();
      token = loginData.access;
    });

    it('can create, fetch, update, and delete a learning task', async () => {
      // Create
      const createResponse = await fetch(`${API_URL}/api/v1/learning-tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: 'Integration Test Task',
          description: 'Created by integration test',
          course: 1, // Adjust as needed for your test DB
        }),
      });
      expect(createResponse.status).toBe(201);
      const createdTask = await createResponse.json();
      createdTaskId = createdTask.id;
      expect(createdTask.title).toBe('Integration Test Task');

      // Fetch
      const fetchResponse = await fetch(`${API_URL}/api/v1/learning-tasks/${createdTaskId}/`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      expect(fetchResponse.status).toBe(200);
      const fetchedTask = await fetchResponse.json();
      expect(fetchedTask.id).toBe(createdTaskId);
      expect(fetchedTask.title).toBe('Integration Test Task');

      // Update
      const updateResponse = await fetch(`${API_URL}/api/v1/learning-tasks/${createdTaskId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...fetchedTask,
          title: 'Updated Integration Test Task',
        }),
      });
      expect(updateResponse.status).toBe(200);
      const updatedTask = await updateResponse.json();
      expect(updatedTask.title).toBe('Updated Integration Test Task');

      // Delete
      const deleteResponse = await fetch(`${API_URL}/api/v1/learning-tasks/${createdTaskId}/`, {
        method: 'DELETE',
        headers: {Authorization: `Bearer ${token}`},
      });
      expect(deleteResponse.status).toBe(204);

      // Confirm deletion
      const confirmResponse = await fetch(`${API_URL}/api/v1/learning-tasks/${createdTaskId}/`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      expect(confirmResponse.status).toBe(404);
    });
  });

});
