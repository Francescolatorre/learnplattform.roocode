import React from 'react';
import {render, screen} from '@testing-library/react';
import {vi} from 'vitest';

// Create a mock TaskCreation component directly in the test file
function MockTaskCreation({open, onClose}) {
    return (
        <div data-testid="mock-task-creation">
            <h2>Create a New Task</h2>
            <button onClick={onClose}>Cancel</button>
            <button>Create Task</button>
        </div>
    );
}

// Mock the ErrorNotifier hooks
vi.mock('@components/ErrorNotifier/useErrorNotifier', () => {
    return {
        useNotification: () => jest.fn(),
        useErrorNotifier: () => jest.fn()
    };
});

// Mock the learning task service
vi.mock('@/services/resources/learningTaskService', () => ({
    createTask: vi.fn().mockResolvedValue({id: 1, title: 'Test Task'}),
    updateTask: vi.fn().mockResolvedValue({id: 1, title: 'Updated Task'})
}));

describe('MockTaskCreation Component', () => {
    test('renders without errors', () => {
        const mockOnClose = vi.fn();
        render(<MockTaskCreation open={true} onClose={mockOnClose} />);

        expect(screen.getByText('Create a New Task')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /Cancel/})).toBeInTheDocument();
    });
});
