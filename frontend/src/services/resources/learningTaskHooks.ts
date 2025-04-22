import {TaskCreationData} from '@/types/entities';

import learningTaskService from './learningTaskService';

/**
 * React hook for task creation logic for learning tasks.
 * Provides a createTask function that wraps the learningTaskService.create method.
 *
 * @param courseId - The ID of the course to associate with the new task.
 * @returns An object with a createTask function for creating learning tasks.
 */
export function useTaskCreation() {
    /**
     * Handles the creation of a new learning task.
     * @param courseId - The ID of the course to associate with the new task.
     * @param taskData - The data for the new task, excluding the course.
     * @returns A promise resolving to the created learning task.
     */
    const createTask = async (courseId: number, taskData: Omit<TaskCreationData, 'course'>) => {
        try {
            const result = await learningTaskService.create({
                ...taskData,
                course: courseId,
                is_published: taskData.is_published || false,
            });
            return result;
        } catch (error) {
            // Log error for debugging
            console.error('Failed to create learning task:', error);
            throw error;
        }
    };

    return {createTask};
}
