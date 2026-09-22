import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import UnauthorizedPage from '../pages/error/UnauthorizedPage.jsx';

/**
 * Route Guard bảo vệ các route yêu cầu xác thực và phân quyền theo Role.
 * @param {React.ReactNode} children - Nội dung hoặc Layout cần bảo vệ
 * @param {string|string[]} allowedRoles - Danh sách role được phép truy cập (ví dụ: 'ADMIN' hoặc ['USER', 'ADMIN'])
 * @param {string} [fallbackPath] - Đường dẫn chuyển hướng nếu không đủ quyền (tùy chọn)
 */
function ProtectedRoute({ children, allowedRoles, fallbackPath }) {
  const { isInitialized, isAuthenticated, login, hasAnyRole } = useAuth();

  // Tự động chuyển hướng sang trang đăng nhập nếu chưa xác thực
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      login();
    }
  }, [isInitialized, isAuthenticated, login]);

  // Hiển thị trạng thái đang khởi tạo Keycloak
  if (!isInitialized) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary me-2" role="status" style={{ width: '1.5rem', height: '1.5rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2 fw-bold">Đang khởi tạo...</span>
      </div>
    );
  }

  // Hiển thị trạng thái đang chuyển hướng sang trang đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary me-2" role="status" style={{ width: '1.5rem', height: '1.5rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2 fw-bold">Đang chuyển hướng sang đăng nhập...</span>
      </div>
    );
  }

  // Kiểm tra quyền theo role nếu route có yêu cầu allowedRoles
  if (allowedRoles) {
    const rolesList = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const isAuthorized = hasAnyRole(rolesList);

    if (!isAuthorized) {
      if (fallbackPath) {
        return <Navigate to={fallbackPath} replace />;
      }
      return <UnauthorizedPage allowedRoles={rolesList} />;
    }
  }

  // Trả về giao diện trang được bảo vệ nếu hợp lệ
  return children;
}

/**
 * Route Guard tiện ích dành cho khu vực người dùng (USER)
 */
export function UserRoute({ children, fallbackPath }) {
  return (
    <ProtectedRoute allowedRoles={['USER']} fallbackPath={fallbackPath}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Route Guard tiện ích dành riêng cho khu vực quản trị (ADMIN)
 */
export function AdminRoute({ children, fallbackPath }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']} fallbackPath={fallbackPath}>
      {children}
    </ProtectedRoute>
  );
}

export default ProtectedRoute;
