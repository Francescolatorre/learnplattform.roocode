import {TaskCreationData} from 'src/types/common/entities';

import {learningTaskService} from './learningTaskService';

/**
 * React hook for task creation logic for learning tasks.
 * Provides a createTask function that wraps the learningTaskService.create method.
 *
 * @returns An object with a createTask function for creating learning tasks.
 */
export function useTaskCreation() {
    /**
     * Handles the creation of a new learning task.
     * @param taskData - The data for the new task, excluding the course.
     * @returns A promise resolving to the created learning task.
     */
    const createTask = async (taskData: Omit<TaskCreationData, 'course'>) => {
        // TODO: Replace with actual course selection logic
        const courseId = 1;

        return learningTaskService.create({
            ...taskData,
            course: courseId,
            is_published: taskData.is_published || false,
        });
    };

    return {createTask};
}
