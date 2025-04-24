import {renderHook, act} from '@testing-library/react';
import {describe, it, expect, beforeEach} from 'vitest';

import {useTaskCreation} from './learningTaskHooks';
import learningTaskService from './learningTaskService';

vi.mock('./learningTaskService');

describe('useTaskCreation', () => {
    const courseId = 42;
    const mockCreate = vi.fn();

    beforeEach(() => {
        mockCreate.mockReset();
        (learningTaskService.create as vi.Mock) = mockCreate;
    });

    it('should call learningTaskService.create with correct courseId and taskData', async () => {
        const {result} = renderHook(() => useTaskCreation());
        const taskData = {id: 1, title: 'Test Task', description: 'desc', order: 1, is_published: true};

        mockCreate.mockResolvedValueOnce({...taskData, course: courseId});

        let createdTask;
        await act(async () => {
            createdTask = await result.current.createTask(courseId, taskData);
        });

        expect(mockCreate).toHaveBeenCalledWith({
            ...taskData,
            course: courseId,
            is_published: taskData.is_published || false,
        });
        expect(createdTask).toEqual({...taskData, course: courseId});
    });

    it('should default is_published to false if not provided', async () => {
        const {result} = renderHook(() => useTaskCreation());
        const taskData = {id: 2, title: 'Test Task', description: 'desc', order: 1};

        mockCreate.mockResolvedValueOnce({...taskData, course: courseId, is_published: false});

        let createdTask;
        await act(async () => {
            createdTask = await result.current.createTask(courseId, taskData);
        });

        expect(mockCreate).toHaveBeenCalledWith({
            ...taskData,
            course: courseId,
            is_published: false,
        });
        expect(createdTask).toEqual({...taskData, course: courseId, is_published: false});
    });

    it('should propagate error and log when learningTaskService.create fails', async () => {
        const {result} = renderHook(() => useTaskCreation());
        const taskData = {id: 3, title: 'Error Task', description: 'desc', order: 1};
        const error = new Error('Create failed');

        mockCreate.mockRejectedValueOnce(error);
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        let caughtError;
        await act(async () => {
            try {
                await result.current.createTask(courseId, taskData);
            } catch (e) {
                caughtError = e;
            }
        });

        expect(mockCreate).toHaveBeenCalledWith({
            ...taskData,
            course: courseId,
            is_published: false,
        });
        expect(caughtError).toBe(error);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create learning task:', error);

        consoleErrorSpy.mockRestore();
    });
});
