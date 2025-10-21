// NetworkStatus.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const { isAuthenticated, retryAuthentication } = useAuth();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (showRetryButton) {
        handleRetry();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showRetryButton]);

  useEffect(() => {
    // Show retry button if we have a token but not authenticated
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated && isOnline) {
      const timer = setTimeout(() => {
        setShowRetryButton(true);
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    } else {
      setShowRetryButton(false);
    }
  }, [isAuthenticated, isOnline]);

  const handleRetry = () => {
    setShowRetryButton(false);
    retryAuthentication();
  };

  if (!showRetryButton) return null;

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">Connection issue detected</span>
        </div>
        <button
          onClick={handleRetry}
          className="ml-3 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default NetworkStatus;