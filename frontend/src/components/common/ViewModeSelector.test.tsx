import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {render, screen, fireEvent} from '@testing-library/react';
import ViewModeSelector from './ViewModeSelector';

describe('ViewModeSelector Component', () => {
    test('renders ViewModeSelector correctly', () => {
        const mockOnChange = vi.fn();
        render(
            <BrowserRouter>
                <ViewModeSelector viewMode="grid" onChange={mockOnChange} />
            </BrowserRouter>
        );
        const tabsElement = screen.getByRole('tablist');
        expect(tabsElement).toBeInTheDocument();
    });

    test('calls onChange when view mode is changed', () => {
        const mockOnChange = vi.fn();
        render(
            <BrowserRouter>
                <ViewModeSelector viewMode="grid" onChange={mockOnChange} />
            </BrowserRouter>
        );
        const listTab = screen.getByRole('tab', {name: /list/i});
        fireEvent.click(listTab);
        expect(mockOnChange).toHaveBeenCalledWith(expect.anything(), 'list');
    });

    test('renders with correct initial view mode', () => {
        const mockOnChange = vi.fn();
        render(
            <BrowserRouter>
                <ViewModeSelector viewMode="list" onChange={mockOnChange} />
            </BrowserRouter>
        );
        const listTab = screen.getByRole('tab', {name: /list/i});
        expect(listTab).toHaveAttribute('aria-selected', 'true');
    });

    test('does not call onChange when the same view mode is selected', () => {
        const mockOnChange = vi.fn();
        render(
            <BrowserRouter>
                <ViewModeSelector viewMode="grid" onChange={mockOnChange} />
            </BrowserRouter>
        );
        const gridTab = screen.getByRole('tab', {name: /grid/i});
        fireEvent.click(gridTab);
        expect(mockOnChange).not.toHaveBeenCalled();
    });
});
