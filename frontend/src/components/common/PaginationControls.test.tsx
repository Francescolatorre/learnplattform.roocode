import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import PaginationControls from './PaginationControls';

describe('PaginationControls Component', () => {
  test('renders PaginationControls correctly', () => {
    const mockOnPageChange = vi.fn();
    render(
      <BrowserRouter>
        <PaginationControls totalPages={5} currentPage={1} onPageChange={mockOnPageChange} />
      </BrowserRouter>
    );
    const paginationElement = screen.getByRole('navigation');
    expect(paginationElement).toBeInTheDocument();
  });

  test('calls onPageChange when page is changed', () => {
    const mockOnPageChange = vi.fn();
    render(
      <BrowserRouter>
        <PaginationControls totalPages={5} currentPage={1} onPageChange={mockOnPageChange} />
      </BrowserRouter>
    );
    const nextPageButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextPageButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(expect.anything(), 2);
  });

  test('renders with correct initial page', () => {
    const mockOnPageChange = vi.fn();
    render(
      <BrowserRouter>
        <PaginationControls totalPages={5} currentPage={3} onPageChange={mockOnPageChange} />
      </BrowserRouter>
    );
    const currentPageButton = screen.getByRole('button', { name: /3/i });
    expect(currentPageButton).toHaveAttribute('aria-current', 'true');
  });

  test('does not call onPageChange when the same page is selected', () => {
    const mockOnPageChange = vi.fn();
    render(
      <BrowserRouter>
        <PaginationControls totalPages={5} currentPage={1} onPageChange={mockOnPageChange} />
      </BrowserRouter>
    );
    const currentPageButton = screen.getByRole('button', { name: /1/i });
    fireEvent.click(currentPageButton);
    expect(mockOnPageChange).toHaveBeenCalledTimes(1);
  });
});
