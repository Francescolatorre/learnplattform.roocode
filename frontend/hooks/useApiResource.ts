import { useQuery } from 'react-query';
import axios from 'axios';
import { useMemo } from 'react';

export function useApiResource(resourceUrl: string, params: object) {
    const queryKey = useMemo(() => [resourceUrl, JSON.stringify(params)], [resourceUrl, params]);

    const { data, error, isLoading } = useQuery(
        queryKey,
        () => axios.get(resourceUrl, { params }).then((res) => res.data),
        {
            staleTime: 5000, // Avoid refetching within 5 seconds
            refetchOnWindowFocus: false, // Prevent duplicate fetches on window focus
            cacheTime: 10000, // Cache results to avoid redundant requests
        }
    );

    return { data, error, isLoading };
}
