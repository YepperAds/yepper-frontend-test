// admin/context/AdminAuthContext.js
import React, { createContext, useContext, useState } from 'react';

const AdminAuthContext = createContext();
export const useAdminAuth = () => useContext(AdminAuthContext);

const STORAGE_KEY = 'yepper_admin_creds';

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try { return !!JSON.parse(localStorage.getItem(STORAGE_KEY))?.secret; } catch { return false; }
  });
  const [adminSecret, setAdminSecret] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.secret || ''; } catch { return ''; }
  });
  const [adminUser, setAdminUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.user || 'admin'; } catch { return 'admin'; }
  });

  const login = (secret, user = 'admin') => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ secret, user }));
    setAdminSecret(secret);
    setAdminUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAdminSecret('');
    setIsAuthenticated(false);
  };

  // Headers to attach to every admin API call
  const adminHeaders = {
    'x-admin-secret': adminSecret,
    'x-admin-user':   adminUser,
    'Content-Type':   'application/json',
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, adminSecret, adminUser, login, logout, adminHeaders }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
