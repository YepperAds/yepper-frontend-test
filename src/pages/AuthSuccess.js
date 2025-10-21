import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleAutoLogin } = useAuth(); // Changed from 'login' to 'handleAutoLogin'
  const [error, setError] = useState(null);

  useEffect(() => {
    const processAuth = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      // Handle error from OAuth callback
      if (error) {
        navigate('/login');
        return;
      }

      // Handle successful authentication
      if (token) {
        try {
          const result = await handleAutoLogin(token);
          
          if (result.success) {
            navigate('/');
          } else {
            throw new Error('Authentication failed');
          }
        } catch (err) {
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    processAuth();
  }, [searchParams, handleAutoLogin, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl"/>
        <p className="text-gray-600 mt-4">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;