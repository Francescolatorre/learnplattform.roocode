import { Page } from '@playwright/test';
import { TEST_USERS, login } from '../setupTests';

/**
 * Login as a student user
 * @param page - Playwright page object
 */
export async function loginAsStudent(page: Page): Promise<void> {
  console.info('Attempting to login as student...');

  try {
    // Use the predefined student user from setupTests.ts
    const studentUser = TEST_USERS.student;
    await login(page, studentUser.username, studentUser.password);
    console.info('Successfully logged in as student');
  } catch (error) {
    console.error('Failed to login as student:', error);
    throw error;
  }
}

/**
 * Login as an instructor user
 * @param page - Playwright page object
 */
export async function loginAsInstructor(page: Page): Promise<void> {
  console.info('Attempting to login as instructor...');

  try {
    // Use the predefined instructor user from setupTests.ts
    const instructorUser = TEST_USERS.lead_instructor;
    await login(page, instructorUser.username, instructorUser.password);
    console.info('Successfully logged in as instructor');
  } catch (error) {
    console.error('Failed to login as instructor:', error);
    throw error;
  }
}

/**
 * Login as an admin user
 * @param page - Playwright page object
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  console.info('Attempting to login as admin...');

  try {
    // Use the predefined admin user from setupTests.ts
    const adminUser = TEST_USERS.admin;
    await login(page, adminUser.username, adminUser.password);
    console.info('Successfully logged in as admin');
  } catch (error) {
    console.error('Failed to login as admin:', error);
    throw error;
  }
}
