import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import UserLayout from '../components/layout/UserLayout.jsx';
import AdminLayout from '../components/layout/AdminLayout.jsx';

import MyFilesPage from '../pages/user/MyFilesPage.jsx';
import SharedPage from '../pages/user/SharedPage.jsx';
import TrashPage from '../pages/user/TrashPage.jsx';
import PlansPage from '../pages/user/PlansPage.jsx';
import ProfilePage from '../pages/user/ProfilePage.jsx';
import NotificationsPage from '../pages/user/NotificationsPage.jsx';

import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx';
import AdminUsersPage from '../pages/admin/AdminUsersPage.jsx';
import AdminPlansPage from '../pages/admin/AdminPlansPage.jsx';
import AdminBroadcastPage from '../pages/admin/AdminBroadcastPage.jsx';

import ProtectedRoute from '../auth/ProtectedRoute.jsx';
import UnauthorizedPage from '../pages/error/UnauthorizedPage.jsx';
import useAuth from '../hooks/useAuth.js';

/**
 * Điều hướng thông minh tại trang chủ dựa trên Role người dùng
 */
function RootRedirect() {
  const { isAdmin, isUser } = useAuth();

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (isUser) {
    return <Navigate to="/files" replace />;
  }

  return <Navigate to="/403" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root redirects dựa trên role */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RootRedirect />
          </ProtectedRoute>
        }
      />

      <Route path="/403" element={<UnauthorizedPage />} />

      {/* User Workspace Routes - Yêu cầu role USER */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/files" element={<MyFilesPage />} />
        <Route path="/files/:folderId" element={<MyFilesPage />} />
        <Route path="/shared" element={<SharedPage />} />
        <Route path="/shared/:folderId" element={<SharedPage />} />
        <Route path="/trash" element={<TrashPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/storage" element={<Navigate to="/plans" replace />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* Admin Workspace Routes - Bắt buộc role ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="plans" element={<AdminPlansPage />} />
        <Route path="broadcast" element={<AdminBroadcastPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/files" replace />} />
    </Routes>
  );
}

export default AppRoutes;

