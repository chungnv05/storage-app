import { useCallback } from 'react';
import userApi from '../api/userApi';
import useApiQuery from './useApiQuery';

/** Hồ sơ của tài khoản đang đăng nhập (GET /api/user/me, chỉ dành cho role USER). */
export default function useCurrentUser() {
  const { data, loading, error, refetch } = useApiQuery(userApi.getCurrentUser);

  /**
   * PATCH /api/user/me trả void nên phải đọc lại hồ sơ để lấy dữ liệu đã lưu.
   * Lỗi được ném lại để form hiển thị.
   */
  const updateProfile = useCallback(async (fields) => {
    await userApi.updateCurrentUser(fields);
    await refetch();
  }, [refetch]);

  return {
    currentUser: data,
    loading,
    error,
    refetch,
    updateProfile
  };
}
