/**
 * Service Worker Registration
 * Handles service worker registration for offline support
 */

export function register(): void {
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      if (navigator.serviceWorker) {
        navigator.serviceWorker.register(swUrl)
          .then((registration) => {
            console.log('Service Worker registered:', registration);

            // Check for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      // New content is available
                      console.log('New content is available; please refresh.');
                    } else {
                      // Content is cached for offline use
                      console.log('Content is cached for offline use.');
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.error('Error during service worker registration:', error);
          });
      }
    });
  }
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
