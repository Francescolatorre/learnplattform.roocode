import React from 'react';
import {screen, fireEvent} from '@testing-library/react';
import {renderWithProviders} from '@/test-utils/renderWithProviders';
import DashboardCourseCard from '../DashboardCourseCard';

describe('DashboardCourseCard', () => {
    const defaultProps = {
        courseTitle: 'Test Course Title',
        progress: {
            percentage: 75,
            completed_tasks: 3,
            total_tasks: 4,
            last_activity: '2025-06-25T12:32:00.735840Z',
        },
        courseId: '101',
    };

    it('renders the course title correctly', () => {
        renderWithProviders(<DashboardCourseCard {...defaultProps} />);
        expect(screen.getByText('Test Course Title')).toBeInTheDocument();
    });

    it('renders the progress indicator with correct percentage', () => {
        renderWithProviders(<DashboardCourseCard {...defaultProps} />);
        // Check for the progress text
        expect(screen.getByText('3 / 4 tasks completed')).toBeInTheDocument();
    });

    it('renders the last activity date when provided', () => {
        renderWithProviders(<DashboardCourseCard {...defaultProps} />);
        expect(screen.getByText(/Last activity:/)).toBeInTheDocument();
    });

    it('does not render last activity date when not provided', () => {
        const propsWithoutLastActivity = {
            ...defaultProps,
            progress: {
                ...defaultProps.progress,
                last_activity: undefined,
            },
        };
        renderWithProviders(<DashboardCourseCard {...propsWithoutLastActivity} />);
        expect(screen.queryByText(/Last activity:/)).not.toBeInTheDocument();
    });

    it('links to the correct course page', () => {
        renderWithProviders(<DashboardCourseCard {...defaultProps} />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/courses/101');
    });

    it('handles empty courseId gracefully', () => {
        const propsWithEmptyCourseId = {
            ...defaultProps,
            courseId: '',
        };
        renderWithProviders(<DashboardCourseCard {...propsWithEmptyCourseId} />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/courses/');
    });

    it('has proper accessibility attributes', () => {
        renderWithProviders(<DashboardCourseCard {...defaultProps} />);
        const card = screen.getByTestId('dashboard-course-card');
        expect(card).toBeInTheDocument();
    });
});
