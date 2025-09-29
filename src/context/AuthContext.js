// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Set up axios interceptors for automatic token handling
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Add response interceptor to handle token expiration
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('Token expired or invalid, logging out...');
          handleInvalidToken();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const getCurrentUser = async (retryCount = 0) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('Fetching current user...');
      const response = await axios.get(`${API_URL}/api/auth/me`);
      
      if (response.data.success && response.data.user) {
        console.log('User authenticated successfully:', response.data.user.email);
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        console.log('Invalid response format:', response.data);
        handleInvalidToken();
      }
    } catch (error) {
      console.error('Get current user error:', error);
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 401) {
          console.log('Token is invalid or expired, removing...');
          handleInvalidToken();
        } else if (status >= 500) {
          // Server error - retry once after a delay
          if (retryCount < 1) {
            console.log('Server error, retrying in 2 seconds...');
            setTimeout(() => getCurrentUser(retryCount + 1), 2000);
            return;
          } else {
            console.log('Server still unavailable after retry');
            // Don't remove token, but set loading to false
            setIsLoading(false);
          }
        } else {
          // Other client errors (400, 403, etc.) - remove token
          handleInvalidToken();
        }
      } else if (error.request) {
        // Network error (server not responding)
        if (retryCount < 2) {
          console.log(`Network error, retrying in ${(retryCount + 1) * 2} seconds...`);
          setTimeout(() => getCurrentUser(retryCount + 1), (retryCount + 1) * 2000);
          return;
        } else {
          console.log('Network still unavailable after retries');
          // Don't remove token - server might just be starting up
          setIsLoading(false);
        }
      } else {
        console.log('Unexpected error, keeping token');
        setIsLoading(false);
      }
    } finally {
      // Only set loading to false if we're not retrying
      if (retryCount === 0) {
        setIsLoading(false);
      }
    }
  };

  const handleInvalidToken = () => {
    console.log('Handling invalid token - clearing auth state');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const setAuthToken = (token) => {
    if (token) {
      console.log('Setting auth token');
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      handleInvalidToken();
    }
  };

  const handleAutoLogin = async (token) => {
    try {
      setAuthToken(token);
      const response = await axios.get(`${API_URL}/api/auth/me`);
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, user: response.data.user };
      } else {
        throw new Error('Invalid token received');
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      handleInvalidToken();
      throw new Error('Auto-login failed');
    }
  };

  const signup = async (email, password, name) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
        name
      });

      return {
        success: true,
        requiresVerification: response.data.requiresVerification,
        maskedEmail: response.data.maskedEmail,
        message: response.data.message
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login...');
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      console.log('Login successful, setting auth state');
      setAuthToken(token);
      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed';
      const errorData = error.response?.data;
      
      if (errorData?.requiresVerification) {
        const verificationError = new Error(errorMessage);
        verificationError.requiresVerification = true;
        verificationError.maskedEmail = errorData.maskedEmail;
        throw verificationError;
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    console.log('Logging out user');
    handleInvalidToken();
  };

  const retryAuthentication = () => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      console.log('Retrying authentication...');
      setIsLoading(true);
      getCurrentUser();
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('Auth state changed:', {
      isAuthenticated,
      hasUser: !!user,
      userEmail: user?.email,
      isLoading,
      hasToken: !!localStorage.getItem('token')
    });
  }, [isAuthenticated, user, isLoading]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signup,
    login,
    logout,
    setAuthToken,
    getCurrentUser,
    handleAutoLogin,
    retryAuthentication,
    token: localStorage.getItem('token') // Add this line
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};