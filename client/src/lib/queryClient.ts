import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
        cache: 'default',
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      // Enhanced error logging with more context
      const errorDetails = {
        queryKey,
        type: error instanceof Error ? error.name : typeof error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
      console.error('Query error:', JSON.stringify(errorDetails, null, 2));
      throw error; // Re-throw to let React Query handle the error state
    }
  };

interface CacheSettings {
  staleTime: number;
  cacheTime: number;
  refetchOnWindowFocus: boolean;
  retryOnReconnect: boolean;
}

const defaultSettings: CacheSettings = {
  staleTime: 5 * 60 * 1000,
  cacheTime: 10 * 60 * 1000,
  refetchOnWindowFocus: false,
  retryOnReconnect: true,
};

// Get cache settings from localStorage or use defaults
const getCacheSettings = (): CacheSettings => {
  try {
    const savedSettings = localStorage.getItem('cacheSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings) as Partial<CacheSettings>;
      return {
        ...defaultSettings,
        ...parsed
      };
    }
  } catch (error) {
    console.error('Error parsing cache settings:', error);
  }
  return defaultSettings;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      ...getCacheSettings(),
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('network')) {
          return failureCount < 2;
        }
        return false;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// Update cache settings
export const updateCacheSettings = (settings: Partial<CacheSettings>) => {
  try {
    const currentSettings = getCacheSettings();
    const newSettings = {
      ...currentSettings,
      ...settings
    };

    const settingsString = JSON.stringify(newSettings);
    localStorage.setItem('cacheSettings', settingsString);

    queryClient.setDefaultOptions({
      queries: {
        ...queryClient.getDefaultOptions().queries,
        ...newSettings,
      },
    });
  } catch (error) {
    console.error('Error saving cache settings:', error);
    throw new Error('Failed to save cache settings');
  }
};