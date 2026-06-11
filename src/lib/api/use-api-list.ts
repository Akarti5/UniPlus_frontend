import { useQuery } from "@tanstack/react-query";

/**
 * Hook wrapper for fetching lists from the API.
 * Handles paginated responses and normalizes data structure.
 */
export function useApiList<T>(
  key: readonly unknown[],
  fetcher: () => Promise<T[] | { data?: T[]; items?: T[]; success?: boolean }>,
  fallback?: T[],
) {
  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const res = await fetcher();
      // Handle different response formats
      if (Array.isArray(res)) return res;
      if (res?.data && Array.isArray(res.data)) return res.data;
      if (res?.items && Array.isArray(res.items)) return res.items;
      return [];
    },
    retry: 2,
    staleTime: 30_000,
  });

  const isFallback = !!query.error && !query.data;
  return {
    data: (query.data || fallback || []) as T[],
    isLoading: query.isLoading,
    isFallback,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

/**
 * Hook for single item fetching from the API
 */
export function useApiItem<T>(
  key: readonly unknown[],
  fetcher: () => Promise<T | { data?: T; success?: boolean }>,
  fallback?: T,
) {
  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const res = await fetcher();
      if (res && typeof res === "object" && "data" in res) {
        return (res as any).data;
      }
      return res;
    },
    retry: 2,
    staleTime: 30_000,
  });

  const isFallback = !!query.error && !query.data;
  return {
    data: (query.data || fallback) as T | undefined,
    isLoading: query.isLoading,
    isFallback,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
