/**
 * TaskCreation.test.tsx
 * Comprehensive test suite for TaskCreation component using real context providers.
 */
import React from 'react';
import {screen, fireEvent, waitFor} from '@testing-library/react';
import {describe, test, vi, beforeEach} from 'vitest';
import {renderWithProviders} from '../../test-utils/renderWithProviders';

// Mock MarkdownRenderer to avoid highlight.js/react-markdown issues in test env
vi.mock('../shared/MarkdownRenderer', () => ({
    __esModule: true,
    default: ({content}: {content: string}) => <div data-testid="mock-markdown">{content}</div>
}));

import TaskCreation from './TaskCreation';

describe('TaskCreation Component', () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();

    beforeEach(() => {
        mockOnClose.mockClear();
        mockOnSave.mockClear();
    });

    test('renders TaskCreation dialog and title', () => {
        renderWithProviders(
            <TaskCreation open={true} onClose={mockOnClose} />
        );
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Create a New Task')).toBeInTheDocument();
        expect(screen.getByLabelText('Task Title')).toBeInTheDocument();
        expect(screen.getByLabelText('Task Description')).toBeInTheDocument();
    });

    test('requires title and description', async () => {
        renderWithProviders(
            <TaskCreation open={true} onClose={mockOnClose} />
        );
        fireEvent.click(screen.getByText('Create Task'));
        expect(await screen.findByText('Title and description are required.')).toBeInTheDocument();
    });

    test('updates title on input change', () => {
        renderWithProviders(
            <TaskCreation open={true} onClose={mockOnClose} />
        );
        const titleInput = screen.getByLabelText('Task Title') as HTMLInputElement;
        fireEvent.change(titleInput, {target: {value: 'My New Task'}});
        expect(titleInput.value).toBe('My New Task');
    });

    test('updates description in markdown editor', () => {
        renderWithProviders(
            <TaskCreation open={true} onClose={mockOnClose} />
        );
        const descriptionInput = screen.getByLabelText('Task Description') as HTMLInputElement | HTMLTextAreaElement;
        fireEvent.change(descriptionInput, {target: {value: 'Some description'}});
        expect(descriptionInput.value).toBe('Some description');
    });

    test('calls onClose when Cancel button is clicked', () => {
        renderWithProviders(
            <TaskCreation open={true} onClose={mockOnClose} />
        );
        fireEvent.click(screen.getByText('Cancel'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('submits the form successfully when fields are filled', async () => {
        renderWithProviders(
            <TaskCreation open={true} onClose={mockOnClose} onSave={mockOnSave} />
        );
        fireEvent.change(screen.getByLabelText('Task Title'), {target: {value: 'Test Task'}});
        fireEvent.change(screen.getByLabelText('Task Description'), {target: {value: 'Test Description'}});
        fireEvent.click(screen.getByText('Create Task'));
        await waitFor(() => expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Test Task',
            description: 'Test Description'
        })));
    });

    test('shows error notification when onSave throws', async () => {
        mockOnSave.mockImplementation(() => {
            throw new Error('Save failed');
        });
        renderWithProviders(
            <TaskCreation open={true} onClose={mockOnClose} onSave={mockOnSave} />
        );
        fireEvent.change(screen.getByLabelText('Task Title'), {target: {value: 'Test Task'}});
        fireEvent.change(screen.getByLabelText('Task Description'), {target: {value: 'Test Description'}});
        fireEvent.click(screen.getByText('Create Task'));
        expect(await screen.findByText('Save failed')).toBeInTheDocument();
    });
});
