/**
 * Integration test for learningTaskService.
 * Test environment requirements:
 * - All service dependencies must be initialized via their public setAuthToken method.
 * - No direct property access to internal API clients.
 * - If mocking is needed, use global mocks in setupTests.ts.
 * - Diagnostic logging is included before dependency access.
 */

import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import {ICourse} from '@/types/course';
import authService from '../auth/authService';
import {courseService} from './courseService';
import learningTaskService from './learningTaskService';
import {TEST_USERS} from '@/test-utils/setupIntegrationTests';

describe('learningTaskService Integration', () => {
  let accessToken: string;
  let createdCourseId: number;
  let baseTaskId: number;
  let userId: number;

  beforeAll(async () => {
    try {
      // Use instructor account for tests that require course creation permissions
      const loginData = await authService.login(
        TEST_USERS.instructor.username,
        TEST_USERS.instructor.password
      );
      accessToken = loginData.access;

      // Set Authorization header for all ApiService instances using public API
      learningTaskService.setAuthToken(accessToken);
      courseService.setAuthToken(accessToken);

      // Fetch user profile to get userId
      const userProfile = await authService.getUserProfile(accessToken);
      userId = userProfile.id;
    } catch (error) {
      console.error('Instructor login failed, falling back to student:', error);
      // Fall back to student if instructor fails
      const loginData = await authService.login(
        TEST_USERS.student.username,
        TEST_USERS.student.password
      );
      accessToken = loginData.access;
      accessToken = loginData.access;

      learningTaskService.setAuthToken(accessToken);
      courseService.setAuthToken(accessToken);
      const userProfile = await authService.getUserProfile(accessToken);
      userId = userProfile.id;
    }

    // Create a course for testing
    try {
      const courseData: Partial<ICourse> = {
        title: 'Integration Test Course for LearningTask',
        description: 'Created by integration test for learningTaskService',
        version: 1,
        status: 'published',
        visibility: 'public',
        learning_objectives: 'Test objectives',
        prerequisites: 'None',
      };
      const createdCourse = await courseService.createCourse(courseData);
      createdCourseId = createdCourse.id;

      // Create a base task for tests that require an existing task
      const baseTaskData = {
        id: 0,
        title: 'Base Integration Test Task',
        description: 'Base task for integration test',
        course: createdCourseId,
      };
      const baseTask = await learningTaskService.create(baseTaskData);
      baseTaskId = baseTask.id;
    } catch (error) {
      console.error('Setup failed:', error);
      throw error;
    }
  });

  afterAll(async () => {
    // Clean up the base task and created course
    if (baseTaskId) {
      await learningTaskService.delete(String(baseTaskId));
    }
    if (createdCourseId) {
      await courseService.deleteCourse(String(createdCourseId));
    }
  });

  it('getAll returns learning tasks', async () => {
    //console.log('Test course ID for getAll:', createdCourseId);
    let tasks: any = await learningTaskService.getAll({course: String(createdCourseId)});
    if (!Array.isArray(tasks) && tasks && Array.isArray(tasks.results)) {
      tasks = tasks.results;
    }

    expect(Array.isArray(tasks)).toBe(true);

    // Assert all returned tasks are for the created course
    const wrongCourseTasks = tasks.filter((t: any) => t.course !== createdCourseId);
    if (wrongCourseTasks.length > 0) {
      console.error('Tasks with wrong course returned:', wrongCourseTasks);
    }
    expect(wrongCourseTasks.length).toBe(0);

    // Check that the created task is present in the returned array (type-robust)
    const found = tasks.some((t: any) => t.id == baseTaskId);
    if (!found) {
      console.error(
        'Created task not found in getAll response. CreatedTaskId:',
        baseTaskId,
        'Returned IDs:',
        tasks.map((t: any) => t.id)
      );
    }
    expect(found).toBe(true);
  });

  it('create creates a new learning task', async () => {
    const taskData = {
      id: 0,
      title: 'Integration Test Task',
      description: 'Created by integration test',
      course: createdCourseId,
    };
    const created = await learningTaskService.create(taskData);
    expect(created).toHaveProperty('id');
    expect(created.title).toBe('Integration Test Task');
    // Clean up: delete the created task
    await learningTaskService.delete(String(created.id));
  });

  it('getById returns the learning task', async () => {
    const task = await learningTaskService.getById(String(baseTaskId));
    expect(task).toHaveProperty('id', baseTaskId);
  });

  it('update updates the learning task title', async () => {
    const updated = await learningTaskService.update(String(baseTaskId), {
      title: 'Updated Integration Test Task',
    });
    expect(updated).toHaveProperty('title', 'Updated Integration Test Task');
    // Revert title for idempotency
    await learningTaskService.update(String(baseTaskId), {title: 'Base Integration Test Task'});
  });

  it('delete removes the learning task', async () => {
    // Create a task to delete
    const taskData = {
      id: 0,
      title: 'Task to Delete',
      description: 'Task created for delete test',
      course: createdCourseId,
    };
    const created = await learningTaskService.create(taskData);
    const taskIdToDelete = created.id;
    await learningTaskService.delete(String(taskIdToDelete));
    // Optionally, try to fetch and expect an error
    try {
      await learningTaskService.getById(String(taskIdToDelete));
      expect(false).toBe(true); // Should not reach here
    } catch (error: any) {
      expect(/not found/i.test(error.message) || /status code 404/i.test(error.message)).toBe(true);
    }
  });
});
