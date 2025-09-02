import { describe, it, expect } from 'vitest';

import { IUserProgress } from '@/types/progress';

import { courseService } from './courseService';

describe('CourseService', () => {
  describe('transformUserProgressToStudentSummary', () => {
    it('should transform a simple user progress object into a student progress summary', () => {
      // Arrange
      const mockUserProgress: IUserProgress = {
        id: 123,
        percentage: 75,
        label: 'Introduction to TypeScript',
      };

      // Act
      const result = courseService.transformUserProgressToStudentSummary(mockUserProgress);

      // Assert
      expect(result).toEqual({
        progress: 75,
        user_info: {
          id: '123',
          username: 'Introduction to TypeScript',
          display_name: 'Introduction to TypeScript',
          role: 'student',
        },
        overall_stats: {
          courses_enrolled: 1,
          courses_completed: 0,
          overall_progress: 75,
          tasks_completed: 0,
          tasks_in_progress: 0,
          tasks_overdue: 0,
        },
        courses: [
          {
            id: '123',
            title: 'Introduction to TypeScript',
            progress: 75,
            status: 'active',
            enrolled_date: expect.any(String),
            last_activity_date: expect.any(String),
          },
        ],
      });

      // Verify date strings are in ISO format
      expect(result.courses[0].enrolled_date).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
      );
      expect(result.courses[0].last_activity_date).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
      );
    });

    it('should handle edge cases with minimal user progress data', () => {
      // Arrange
      const minimalUserProgress: IUserProgress = {
        id: 0,
        percentage: 0,
        label: '',
      };

      // Act
      const result = courseService.transformUserProgressToStudentSummary(minimalUserProgress);

      // Assert
      expect(result).toEqual({
        progress: 0,
        user_info: {
          id: '0',
          username: '',
          display_name: '',
          role: 'student',
        },
        overall_stats: {
          courses_enrolled: 1,
          courses_completed: 0,
          overall_progress: 0,
          tasks_completed: 0,
          tasks_in_progress: 0,
          tasks_overdue: 0,
        },
        courses: [
          {
            id: '0',
            title: '',
            progress: 0,
            status: 'active',
            enrolled_date: expect.any(String),
            last_activity_date: expect.any(String),
          },
        ],
      });
    });
  });
});
