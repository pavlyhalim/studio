'use client';

import { useState, useEffect } from 'react';

/**
 * NetworkStatus displays a banner when the app goes offline.
 * Must be a client component to access navigator and window.
 */
export default function NetworkStatus() {
  // Initialize online state only on client
  const [online, setOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    // Server-render fallback: assume online
    return true;
  });

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-center py-2 text-black">
      You’re offline — some functionality may be limited.
    </div>
  );
}
