// admin/AdminApp.js  — mount this at /admin in the main React app
// OR run as a separate CRA app (just rename to App.js and update index.js)

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminUserDetail from './pages/AdminUserDetail';
import AdminGrants from './pages/AdminGrants';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated } = useAdminAuth();
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:userId" element={<AdminUserDetail />} />
          <Route path="grants" element={<AdminGrants />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}

export default AdminApp;
