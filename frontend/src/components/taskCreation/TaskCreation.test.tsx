console.log('File loaded');
import TaskCreation from './TaskCreation';
import {renderWithProviders} from '../../test-utils/renderWithProviders';
import {screen} from '@testing-library/react';
/**
 * TaskCreation.test.tsx
 * Comprehensive test suite for TaskCreation component using real context providers.
 */
import React from 'react';
import {fireEvent, waitFor} from '@testing-library/react';
import {describe, test, vi, beforeEach} from 'vitest';

// Mock Notification Hook
vi.mock('@/components/Notifications/useNotification', () => ({
    useNotification: vi.fn(),
}));
// Mock learning task service
vi.mock('@/services/resources/learningTaskService', () => ({
    createTask: vi.fn().mockResolvedValue({id: 1, title: 'Test Task'}),
    updateTask: vi.fn().mockResolvedValue({id: 1, title: 'Updated Task'}),
}));
// Mock MarkdownRenderer to avoid highlight.js/react-markdown issues in test env
vi.mock('../shared/MarkdownRenderer', () => ({
    __esModule: true,
    default: ({content}: {content: string}) => <div data-testid="mock-markdown">{content}</div>,
}));

describe.skip('TaskCreation Component', () => {
    console.log('Starting TaskCreation tests');
    test.only('render TaskCreation with all providers and debug', () => {
        console.log('Provider+Component test started');
        const onClose = () => {
            console.log('onClose called');
        };
        renderWithProviders(<TaskCreation open={true} onClose={onClose} />);
        console.log('Rendered TaskCreation');
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        console.log('Provider+Component test finished');
    });

    let mockOnClose = vi.fn();
    let mockOnSave: (task: Partial<ILearningTask>) => Promise<void>;

    beforeEach(() => {
        mockOnClose.mockClear();
        mockOnSave = vi.fn(async () => { }); // Default to async resolved
    });

    test('renders TaskCreation dialog and title', () => {
        console.log('Test started');
        renderWithProviders(<TaskCreation open={true} onClose={mockOnClose} />);
        console.log('Rendered TaskCreation');
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        console.log('Dialog found');
        expect(screen.getByText('Create a New Task')).toBeInTheDocument();
        expect(screen.getByLabelText('Task Title')).toBeInTheDocument();
        expect(screen.getByLabelText('Task Description')).toBeInTheDocument();
        console.log('All assertions passed');
    });

    test('requires title and description', async () => {
        renderWithProviders(<TaskCreation open={true} onClose={mockOnClose} />);
        fireEvent.click(screen.getByText('Create Task'));
        expect(await screen.findByText('Title and description are required.')).toBeInTheDocument();
    });

    test('updates title on input change', () => {
        renderWithProviders(<TaskCreation open={true} onClose={mockOnClose} />);
        const titleInput = screen.getByLabelText('Task Title') as HTMLInputElement;
        fireEvent.change(titleInput, {target: {value: 'My New Task'}});
        expect(titleInput.value).toBe('My New Task');
    });

    test('updates description in markdown editor', () => {
        renderWithProviders(<TaskCreation open={true} onClose={mockOnClose} />);
        const descriptionInput = screen.getByLabelText('Task Description') as
            | HTMLInputElement
            | HTMLTextAreaElement;
        fireEvent.change(descriptionInput, {target: {value: 'Some description'}});
        expect(descriptionInput.value).toBe('Some description');
    });

    test('calls onClose when Cancel button is clicked', () => {
        renderWithProviders(<TaskCreation open={true} onClose={mockOnClose} />);
        fireEvent.click(screen.getByText('Cancel'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('submits the form successfully when fields are filled', async () => {
        renderWithProviders(<TaskCreation open={true} onClose={mockOnClose} onSave={mockOnSave} />);
        fireEvent.change(screen.getByLabelText('Task Title'), {target: {value: 'Test Task'}});
        fireEvent.change(screen.getByLabelText('Task Description'), {
            target: {value: 'Test Description'},
        });
        fireEvent.click(screen.getByText('Create Task'));
        await waitFor(() =>
            expect(mockOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Test Task',
                    description: 'Test Description',
                })
            )
        );
    });

    test('shows error notification when onSave throws', async () => {
        mockOnSave = vi.fn(async () => {
            throw new Error('Save failed');
        });
        renderWithProviders(<TaskCreation open={true} onClose={mockOnClose} onSave={mockOnSave} />);
        fireEvent.change(screen.getByLabelText('Task Title'), {target: {value: 'Test Task'}});
        fireEvent.change(screen.getByLabelText('Task Description'), {
            target: {value: 'Test Description'},
        });
        fireEvent.click(screen.getByText('Create Task'));
        expect(await screen.findByText('Save failed')).toBeInTheDocument();
    });
});
