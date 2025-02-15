import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CacheSettings {
  extendedCaching: boolean;
  staleTime: number;
  cacheTime: number;
  refetchOnWindowFocus: boolean;
  retryOnReconnect: boolean;
}

interface CacheContextType {
  settings: CacheSettings;
  isLoading: boolean;
  toggleExtendedCaching: () => void;
}

const defaultSettings: CacheSettings = {
  extendedCaching: true,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  retryOnReconnect: true,
};

const minimalSettings: CacheSettings = {
  extendedCaching: false,
  staleTime: 1 * 60 * 1000, // 1 minute
  cacheTime: 2 * 60 * 1000, // 2 minutes
  refetchOnWindowFocus: true,
  retryOnReconnect: true,
};

const CacheContext = createContext<CacheContextType | null>(null);

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<CacheSettings>(defaultSettings);

  const updateCacheMutation = useMutation({
    mutationFn: async (newSettings: CacheSettings) => {
      try {
        const res = await apiRequest("POST", "/api/admin/cache-settings", newSettings);
        return await res.json();
      } catch (error) {
        console.error('Failed to update cache settings:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Cache settings updated",
        description: "Application cache has been cleared and new settings applied.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update cache settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: savedSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/cache-settings"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/cache-settings");
        if (!res.ok) return defaultSettings;
        const data = await res.json();
        return data as CacheSettings;
      } catch (error) {
        console.error('Failed to fetch cache settings:', error);
        return defaultSettings;
      }
    },
  });

  useEffect(() => {
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, [savedSettings]);

  const toggleExtendedCaching = () => {
    const newSettings = settings.extendedCaching ? minimalSettings : defaultSettings;
    setSettings(newSettings);
    updateCacheMutation.mutate(newSettings);
  };

  return (
    <CacheContext.Provider
      value={{
        settings,
        isLoading,
        toggleExtendedCaching,
      }}
    >
      {children}
    </CacheContext.Provider>
  );
}

export function useCacheSettings() {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error("useCacheSettings must be used within a CacheProvider");
  }
  return context;
}