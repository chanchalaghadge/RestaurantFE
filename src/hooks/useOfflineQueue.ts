import { useEffect } from 'react';

/**
 * Hook to manage offline queue operations
 * Registers service worker and processes queued requests when online
 */
export function useOfflineQueue() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);

          // Listen for service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  if (window.confirm('A new version is available. Would you like to update?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('Connection restored. Processing queued requests...');
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'PROCESS_QUEUE' });
      }
    };

    const handleOffline = () => {
      console.log('Connection lost. Requests will be queued.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Function to check if online
  const isOnline = () => navigator.onLine;

  // Function to get queue status
  const getQueueStatus = async () => {
    const DB_NAME = 'RestaurantOfflineDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'requestQueue';

    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const count = await new Promise<number>((resolve, reject) => {
        const countRequest = store.count();
        countRequest.onsuccess = () => resolve(countRequest.result);
        countRequest.onerror = () => reject(countRequest.error);
      });

      return { queued: count, online: navigator.onLine };
    } catch (error) {
      console.error('Failed to get queue status:', error);
      return { queued: 0, online: navigator.onLine };
    }
  };

  return { isOnline, getQueueStatus };
}
