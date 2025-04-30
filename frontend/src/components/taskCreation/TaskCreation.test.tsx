import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {vi} from 'vitest';
import TaskCreation from './TaskCreation';



describe('TaskCreation Component', () => {
    const mockOnClose = vi.fn();
    const courseId = '123';

    beforeEach(() => {
        mockOnClose.mockClear();
    });

    test('renders TaskCreation dialog when open is true', () => {
        render(<TaskCreation open={true} onClose={mockOnClose} courseId={courseId} />);
        expect(screen.getByText(/Create a New Task/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Task Title/i)).toBeInTheDocument();
        expect(screen.getByTestId('markdown-editor-textarea')).toBeDefined();
    });

    test('does not render dialog when open is false', () => {
        render(<TaskCreation open={false} onClose={mockOnClose} courseId={courseId} />);
        expect(screen.queryByText(/Create a New Task/i)).not.toBeDefined();
    });

    test('shows validation error when submitting empty form', () => {
        render(<TaskCreation open={true} onClose={mockOnClose} courseId={courseId} />);
        fireEvent.click(screen.getByRole('button', {name: /Create Task/i}));
        expect(screen.getByText(/Title and description are required/i)).toBeDefined();
    });

    test('updates title on input change', () => {
        render(<TaskCreation open={true} onClose={mockOnClose} courseId={courseId} />);
        const titleInput = screen.getByLabelText(/Task Title/i);
        fireEvent.change(titleInput, {target: {value: 'New Task'}});
        expect(titleInput.value).toBe('New Task');
    });

    test('updates description in markdown editor', () => {
        render(<TaskCreation open={true} onClose={mockOnClose} courseId={courseId} />);
        const markdownEditor = screen.getByTestId('markdown-editor-textarea');
        fireEvent.change(markdownEditor, {target: {value: '## Task Description'}});
        expect(markdownEditor.value).toBe('## Task Description');
    });

    test('calls onClose when Cancel button is clicked', () => {
        render(<TaskCreation open={true} onClose={mockOnClose} courseId={courseId} />);
        fireEvent.click(screen.getByRole('button', {name: /Cancel/i}));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('validates both title and description', async () => {
        render(<TaskCreation open={true} onClose={mockOnClose} courseId={courseId} />);

        // Fill in title but not description
        const titleInput = screen.getByLabelText(/Task Title/i);
        fireEvent.change(titleInput, {target: {value: 'New Task'}});

        // Submit the form
        fireEvent.click(screen.getByRole('button', {name: /Create Task/i}));

        // Check that validation error is shown
        expect(screen.getByText(/Title and description are required/i)).toBeInTheDocument();

        // Now fill in the description
        const markdownEditor = screen.getByTestId('markdown-editor-textarea');
        fireEvent.change(markdownEditor, {target: {value: '## Task Description'}});

        // Mock console.log to verify task creation
        const consoleSpy = vi.spyOn(console, 'log');

        // Submit again
        fireEvent.click(screen.getByRole('button', {name: /Create Task/i}));

        // Verify task creation was logged
        expect(consoleSpy).toHaveBeenCalledWith('Task Created:',
            expect.objectContaining({
                title: 'New Task',
                description: '## Task Description'
            })
        );

        // Verify form was reset and dialog closed
        expect(mockOnClose).toHaveBeenCalledTimes(1);

        consoleSpy.mockRestore();
    });
});
