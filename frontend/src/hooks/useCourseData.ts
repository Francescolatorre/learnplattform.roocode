import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import apiService, { courseService } from '../services/apiService';
import { Course, CourseDetails, CourseError } from '../types/courseTypes';

// Explicitly type the service methods
interface CourseService {
    getAll(): Promise<Course[]>;
    getById(id: string | number): Promise<CourseDetails>;
    create(data: Partial<Course>): Promise<Course>;
    update(id: string | number, data: Partial<Course>): Promise<Course>;
    delete(id: string | number): Promise<void>;
}

// Ensure courseService matches the CourseService interface
const typedCourseService = courseService as CourseService;

interface UseCourseResult {
    // Course list data and operations
    courses: Course[];
    isLoadingCourses: boolean;
    coursesError: Error | null;
    refreshCourses: () => void;

    // Single course data and operations
    selectedCourse: CourseDetails | null;
    isLoadingCourse: boolean;
    courseError: Error | null;
    selectCourse: (id: string | number | null) => void;

    // Course operations
    createCourse: (courseData: Partial<Course>) => Promise<Course | null>;
    updateCourse: (id: string | number, courseData: Partial<Course>) => Promise<Course | null>;
    deleteCourse: (id: string | number) => Promise<boolean>;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    // Course enrollment operations
    enrollInCourse: (courseId: string | number) => Promise<any>;
    unenrollFromCourse: (courseId: string | number) => Promise<any>;
    isEnrolling: boolean;
    isUnenrolling: boolean;
}

// Helper function to convert unknown errors to Error
function normalizeError(error: unknown): Error {
    if (error instanceof Error) return error;
    if (typeof error === 'string') return new Error(error);
    return new Error('An unknown error occurred');
}

/**
 * Custom hook for working with course data
 */
export function useCourseData(): UseCourseResult {
    const queryClient = useQueryClient();
    const [selectedCourseId, setSelectedCourseId] = useState<string | number | null>(null);

    // Query for fetching all courses
    const {
        data: courses = [],
        isLoading: isLoadingCourses,
        error: rawCoursesError,
        refetch: refreshCourses
    } = useQuery<Course[], Error>(
        ['courses'],
        () => typedCourseService.getAll(),
        {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            initialData: [],
            onError: (error) => {
                console.error('Failed to fetch courses:', error);
            }
        }
    );

    // Query for fetching a single course
    const {
        data: selectedCourse = null,
        isLoading: isLoadingCourse,
        error: rawCourseError
    } = useQuery<CourseDetails | null>(
        ['course', selectedCourseId],
        () => selectedCourseId ? typedCourseService.getById(selectedCourseId) : null,
        {
            enabled: !!selectedCourseId,
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            initialData: null,
            onError: (error) => {
                console.error('Failed to fetch course details:', error);
            }
        }
    );

    // Normalize errors
    const coursesError = rawCoursesError ? normalizeError(rawCoursesError) : null;
    const courseError = rawCourseError ? normalizeError(rawCourseError) : null;

    // Create course mutation
    const createCourseMutation = useMutation<Course, Error, Partial<Course>>(
        (newCourse) => typedCourseService.create(newCourse),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['courses']);
            },
            onError: (error) => {
                console.error('Course creation failed:', error);
            }
        }
    );

    // Update course mutation
    const updateCourseMutation = useMutation<
        Course,
        Error,
        { id: string | number; data: Partial<Course> }
    >(
        ({ id, data }) => typedCourseService.update(id, data),
        {
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries(['courses']);
                queryClient.invalidateQueries(['course', variables.id]);
            },
            onError: (error) => {
                console.error('Course update failed:', error);
            }
        }
    );

    // Delete course mutation
    const deleteCourseMutation = useMutation<
        void,
        Error,
        string | number
    >(
        (id) => typedCourseService.delete(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['courses']);
                if (selectedCourseId) {
                    setSelectedCourseId(null);
                }
            },
            onError: (error) => {
                console.error('Course deletion failed:', error);
            }
        }
    );

    // Course enrollment mutations
    const enrollMutation = useMutation<
        any,
        Error,
        string | number
    >(
        (courseId) => apiService.post(`courses/${courseId}/enroll/`),
        {
            onSuccess: (_, courseId) => {
                queryClient.invalidateQueries(['courses']);
                queryClient.invalidateQueries(['course', courseId]);
            },
            onError: (error) => {
                console.error('Course enrollment failed:', error);
            }
        }
    );

    const unenrollMutation = useMutation<
        any,
        Error,
        string | number
    >(
        (courseId) => apiService.post(`courses/${courseId}/unenroll/`),
        {
            onSuccess: (_, courseId) => {
                queryClient.invalidateQueries(['courses']);
                queryClient.invalidateQueries(['course', courseId]);
            },
            onError: (error) => {
                console.error('Course unenrollment failed:', error);
            }
        }
    );

    // Helper functions to wrap mutations
    const createCourse = async (courseData: Partial<Course>): Promise<Course | null> => {
        try {
            return await createCourseMutation.mutateAsync(courseData);
        } catch (error) {
            console.error('Failed to create course:', error);
            return null;
        }
    };

    const updateCourse = async (id: string | number, courseData: Partial<Course>): Promise<Course | null> => {
        try {
            return await updateCourseMutation.mutateAsync({ id, data: courseData });
        } catch (error) {
            console.error('Failed to update course:', error);
            return null;
        }
    };

    const deleteCourse = async (id: string | number): Promise<boolean> => {
        try {
            await deleteCourseMutation.mutateAsync(id);
            return true;
        } catch (error) {
            console.error('Failed to delete course:', error);
            return false;
        }
    };

    const enrollInCourse = async (courseId: string | number) => {
        try {
            return await enrollMutation.mutateAsync(courseId);
        } catch (error) {
            console.error('Failed to enroll in course:', error);
            throw error;
        }
    };

    const unenrollFromCourse = async (courseId: string | number) => {
        try {
            return await unenrollMutation.mutateAsync(courseId);
        } catch (error) {
            console.error('Failed to unenroll from course:', error);
            throw error;
        }
    };

    // Select a course by ID
    const selectCourse = useCallback((id: string | number | null) => {
        setSelectedCourseId(id);
    }, []);

    return {
        // Course list data
        courses,
        isLoadingCourses,
        coursesError,
        refreshCourses,

        // Single course data
        selectedCourse,
        isLoadingCourse,
        courseError,
        selectCourse,

        // Course operations
        createCourse,
        updateCourse,
        deleteCourse,
        isCreating: createCourseMutation.isLoading,
        isUpdating: updateCourseMutation.isLoading,
        isDeleting: deleteCourseMutation.isLoading,

        // Enrollment operations
        enrollInCourse,
        unenrollFromCourse,
        isEnrolling: enrollMutation.isLoading,
        isUnenrolling: unenrollMutation.isLoading
    };
}
