import { useCallback } from 'react';
import adminApi from '../api/adminApi';
import useApiQuery from './useApiQuery';

export default function useAdminUsers() {
  const { data, setData, loading, error, refetch } = useApiQuery(adminApi.getAllUsers);

  /**
   * Đổi trạng thái tài khoản (ACTIVE | LOCKED). Chỉ cập nhật danh sách sau khi
   * backend xác nhận thành công; lỗi được ném lại để nơi gọi hiển thị.
   */
  const updateUserStatus = useCallback(async (userId, status) => {
    await adminApi.updateUserStatus(userId, status);
    setData(prev => (prev || []).map(u => (u.id === userId ? { ...u, status } : u)));
  }, [setData]);

  return {
    users: data || [],
    loading,
    error,
    updateUserStatus,
    refetchUsers: refetch
  };
}
