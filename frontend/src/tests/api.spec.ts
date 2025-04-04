import { test, expect, request } from '@playwright/test';

/**
 * Test user credentials for API tests
 */
const TEST_USERS = {
  admin: {
    username: 'admin',
    password: 'adminpassword',
  },
  instructor: {
    username: 'instructor',
    password: 'instructor123',
  },
  student: {
    username: 'student',
    password: 'student123',
  },
};

/**
 * Base API URL
 */
const API_URL = 'http://localhost:8000';

/**
 * Helper class for API testing
 */
class ApiHelper {
  private accessToken: string = '';
  private refreshToken: string = '';

  /**
   * Authenticate and get tokens
   */
  async authenticate(username: string, password: string) {
    const requestContext = await request.newContext({
      baseURL: API_URL,
    });

    const response = await requestContext.post('/auth/login/', {
      data: {
        username: username,
        password: password,
      },
    });

    expect(response.ok()).toBeTruthy();

    const responseData = await response.json();
    this.accessToken = responseData.access;
    this.refreshToken = responseData.refresh;

    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    };
  }

  /**
   * Get the access token
   */
  public getAccessToken() {
    return this.accessToken;
  }

  /**
   * Get courses from API with authentication
   */
  async getCourses() {
    const requestContext = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const response = await requestContext.get('/api/v1/courses/');
    return response;
  }

  /**
   * Get course details from API
   */
  async getCourseDetails(courseId: string) {
    const requestContext = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const response = await requestContext.get(`/api/v1/courses/${courseId}/`);
    return response;
  }

  /**
   * Get tasks for a course from API
   */
  async getCourseTasks(courseId: string) {
    const requestContext = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const response = await requestContext.get(`/api/v1/learning-tasks/`, {
      params: { course: courseId },
    });
    return response;
  }

  /**
   * Create a task via API
   */
  async createTask(courseId: string, taskData: any) {
    const requestContext = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const data = {
      ...taskData,
      course: parseInt(courseId, 10),
    };

    const response = await requestContext.post(`/api/v1/learning-tasks/`, {
      data: data,
    });
    return response;
  }

  /**
   * Update a task via API
   */
  async updateTask(taskId: string, taskData: any) {
    const requestContext = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const response = await requestContext.put(`/api/v1/learning-tasks/${taskId}/`, {
      data: taskData,
    });
    return response;
  }

  /**
   * Delete a task via API
   */
  async deleteTask(taskId: string) {
    const requestContext = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const response = await requestContext.delete(`/api/v1/learning-tasks/${taskId}/`);
    return response;
  }

  /**
   * Refresh authentication token
   */
  async refreshAuthToken() {
    const requestContext = await request.newContext({
      baseURL: API_URL,
    });

    const response = await requestContext.post('/auth/token/refresh/', {
      data: {
        refresh: this.refreshToken,
      },
    });

    expect(response.ok()).toBeTruthy();

    const responseData = await response.json();
    this.accessToken = responseData.access;

    return {
      accessToken: this.accessToken,
    };
  }
}

test.describe('API Authentication and Authorization', () => {
  let apiHelper: ApiHelper;

  test.beforeEach(async () => {
    apiHelper = new ApiHelper();
  });

  test('Admin can authenticate and receive valid tokens', async () => {
    const tokens = await apiHelper.authenticate(
      TEST_USERS.admin.username,
      TEST_USERS.admin.password
    );

    expect(tokens.accessToken).toBeTruthy();
    expect(tokens.refreshToken).toBeTruthy();

    // Verify token format (should be JWT)
    expect(tokens.accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
  });

  test('Admin can access courses list', async () => {
    await apiHelper.authenticate(TEST_USERS.admin.username, TEST_USERS.admin.password);

    const response = await apiHelper.getCourses();

    expect(response.ok()).toBeTruthy();

    const responseData = await response.json();

    // Verify the response has courses data
    expect(
      Array.isArray(responseData) || (responseData.results && Array.isArray(responseData.results))
    ).toBeTruthy();
  });

  test('Instructor can access courses list', async () => {
    await apiHelper.authenticate(TEST_USERS.instructor.username, TEST_USERS.instructor.password);

    const response = await apiHelper.getCourses();

    expect(response.ok()).toBeTruthy();
  });

  test('Student can access courses list but cannot modify courses', async () => {
    await apiHelper.authenticate(TEST_USERS.student.username, TEST_USERS.student.password);

    // Students can view courses
    const getResponse = await apiHelper.getCourses();
    expect(getResponse.ok()).toBeTruthy();

    // Get first course id
    const coursesData = await getResponse.json();
    let courseId;

    if (Array.isArray(coursesData) && coursesData.length > 0) {
      courseId = coursesData[0].id;
    } else if (
      coursesData.results &&
      Array.isArray(coursesData.results) &&
      coursesData.results.length > 0
    ) {
      courseId = coursesData.results[0].id;
    } else {
      test.skip(!courseId);
      return;
    }

    // Get tasks for the course
    const tasksResponse = await apiHelper.getCourseTasks(courseId.toString());

    // Try to create a task (should fail for student)
    const createTaskResponse = await apiHelper.createTask(courseId.toString(), {
      title: 'Student Test Task',
      description: 'This task should not be created by a student',
      is_published: false,
      order: 1,
    });

    // Student should not be able to create tasks (expect 403 Forbidden)
    expect(createTaskResponse.status() === 401 || createTaskResponse.status() === 403).toBeTruthy();
  });

  test('Admin can create, update and delete tasks', async () => {
    await apiHelper.authenticate(TEST_USERS.admin.username, TEST_USERS.admin.password);

    // Get courses
    const coursesResponse = await apiHelper.getCourses();
    expect(coursesResponse.ok()).toBeTruthy();

    // Get first course id
    const coursesData = await coursesResponse.json();
    let courseId;

    if (Array.isArray(coursesData) && coursesData.length > 0) {
      courseId = coursesData[0].id;
    } else if (
      coursesData.results &&
      Array.isArray(coursesData.results) &&
      coursesData.results.length > 0
    ) {
      courseId = coursesData.results[0].id;
    } else {
      test.skip(!courseId);
      return;
    }

    // Create a task
    const createResponse = await apiHelper.createTask(courseId.toString(), {
      title: 'API Test Task',
      description: 'This task was created by the API test',
      is_published: false,
      order: 999, // High number to not interfere with existing tasks
    });

    expect(createResponse.ok()).toBeTruthy();

    // Get task ID from response
    const taskData = await createResponse.json();
    const taskId = taskData.id;

    // Update the task
    const updateResponse = await apiHelper.updateTask(taskId.toString(), {
      ...taskData,
      title: 'Updated API Test Task',
      description: 'This task was updated by the API test',
    });

    expect(updateResponse.ok()).toBeTruthy();

    // Verify update was successful
    const updatedTaskData = await updateResponse.json();
    expect(updatedTaskData.title).toBe('Updated API Test Task');

    // Delete the task
    const deleteResponse = await apiHelper.deleteTask(taskId.toString());
    expect(deleteResponse.ok()).toBeTruthy();

    // Verify deletion was successful by trying to get the task
    const requestContext = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${apiHelper.getAccessToken()}`,
      },
    });

    const getDeletedResponse = await requestContext.get(`/api/v1/learning-tasks/${taskId}/`);
    expect(getDeletedResponse.status()).toBe(404); // Should return 404 Not Found
  });

  test('Instructor can create, update and delete tasks', async () => {
    await apiHelper.authenticate(TEST_USERS.instructor.username, TEST_USERS.instructor.password);

    // Get courses
    const coursesResponse = await apiHelper.getCourses();
    expect(coursesResponse.ok()).toBeTruthy();

    // Get first course id
    const coursesData = await coursesResponse.json();
    let courseId;

    if (Array.isArray(coursesData) && coursesData.length > 0) {
      courseId = coursesData[0].id;
    } else if (
      coursesData.results &&
      Array.isArray(coursesData.results) &&
      coursesData.results.length > 0
    ) {
      courseId = coursesData.results[0].id;
    } else {
      test.skip(!courseId);
      return;
    }

    // Create a task
    const createResponse = await apiHelper.createTask(courseId.toString(), {
      title: 'Instructor Test Task',
      description: 'This task was created by the instructor',
      is_published: false,
      order: 999, // High number to not interfere with existing tasks
    });

    expect(createResponse.ok()).toBeTruthy();

    // Get task ID from response
    const taskData = await createResponse.json();
    const taskId = taskData.id;

    // Update the task
    const updateResponse = await apiHelper.updateTask(taskId.toString(), {
      ...taskData,
      title: 'Updated Instructor Test Task',
      description: 'This task was updated by the instructor',
    });

    expect(updateResponse.ok()).toBeTruthy();

    // Verify update was successful
    const updatedTaskData = await updateResponse.json();
    expect(updatedTaskData.title).toBe('Updated Instructor Test Task');

    // Delete the task
    const deleteResponse = await apiHelper.deleteTask(taskId.toString());
    expect(deleteResponse.ok()).toBeTruthy();

    // Verify deletion was successful by trying to get the task
    const requestContext = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${apiHelper.getAccessToken()}`,
      },
    });

    const getDeletedResponse = await requestContext.get(`/api/v1/learning-tasks/${taskId}/`);
    expect(getDeletedResponse.status()).toBe(404); // Should return 404 Not Found
  });

  test('Token refresh works correctly', async () => {
    // Get initial tokens
    await apiHelper.authenticate(TEST_USERS.admin.username, TEST_USERS.admin.password);

    // Refresh token
    const refreshedTokens = await apiHelper.refreshAuthToken();

    // Verify we got a new access token
    expect(refreshedTokens.accessToken).toBeTruthy();

    // Verify the new token works by making an API call
    const response = await apiHelper.getCourses();
    expect(response.ok()).toBeTruthy();
  });
});
