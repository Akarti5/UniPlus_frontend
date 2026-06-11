import { useQuery } from "@tanstack/react-query";

/**
 * Hook wrapper that calls the API and gracefully falls back to mock data
 * when the backend is unreachable (e.g. previewing without the API running).
 * Returns `isFallback: true` when the displayed data is from the mock source.
 */
export function useApiList<T>(
  key: readonly unknown[],
  fetcher: () => Promise<T[] | { data?: T[]; items?: T[] }>,
  fallback: T[],
) {
  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const res = await fetcher();
      if (Array.isArray(res)) return res;
      return (res?.data ?? res?.items ?? []) as T[];
    },
    retry: 0,
    staleTime: 30_000,
  });

  const isFallback = !!query.error;
  return {
    data: (query.data && query.data.length > 0 ? query.data : fallback) as T[],
    isLoading: query.isLoading,
    isFallback,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
