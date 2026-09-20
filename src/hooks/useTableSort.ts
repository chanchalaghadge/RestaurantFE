/**
 * Custom hook for table sorting
 * Provides sorting state and functions for table components
 */

import { useState, useCallback, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export function useTableSort<T>(initialData: T[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });

  // Use useMemo to compute sorted data instead of storing in state
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return initialData;
    }

    const sorted = [...initialData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];
      
      if (aValue === bValue) return 0;
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [initialData, sortConfig.key, sortConfig.direction]);

  const handleSort = useCallback((key: keyof T) => {
    setSortConfig((prev) => {
      const newDirection = prev.direction === null ? 'asc' : prev.direction === 'asc' ? 'desc' : null;
      const newConfig: SortConfig = {
        key: String(key),
        direction: newDirection
      };
      return newConfig;
    });
  }, []);

  const resetSort = useCallback(() => {
    setSortConfig({ key: '', direction: null });
  }, []);

  const getSortIcon = () => {
    switch (sortConfig.direction) {
      case 'asc':
        return '↑';
      case 'desc':
        return '↓';
      default:
        return '↕';
    }
  };

  return {
    sortedData,
    sortConfig,
    handleSort,
    resetSort,
    getSortIcon
  };
}