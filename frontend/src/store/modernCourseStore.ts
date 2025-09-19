/**
 * Modern Course Store with Service Integration
 *
 * Demonstrates the complete integration pattern between Zustand stores
 * and modern TypeScript services following PRD requirements.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { ServiceFactory } from '@/services/factory/serviceFactory';
import { ModernCourseService } from '@/services/resources/modernCourseService';
import { IStudentProgressSummary } from '@/types';
import { ICourse } from '@/types/course';
import { IPaginatedResponse } from '@/types/paginatedResponse';

import {
  withAsyncOperation,
  ServiceStoreSlice,
  createServiceSlice,
  StoreCache
} from './utils/serviceIntegration';
import {
  createCrudHooks,
  createPaginatedHook
} from './utils/storeHooks';

// Course filter interface for search and pagination
export interface CourseFilters {
  search?: string;
  status?: string;
  creator?: number | null;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// Course creation/update interfaces
export interface CreateCourseData {
  title: string;
  description: string;
  learning_objectives?: string;
  prerequisites?: string;
  status?: 'draft' | 'published' | 'archived';
  visibility?: 'public' | 'private';
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  id: number;
}

// Store state interface extending base service slice
interface CourseStoreState extends ServiceStoreSlice<ICourse[]> {
  // Pagination state
  totalCount: number;
  currentPage: number;
  pageSize: number;
  filters: CourseFilters;

  // Individual course data
  selectedCourse: ICourse | null;
  courseDetails: Record<number, ICourse>;

  // Progress tracking
  progressData: Record<number, IStudentProgressSummary[]>;

  // Actions
  fetchCourses: (filters?: CourseFilters) => Promise<IPaginatedResponse<ICourse> | null>;
  fetchCourseDetails: (courseId: number) => Promise<ICourse | null>;
  createCourse: (courseData: CreateCourseData) => Promise<ICourse | null>;
  updateCourse: (courseData: UpdateCourseData) => Promise<ICourse | null>;
  deleteCourse: (courseId: number) => Promise<boolean>;
  fetchStudentProgress: (courseId: number) => Promise<IStudentProgressSummary[] | null>;

  // Selection and filtering
  selectCourse: (course: ICourse | null) => void;
  setFilters: (filters: CourseFilters) => void;
  clearFilters: () => void;

  // Cache management
  invalidateCache: () => void;
  refreshCourse: (courseId: number) => Promise<ICourse | null>;
}

// Cache configuration
const courseCache = new StoreCache<ICourse[]>({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 10
});

const courseDetailsCache = new StoreCache<ICourse>({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 50
});

// Create the modern course store
export const useModernCourseStore = create<CourseStoreState>()(
  devtools(
    (set, _get) => ({
      // Base service slice state
      ...createServiceSlice<ICourse[]>([])((setSlice, _getSlice) => ({} as Record<string, unknown>)),

      // Pagination state
      totalCount: 0,
      currentPage: 1,
      pageSize: 10,
      filters: {},

      // Individual course data
      selectedCourse: null,
      courseDetails: {},

      // Progress data
      progressData: {},

      // Fetch courses with pagination and filtering
      fetchCourses: async (filters: CourseFilters = {}) => {
        const courseService = ServiceFactory.getInstance().getService(ModernCourseService);

        // Check cache first
        const cacheKey = JSON.stringify(filters);
        const cachedData = courseCache.get(cacheKey);
        if (cachedData) {
          set((state) => ({
            ...state,
            data: cachedData,
            lastUpdated: new Date()
          }));
          return null; // Return null to indicate cache hit
        }

        return withAsyncOperation(
          () => courseService.getCourses(filters),
          (loading) => set((state) => ({ ...state, isLoading: loading })),
          (error) => set((state) => ({ ...state, error })),
          (result) => {
            // Update cache
            courseCache.set(cacheKey, result.results);

            // Update store state
            set((state) => ({
              ...state,
              data: result.results,
              totalCount: result.count,
              currentPage: filters.page || 1,
              pageSize: filters.page_size || 10,
              filters: { ...state.filters, ...filters },
              lastUpdated: new Date()
            }));
          }
        );
      },

      // Fetch individual course details
      fetchCourseDetails: async (courseId: number) => {
        const courseService = ServiceFactory.getInstance().getService(ModernCourseService);

        // Check cache first
        const cachedCourse = courseDetailsCache.get(courseId.toString());
        if (cachedCourse) {
          set((state) => ({
            ...state,
            courseDetails: {
              ...state.courseDetails,
              [courseId]: cachedCourse
            }
          }));
          return cachedCourse;
        }

        return withAsyncOperation(
          () => courseService.getCourseDetails(courseId),
          (loading) => set((state) => ({ ...state, isLoading: loading })),
          (error) => set((state) => ({ ...state, error })),
          (result) => {
            // Update cache
            courseDetailsCache.set(courseId.toString(), result);

            // Update store state
            set((state) => ({
              ...state,
              courseDetails: {
                ...state.courseDetails,
                [courseId]: result
              }
            }));
          }
        );
      },

      // Create new course
      createCourse: async (courseData: CreateCourseData) => {
        const courseService = ServiceFactory.getInstance().getService(ModernCourseService);

        return withAsyncOperation(
          () => courseService.createCourse(courseData),
          (loading) => set((state) => ({ ...state, isLoading: loading })),
          (error) => set((state) => ({ ...state, error })),
          (result) => {
            // Invalidate cache and refresh courses
            courseCache.clear();

            // Add to current courses list
            set((state) => ({
              ...state,
              data: [result, ...state.data],
              totalCount: state.totalCount + 1
            }));
          }
        );
      },

      // Update existing course
      updateCourse: async (courseData: UpdateCourseData) => {
        const courseService = ServiceFactory.getInstance().getService(ModernCourseService);

        const { id, ...updateData } = courseData;

        return withAsyncOperation(
          () => courseService.updateCourse(id, updateData),
          (loading) => set((state) => ({ ...state, isLoading: loading })),
          (error) => set((state) => ({ ...state, error })),
          (result) => {
            // Update cache
            courseDetailsCache.set(id.toString(), result);
            courseCache.clear(); // Clear list cache

            // Update store state
            set((state) => ({
              ...state,
              data: state.data.map(course => course.id === id ? result : course),
              courseDetails: {
                ...state.courseDetails,
                [id]: result
              },
              selectedCourse: state.selectedCourse?.id === id ? result : state.selectedCourse
            }));
          }
        );
      },

      // Delete course
      deleteCourse: async (courseId: number) => {
        const courseService = ServiceFactory.getInstance().getService(ModernCourseService);

        const result = await withAsyncOperation(
          () => courseService.deleteCourse(courseId),
          (loading) => set((state) => ({ ...state, isLoading: loading })),
          (error) => set((state) => ({ ...state, error })),
          () => {
            // Clear caches
            courseCache.clear();
            courseDetailsCache.clear();

            // Remove from store state
            set((state) => ({
              ...state,
              data: state.data.filter(course => course.id !== courseId),
              courseDetails: Object.fromEntries(
                Object.entries(state.courseDetails).filter(([id]) => parseInt(id) !== courseId)
              ),
              selectedCourse: state.selectedCourse?.id === courseId ? null : state.selectedCourse,
              totalCount: Math.max(0, state.totalCount - 1)
            }));
          }
        );

        return result !== null;
      },

      // Fetch student progress for a course
      fetchStudentProgress: async (courseId: number) => {
        const courseService = ServiceFactory.getInstance().getService(ModernCourseService);

        return withAsyncOperation(
          () => courseService.getStudentProgress(courseId),
          (loading) => set((state) => ({ ...state, isLoading: loading })),
          (error) => set((state) => ({ ...state, error })),
          (result) => {
            set((state) => ({
              ...state,
              progressData: {
                ...state.progressData,
                [courseId]: result
              }
            }));
          }
        );
      },

      // Select a course
      selectCourse: (course: ICourse | null) => {
        set((state) => ({ ...state, selectedCourse: course }));
      },

      // Set search/filter criteria
      setFilters: (filters: CourseFilters) => {
        set((state) => ({ ...state, filters: { ...state.filters, ...filters } }));
      },

      // Clear all filters
      clearFilters: () => {
        set((state) => ({ ...state, filters: {} }));
      },

      // Cache management
      invalidateCache: () => {
        courseCache.clear();
        courseDetailsCache.clear();
      },

      // Refresh individual course
      refreshCourse: async (courseId: number) => {
        // Clear cache for this course
        courseDetailsCache.clear();

        // Fetch fresh data
        return get().fetchCourseDetails(courseId);
      }
    }),
    {
      name: 'modern-course-store',
      // Serialize only the essential state for debugging
      serialize: {
        options: {
          map: true
        }
      }
    }
  )
);

// Type-safe hooks for course operations
export const useCourseOperations = createCrudHooks(
  useModernCourseStore,
  {
    list: async (store, filters: CourseFilters) => {
      const result = await store.fetchCourses(filters);
      return result?.results || null;
    },
    get: async (store, id: string | number) => {
      return await store.fetchCourseDetails(Number(id));
    },
    create: async (store, params: CreateCourseData) => {
      return await store.createCourse(params);
    },
    update: async (store, params: { id: string | number; data: Partial<CreateCourseData> }) => {
      return await store.updateCourse({ id: Number(params.id), ...params.data });
    },
    delete: async (store, id: string | number) => {
      return await store.deleteCourse(Number(id));
    }
  }
);

// Paginated courses hook
export const usePaginatedCourses = createPaginatedHook(
  useModernCourseStore,
  {
    loadPage: async (store, page: number, filters: CourseFilters) => {
      const result = await store.fetchCourses({ ...filters, page });
      if (result) {
        return {
          items: result.results,
          totalCount: result.count,
          currentPage: page,
          pageSize: filters.page_size || 10
        };
      }
      return null;
    },
    setFilters: (store, filters: CourseFilters) => {
      store.setFilters(filters);
    }
  }
);

// Convenience hooks for common operations
export const useCourseList = () => {
  const { data: courses, isLoading, error, fetchCourses } = useModernCourseStore();
  return { courses, isLoading, error, fetchCourses };
};

export const useSelectedCourse = () => {
  const { selectedCourse, selectCourse, fetchCourseDetails } = useModernCourseStore();
  return { selectedCourse, selectCourse, fetchCourseDetails };
};

export const useCourseProgress = () => {
  const { progressData, fetchStudentProgress } = useModernCourseStore();
  return { progressData, fetchStudentProgress };
};

// Initialize service registration - ServiceFactory handles this automatically
export const initializeCourseStore = () => {
  // ServiceFactory automatically creates and manages service instances
  ServiceFactory.getInstance();
};