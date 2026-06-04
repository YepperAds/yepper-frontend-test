// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// ── helpers ───────────────────────────────────────────────────
const CACHE_KEY = 'yepper_user';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedUser = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { user, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return user;
  } catch {
    return null;
  }
};

const setCachedUser = (user) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ user, ts: Date.now() }));
  } catch {}
};

const clearCachedUser = () => {
  try { localStorage.removeItem(CACHE_KEY); } catch {}
};

// ─────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user, setUser]                     = useState(() => getCachedUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getCachedUser());
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading]           = useState(() => {
    return !!localStorage.getItem('token') && !getCachedUser();
  });

  // ── Token helpers ─────────────────────────────────────────
  const setAuthToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      handleInvalidToken();
    }
  };

  const handleInvalidToken = () => {
    localStorage.removeItem('token');
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    clearCachedUser();
    setUser(null);
    setIsAuthenticated(false);
  };

  // ── Fetch current user from server ───────────────────────
  const getCurrentUser = async (retryCount = 0) => {
    const token = localStorage.getItem('token');
    if (!token) { setIsLoading(false); return; }

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const response = await authAPI.me();
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setCachedUser(response.data.user);
      } else {
        handleInvalidToken();
      }
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        handleInvalidToken();
      } else if (!status || status >= 500) {
        // Network error or server error — retry with shorter delays
        const delays = [1000, 2000];
        if (retryCount < delays.length) {
          setTimeout(() => getCurrentUser(retryCount + 1), delays[retryCount]);
          return;
        }
        // Give up but don't log user out — keep the cached session alive
        setIsLoading(false);
      } else {
        handleInvalidToken();
      }
    } finally {
      if (retryCount === 0) setIsLoading(false);
    }
  };

  // ── On mount: attach token and verify in background ──────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setIsLoading(false); return; }

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    getCurrentUser();
  }, []);

  // ── Auth actions ─────────────────────────────────────────
  const signup = async (email, password, name, returnUrl = null) => {
    const payload = { email, password, name };
    if (returnUrl) payload.returnUrl = returnUrl;
    const response = await authAPI.register(payload);
    return {
      success: true,
      requiresVerification: response.data.requiresVerification,
      maskedEmail: response.data.maskedEmail,
      message: response.data.message,
    };
  };

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token, user: userData } = response.data;
    if (!token || !userData) throw new Error('Invalid response from server');
    setAuthToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    setCachedUser(userData);
    return { success: true, user: userData };
  };

  const logout = () => handleInvalidToken();

  const handleAutoLogin = async (token) => {
    setAuthToken(token);
    const response = await authAPI.me();
    if (response.data.success && response.data.user) {
      setUser(response.data.user);
      setIsAuthenticated(true);
      setCachedUser(response.data.user);
      return { success: true, user: response.data.user };
    }
    handleInvalidToken();
    throw new Error('Auto-login failed');
  };

  const retryAuthentication = () => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      setIsLoading(true);
      getCurrentUser();
    }
  };

  return (
    <AuthContext.Provider value={{
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
      token,
    }}>
      {children}
    </AuthContext.Provider>
  );
};