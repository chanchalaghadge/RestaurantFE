const CACHE_NAME = 'restaurant-fe-v2';
const OFFLINE_QUEUE_CACHE = 'restaurant-fe-queue-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/',
];

// IndexedDB for offline queue
const DB_NAME = 'RestaurantOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'requestQueue';

// Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Add request to queue
async function addToQueue(request) {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  const queueItem = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
    timestamp: Date.now()
  };

  store.add(queueItem);
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// Process queue when online
async function processQueue() {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const requests = await new Promise((resolve, reject) => {
      const getAll = store.getAll();
      getAll.onsuccess = () => resolve(getAll.result);
      getAll.onerror = () => reject(getAll.error);
    });

    for (const item of requests) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.method !== 'GET' ? item.body : undefined
        });

        if (response.ok) {
          await new Promise((resolve, reject) => {
            const deleteRequest = store.delete(item.id);
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
          });
        }
      } catch (error) {
        console.error('Failed to process queued request:', error);
      }
    }
  } catch (error) {
    console.error('Failed to process queue:', error);
  }
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network with queue
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests for caching
  if (event.request.method !== 'GET') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        // Queue failed non-GET requests
        await addToQueue(event.request);
        return new Response(JSON.stringify({ offline: true, queued: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Return offline fallback for HTML requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          // Return offline page for other requests
          return new Response('Offline - Data not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, OFFLINE_QUEUE_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Process queued requests when coming online
  processQueue();
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'PROCESS_QUEUE') {
    processQueue();
  }
});

// Listen for online event
self.addEventListener('online', () => {
  processQueue();
});
