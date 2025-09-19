/**
 * Type-Safe Store Hooks Factory
 *
 * Generates type-safe hooks for service-store interactions
 * following the patterns defined in the PRD
 */

import { useCallback } from 'react';
import { StoreApi, UseBoundStore } from 'zustand';

/**
 * Generic hook factory for async operations with loading states
 */
export interface AsyncOperationHook<TParams, TResult> {
  execute: (params: TParams) => Promise<TResult | null>;
  isLoading: boolean;
  error: string | null;
  data: TResult | null;
  lastUpdated: Date | null;
}

/**
 * Factory for creating type-safe async operation hooks
 */
export function createAsyncOperationHook<TStore, TParams, TResult>(
  useStore: UseBoundStore<StoreApi<TStore>>,
  operation: (store: TStore, params: TParams) => Promise<TResult | null>
) {
  return (): AsyncOperationHook<TParams, TResult> => {
    const store = useStore();
    const isLoading = (store as any).isLoading || false;
    const error = (store as any).error || null;
    const data = (store as any).data || null;
    const lastUpdated = (store as any).lastUpdated || null;

    const execute = useCallback(
      async (params: TParams): Promise<TResult | null> => {
        return await operation(store, params);
      },
      [store]
    );

    return {
      execute,
      isLoading,
      error,
      data,
      lastUpdated,
    };
  };
}

/**
 * Factory for creating CRUD operation hooks
 */
export interface CrudOperationHooks<TEntity, TCreateParams, TUpdateParams, TFilters> {
  useList: () => AsyncOperationHook<TFilters, TEntity[]>;
  useGet: () => AsyncOperationHook<string | number, TEntity>;
  useCreate: () => AsyncOperationHook<TCreateParams, TEntity>;
  useUpdate: () => AsyncOperationHook<{ id: string | number; data: TUpdateParams }, TEntity>;
  useDelete: () => AsyncOperationHook<string | number, boolean>;
}

/**
 * Creates a complete set of CRUD hooks for an entity
 */
export function createCrudHooks<TStore, TEntity, TCreateParams, TUpdateParams, TFilters>(
  useStore: UseBoundStore<StoreApi<TStore>>,
  operations: {
    list: (store: TStore, filters: TFilters) => Promise<TEntity[] | null>;
    get: (store: TStore, id: string | number) => Promise<TEntity | null>;
    create: (store: TStore, params: TCreateParams) => Promise<TEntity | null>;
    update: (
      store: TStore,
      params: { id: string | number; data: TUpdateParams }
    ) => Promise<TEntity | null>;
    delete: (store: TStore, id: string | number) => Promise<boolean | null>;
  }
): CrudOperationHooks<TEntity, TCreateParams, TUpdateParams, TFilters> {
  return {
    useList: createAsyncOperationHook(useStore, operations.list),
    useGet: createAsyncOperationHook(useStore, operations.get),
    useCreate: createAsyncOperationHook(useStore, operations.create),
    useUpdate: createAsyncOperationHook(useStore, operations.update),
    useDelete: createAsyncOperationHook(useStore, operations.delete),
  };
}

/**
 * Hook factory for optimistic updates
 */
export interface OptimisticUpdateHook<TParams, TResult> {
  execute: (params: TParams, optimisticData?: Partial<TResult>) => Promise<TResult | null>;
  rollback: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Creates hooks with optimistic update support
 */
export function createOptimisticUpdateHook<TStore, TParams, TResult>(
  useStore: UseBoundStore<StoreApi<TStore>>,
  operation: (store: TStore, params: TParams) => Promise<TResult | null>,
  updateOptimistically: (store: TStore, optimisticData: Partial<TResult>) => void,
  rollbackOptimistic: (store: TStore) => void
) {
  return (): OptimisticUpdateHook<TParams, TResult> => {
    const store = useStore();
    const isLoading = (store as any).isLoading || false;
    const error = (store as any).error || null;

    const execute = useCallback(
      async (params: TParams, optimisticData?: Partial<TResult>): Promise<TResult | null> => {
        try {
          // Apply optimistic update if provided
          if (optimisticData) {
            updateOptimistically(store, optimisticData);
          }

          // Execute actual operation
          const result = await operation(store, params);

          return result;
        } catch (error) {
          // Rollback optimistic update on error
          if (optimisticData) {
            rollbackOptimistic(store);
          }
          throw error;
        }
      },
      [store, updateOptimistically, rollbackOptimistic, operation]
    );

    const rollback = useCallback(() => {
      rollbackOptimistic(store);
    }, [store, rollbackOptimistic]);

    return {
      execute,
      rollback,
      isLoading,
      error,
    };
  };
}

/**
 * Hook factory for pagination support
 */
export interface PaginatedHook<TItem, TFilters> {
  items: TItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  loadPage: (page: number) => Promise<void>;
  loadMore: () => Promise<void>;
  setFilters: (filters: TFilters) => void;
  refresh: () => Promise<void>;
}

/**
 * Creates paginated data hooks
 */
export function createPaginatedHook<TStore, TItem, TFilters>(
  useStore: UseBoundStore<StoreApi<TStore>>,
  operations: {
    loadPage: (
      store: TStore,
      page: number,
      filters: TFilters
    ) => Promise<{
      items: TItem[];
      totalCount: number;
      currentPage: number;
      pageSize: number;
    } | null>;
    setFilters: (store: TStore, filters: TFilters) => void;
  }
) {
  return (initialFilters: TFilters): PaginatedHook<TItem, TFilters> => {
    const store = useStore();
    const state = store as any;

    const items = state.items || [];
    const totalCount = state.totalCount || 0;
    const currentPage = state.currentPage || 1;
    const pageSize = state.pageSize || 10;
    const totalPages = Math.ceil(totalCount / pageSize);
    const isLoading = state.isLoading || false;
    const error = state.error || null;

    const loadPage = useCallback(
      async (page: number) => {
        await operations.loadPage(store, page, state.filters || initialFilters);
      },
      [store, state.filters, initialFilters]
    );

    const loadMore = useCallback(async () => {
      if (currentPage < totalPages) {
        await loadPage(currentPage + 1);
      }
    }, [currentPage, totalPages, loadPage]);

    const setFilters = useCallback(
      (filters: TFilters) => {
        operations.setFilters(store, filters);
      },
      [store]
    );

    const refresh = useCallback(async () => {
      await loadPage(1);
    }, [loadPage]);

    return {
      items,
      totalCount,
      currentPage,
      pageSize,
      totalPages,
      isLoading,
      error,
      loadPage,
      loadMore,
      setFilters,
      refresh,
    };
  };
}

/**
 * Hook factory for real-time data subscriptions
 */
export interface SubscriptionHook<TData> {
  data: TData | null;
  isConnected: boolean;
  error: string | null;
  subscribe: () => void;
  unsubscribe: () => void;
}

/**
 * Creates hooks for real-time data subscriptions
 */
export function createSubscriptionHook<TStore, TData>(
  useStore: UseBoundStore<StoreApi<TStore>>,
  operations: {
    subscribe: (
      store: TStore,
      onData: (data: TData) => void,
      onError: (error: string) => void
    ) => () => void;
  }
) {
  return (): SubscriptionHook<TData> => {
    const store = useStore();
    const state = store as any;

    const data = state.subscriptionData || null;
    const isConnected = state.isSubscriptionConnected || false;
    const error = state.subscriptionError || null;

    const subscribe = useCallback(() => {
      const cleanup = operations.subscribe(
        store,
        (data: TData) => {
          // Update store with new data
          if ('setSubscriptionData' in (store as object)) {
            (store as any).setSubscriptionData(data);
          }
        },
        (error: string) => {
          // Update store with error
          if ('setSubscriptionError' in (store as object)) {
            (store as any).setSubscriptionError(error);
          }
        }
      );

      // Store cleanup function
      if ('setSubscriptionCleanup' in (store as object)) {
        (store as any).setSubscriptionCleanup(cleanup);
      }
    }, [store]);

    const unsubscribe = useCallback(() => {
      const cleanup = (state as any).subscriptionCleanup;
      if (cleanup) {
        cleanup();
        if ('setSubscriptionCleanup' in (store as object)) {
          (store as any).setSubscriptionCleanup(null);
        }
      }
    }, [store, state.subscriptionCleanup]);

    return {
      data,
      isConnected,
      error,
      subscribe,
      unsubscribe,
    };
  };
}
