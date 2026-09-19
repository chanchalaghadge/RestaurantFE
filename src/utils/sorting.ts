/**
 * Table sorting utilities
 * Provides reusable sorting functions for all tables
 */

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

/**
 * Generic sorting function for arrays
 */
export function sortArray<T>(
  array: T[],
  key: keyof T,
  direction: SortDirection
): T[] {
  if (!direction) return array;

  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (aValue === bValue) return 0;

    let comparison = 0;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      // Fallback to string comparison
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Toggle sort direction
 */
export function toggleSortDirection(current: SortDirection): SortDirection {
  if (current === null) return 'asc';
  if (current === 'asc') return 'desc';
  return null;
}

/**
 * Get sort icon based on direction
 */
export function getSortIcon(direction: SortDirection): string {
  switch (direction) {
    case 'asc':
      return '↑';
    case 'desc':
      return '↓';
    default:
      return '↕';
  }
}