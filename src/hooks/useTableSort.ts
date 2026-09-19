/**
 * Custom hook for table sorting
 * Provides sorting state and functions for table components
 */

import { useState, useCallback, useEffect } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export function useTableSort<T>(initialData: T[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });
  const [sortedData, setSortedData] = useState<T[]>(initialData);

  // Update sorted data when initialData changes
  useEffect(() => {
    setSortedData(initialData);
  }, [initialData]);

  const handleSort = useCallback((key: keyof T) => {
    setSortConfig((prev) => {
      const newDirection = prev.direction === null ? 'asc' : prev.direction === 'asc' ? 'desc' : null;
      const newConfig: SortConfig = {
        key: String(key),
        direction: newDirection
      };
      
      if (newDirection) {
        const sorted = [...initialData].sort((a, b) => {
          const aValue = a[key];
          const bValue = b[key];
          
          if (aValue === bValue) return 0;
          
          let comparison = 0;
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue);
          } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
          } else {
            comparison = String(aValue).localeCompare(String(bValue));
          }
          
          return newDirection === 'asc' ? comparison : -comparison;
        });
        setSortedData(sorted);
      } else {
        setSortedData(initialData);
      }
      
      return newConfig;
    });
  }, [initialData]);

  const resetSort = useCallback(() => {
    setSortConfig({ key: '', direction: null });
    setSortedData(initialData);
  }, [initialData]);

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