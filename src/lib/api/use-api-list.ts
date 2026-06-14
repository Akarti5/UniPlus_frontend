import { useQuery } from "@tanstack/react-query";

/** Normalize paginated / nested API list responses into a flat array. */
export function extractApiList<T = unknown>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object") {
    const root = res as Record<string, unknown>;
    if (Array.isArray(root.data)) return root.data as T[];
    if (root.data && typeof root.data === "object") {
      const nested = root.data as Record<string, unknown>;
      if (Array.isArray(nested.data)) return nested.data as T[];
      if (Array.isArray(nested.items)) return nested.items as T[];
    }
    if (Array.isArray(root.items)) return root.items as T[];
  }
  return [];
}

/**
 * Hook wrapper for fetching lists from the API.
 * Handles paginated responses and normalizes data structure.
 */
export function useApiList<T>(
  key: readonly unknown[],
  fetcher: () => Promise<any>,
  fallback?: T[],
) {
  const query = useQuery({
    queryKey: key,
    queryFn: async () => extractApiList<T>(await fetcher()),
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
