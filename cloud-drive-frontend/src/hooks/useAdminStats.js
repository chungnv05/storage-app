import adminApi from '../api/adminApi';
import useApiQuery from './useApiQuery';

export default function useAdminStats() {
  const { data, loading, error, refetch } = useApiQuery(adminApi.getStats);

  return {
    stats: data,
    loading,
    error,
    refetchStats: refetch
  };
}
