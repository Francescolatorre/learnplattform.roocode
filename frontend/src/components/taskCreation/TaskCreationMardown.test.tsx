import {renderWithProviders} from '../../test-utils/renderWithProviders';
import {screen, fireEvent, waitFor} from '@testing-library/react';

test('renders Markdown preview with formatted HTML for description', async () => {
    // Import TaskCreation without any mocking of MarkdownRenderer
    const {default: TaskCreation} = await import('./TaskCreation');
    renderWithProviders(
        <TaskCreation open={true} onClose={() => { }} courseId="1" />
    );
    const descriptionInput = screen.getByTestId('markdown-editor-textarea');
    fireEvent.change(descriptionInput, {target: {value: '**bold** _italic_'}});
    // Switch to Preview tab
    fireEvent.click(screen.getByTestId('markdown-preview-tab'));
    // The preview should render a <strong> and <em>
    await waitFor(() => {
        expect(screen.getByTestId('md-strong')).toHaveTextContent('bold');
        expect(screen.getByTestId('md-em')).toHaveTextContent('italic');
    });
});
