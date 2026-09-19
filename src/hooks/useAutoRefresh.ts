import { useEffect, useRef, useState } from 'react';

interface UseAutoRefreshOptions {
  interval?: number; // in milliseconds
  enabled?: boolean;
  onRefresh: () => Promise<void> | void;
}

export function useAutoRefresh({ interval = 30000, enabled = true, onRefresh }: UseAutoRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<number | null>(null);

  const refresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Auto-refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial refresh
    refresh();

    // Set up interval
    intervalRef.current = window.setInterval(() => {
      refresh();
    }, interval);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, enabled, onRefresh]);

  return {
    refresh,
    isRefreshing,
    lastRefresh,
    timeSinceRefresh: lastRefresh ? Date.now() - lastRefresh.getTime() : null
  };
}
