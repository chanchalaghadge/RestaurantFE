import { useEffect, useCallback } from 'react';

/**
 * Hook to warn users when they attempt to navigate away with unsaved changes
 * @param hasUnsavedChanges - Whether there are unsaved changes
 * @param message - Custom warning message (default: "You have unsaved changes. Are you sure you want to leave?")
 */
export function useUnsavedChanges(hasUnsavedChanges: boolean, message: string = 'You have unsaved changes. Are you sure you want to leave?') {
  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = message;
      return message;
    }
  }, [hasUnsavedChanges, message]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload]);
}
