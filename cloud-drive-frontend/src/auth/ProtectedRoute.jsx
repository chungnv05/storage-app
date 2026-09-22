import React, { useEffect } from 'react';
import useAuth from '../hooks/useAuth';

function ProtectedRoute({ children }) {
  const { isInitialized, isAuthenticated, login } = useAuth();

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
        <span className="ms-2 fw-bold">Đang khởi tạo...</span>
      </div>
    );
  }

  // Hiển thị trạng thái đang chuyển hướng sang trang đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <span className="ms-2 fw-bold">Đang chuyển hướng...</span>
      </div>
    );
  }

  // Trả về giao diện trang được bảo vệ nếu đã đăng nhập
  return children;
}

export default ProtectedRoute;