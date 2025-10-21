// ProtectedRoute.js
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, allowUnauthorized = false }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !allowUnauthorized) {
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, allowUnauthorized]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated && !allowUnauthorized && shouldRedirect) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;