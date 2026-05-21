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

  const API_URL = process.env.REACT_APP_API_URL || 'https://yepper-backend-test.onrender.com';

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
      const response = await axios.get(`${API_URL}/api/auth/me`);
      
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        handleInvalidToken();
      }
    } catch (error) {
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 401) {
          handleInvalidToken();
        } else if (status >= 500) {
          // Server error - retry once after a delay
          if (retryCount < 1) {
            setTimeout(() => getCurrentUser(retryCount + 1), 2000);
            return;
          } else {
            setIsLoading(false);
          }
        } else {
          handleInvalidToken();
        }
      } else if (error.request) {
        // Network error (server not responding)
        if (retryCount < 2) {
          setTimeout(() => getCurrentUser(retryCount + 1), (retryCount + 1) * 2000);
          return;
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } finally {
      if (retryCount === 0) {
        setIsLoading(false);
      }
    }
  };

  const handleInvalidToken = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const setAuthToken = (token) => {
    if (token) {
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
      handleInvalidToken();
      throw new Error('Auto-login failed');
    }
  };

  // UPDATED: Now accepts optional returnUrl parameter
  const signup = async (email, password, name, returnUrl = null) => {
    try {
      const requestData = {
        email,
        password,
        name
      };
      
      // Add returnUrl if provided
      if (returnUrl) {
        requestData.returnUrl = returnUrl;
      }

      const response = await axios.post(`${API_URL}/api/auth/register`, requestData);

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
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      setAuthToken(token);
      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
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
    handleInvalidToken();
  };

  const retryAuthentication = () => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      setIsLoading(true);
      getCurrentUser();
    }
  };

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
    token: localStorage.getItem('token')
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};