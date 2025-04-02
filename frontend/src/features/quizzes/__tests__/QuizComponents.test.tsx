import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Quiz from '../Quiz'; // Update the path to match the actual location of the Quiz component
import React from 'react';
import { mockedApiService } from '../../../setupTests'; // Use global mocks

describe('Quiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders quiz questions', async () => {
    const mockQuiz = {
      id: 1,
      title: 'Sample Quiz',
      questions: [
        { id: 1, text: 'Question 1', options: ['Option A', 'Option B'] },
        { id: 2, text: 'Question 2', options: ['Option C', 'Option D'] },
      ],
    };

    mockedApiService.getQuiz.mockResolvedValue(mockQuiz);

    render(
      <BrowserRouter>
        <Quiz quizId={1} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sample Quiz/i)).toBeInTheDocument();
      expect(screen.getByText(/Question 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Option A/i)).toBeInTheDocument();
    });
  });

  it('submits quiz answers', async () => {
    const mockQuiz = {
      id: 1,
      title: 'Sample Quiz',
      questions: [{ id: 1, text: 'Question 1', options: ['Option A', 'Option B'] }],
    };

    const mockSubmitResponse = { success: true };

    mockedApiService.getQuiz.mockResolvedValue(mockQuiz);
    mockedApiService.submitQuiz.mockResolvedValue(mockSubmitResponse);

    render(
      <BrowserRouter>
        <Quiz quizId={1} />
      </BrowserRouter>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText(/Option A/i));
      fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
    });

    await waitFor(() => {
      expect(mockedApiService.submitQuiz).toHaveBeenCalledWith(1, { answers: [0] });
      expect(screen.getByText(/Quiz submitted successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error on quiz submission failure', async () => {
    mockedApiService.submitQuiz.mockRejectedValue(new Error('Failed to submit quiz'));

    render(
      <BrowserRouter>
        <Quiz quizId={1} />
      </BrowserRouter>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to submit quiz/i)).toBeInTheDocument();
    });
  });
});
