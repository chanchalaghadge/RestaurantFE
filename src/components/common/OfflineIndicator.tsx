import { useState, useEffect } from 'react';
import './OfflineIndicator.css';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      // Hide the success message after 3 seconds
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className={`offline-indicator ${isOnline ? 'online' : 'offline'}`}>
      <div className="offline-indicator-content">
        <div className="offline-icon">
          {isOnline ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 1l22 22" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 20h.01" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <div className="offline-message">
          {isOnline ? (
            <span>You're back online! All systems operational.</span>
          ) : (
            <span>You're offline. Some features may be limited.</span>
          )}
        </div>
        <button 
          className="offline-close"
          onClick={() => setShowBanner(false)}
          aria-label="Close notification"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`connection-status ${isOnline ? 'online' : 'offline'}`} title={isOnline ? 'Online' : 'Offline'}>
      <div className="status-dot" />
      <span className="status-text">{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
}