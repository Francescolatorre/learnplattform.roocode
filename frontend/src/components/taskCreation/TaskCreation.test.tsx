console.log('File loaded');
import { screen } from '@testing-library/react';
/**
 * TaskCreation.test.tsx
 *
 * This test suite REQUIRES a mock for useNotification.
 * - useNotification is mocked to avoid context errors and to allow assertion of notification calls.
 * - NotificationProvider is NOT used in these tests.
 *
 * If you need to test the actual notification system, use NotificationProvider and do NOT mock useNotification.
 */
import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, test, vi, beforeEach } from 'vitest';

import { ILearningTask } from '@/types';

import { renderWithProviders } from '../../test-utils/renderWithProviders';

import TaskCreation from './TaskCreation';

// Mock Notification Hook
vi.mock('@/components/Notifications/useNotification', () => {
  // Create a properly typed mock function
  const mockNotify = vi.fn() as any;
  mockNotify.success = vi.fn();
  mockNotify.error = vi.fn();
  mockNotify.info = vi.fn();
  mockNotify.warning = vi.fn();

  return {
    default: () => mockNotify,
  };
});
// Mock modern learning task service
vi.mock('@/services/resources/modernLearningTaskService', () => ({
  modernLearningTaskService: {
    createTask: vi.fn().mockResolvedValue({ id: 1, title: 'Test Task' }),
    updateTask: vi.fn().mockResolvedValue({ id: 1, title: 'Updated Task' }),
  },
}));
/**
 * By default, mock MarkdownRenderer to avoid highlight.js/react-markdown issues in test env.
 * For the Markdown rendering test, we'll unmock it inside the test.
 */
vi.mock('../shared/MarkdownRenderer', () => ({
  __esModule: true,
  default: ({ content }: { content: string }) => <div data-testid="mock-markdown">{content}</div>,
}));

describe('TaskCreation Component', () => {
  test('render TaskCreation with all providers and debug', () => {
    const onClose = () => {
      console.log('onClose called');
    };
    renderWithProviders(<TaskCreation open={true} onClose={onClose} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  const mockOnClose = vi.fn();
  let mockOnSave: (task: Partial<ILearningTask>) => Promise<void>;

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave = vi.fn(async () => {}); // Default to async resolved
  });

  test('renders TaskCreation dialog and title', () => {
    console.log('Test started');
    renderWithProviders(<TaskCreation open={true} onClose={mockOnClose} />);
    console.log('Rendered TaskCreation');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    console.log('Dialog found');
    expect(screen.getByText('Create a New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Task Title')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-editor-textarea')).toBeInTheDocument();
    console.log('All assertions passed');
  });

  test('requires title and description', async () => {
    renderWithProviders(<TaskCreation open={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Create Task'));
    const errorMessages = await screen.findAllByText('Title and description are required.');
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  test('updates title on input change', () => {
    renderWithProviders(<TaskCreation open={true} onClose={mockOnClose} />);
    const titleInput = screen.getByLabelText('Task Title') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'My New Task' } });
    expect(titleInput.value).toBe('My New Task');
  });

  test('updates description in markdown editor', () => {
    renderWithProviders(<TaskCreation open={true} onClose={mockOnClose} />);
    const descriptionInput = screen.getByTestId('markdown-editor-textarea') as
      | HTMLInputElement
      | HTMLTextAreaElement;
    fireEvent.change(descriptionInput, { target: { value: 'Some description' } });
    expect(descriptionInput.value).toBe('Some description');
  });

  test('calls onClose when Cancel button is clicked', () => {
    renderWithProviders(<TaskCreation open={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('submits the form successfully when fields are filled', async () => {
    renderWithProviders(<TaskCreation open={true} onClose={mockOnClose} onSave={mockOnSave} />);
    fireEvent.change(screen.getByLabelText('Task Title'), { target: { value: 'Test Task' } });
    fireEvent.change(screen.getByTestId('markdown-editor-textarea'), {
      target: { value: 'Test Description' },
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
    fireEvent.change(screen.getByLabelText('Task Title'), { target: { value: 'Test Task' } });
    fireEvent.change(screen.getByTestId('markdown-editor-textarea'), {
      target: { value: 'Test Description' },
    });
    fireEvent.click(screen.getByText('Create Task'));
    expect(await screen.findByText('Save failed')).toBeInTheDocument();
  });

  /*
   * Markdown rendering test moved to TaskCreation.markdown.test.tsx to avoid ESM mock hoisting issues.
   */

  test('retains form data when making changes but resets when reopening modal', () => {
    // Create a component with state to control the modal
    const TestWrapper = () => {
      const [isOpen, setIsOpen] = React.useState(true);
      return (
        <>
          <button onClick={() => setIsOpen(!isOpen)}>Toggle Modal</button>
          <TaskCreation open={isOpen} onClose={() => setIsOpen(false)} />
        </>
      );
    };

    // Render the wrapper component
    renderWithProviders(<TestWrapper />);

    // Type in the title field
    const titleInput = screen.getByLabelText('Task Title') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'My New Task' } });
    expect(titleInput.value).toBe('My New Task');

    // Toggle the publish switch
    const publishSwitch = screen.getByLabelText('Publish Task') as HTMLInputElement;
    fireEvent.click(publishSwitch);

    // Verify the title is still there after another state change
    expect(titleInput.value).toBe('My New Task');

    // Close and reopen the modal
    fireEvent.click(screen.getByText('Toggle Modal'));
    fireEvent.click(screen.getByText('Toggle Modal'));

    // Verify the title field is reset when reopening
    const newTitleInput = screen.getByLabelText('Task Title') as HTMLInputElement;
    expect(newTitleInput.value).toBe('');
  });
});
