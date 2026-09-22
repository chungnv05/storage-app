import { useContext } from 'react';
import AuthContext from '../auth/AuthContext';

/**
 * Custom hook giúp truy cập các trạng thái và hàm từ AuthContext.
 * Yêu cầu: Component gọi hook này bắt buộc phải nằm bên trong <AuthProvider>.
 */
function useAuth() {
  const context = useContext(AuthContext);

  // Báo lỗi rõ ràng nếu dev quên bọc ứng dụng trong <AuthProvider>
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }

  return context;
}

export default useAuth;