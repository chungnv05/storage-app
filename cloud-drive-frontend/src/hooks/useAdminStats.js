import { useState, useEffect, useCallback } from 'react';
import adminApi from '../api/adminApi';

export default function useAdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Lỗi khi tải thống kê hệ thống:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải thống kê hệ thống');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    adminApi
      .getStats()
      .then(data => {
        if (!isMounted) return;
        setStats(data);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Lỗi khi tải thống kê hệ thống:', err);
        setError(err?.response?.data?.message || err?.message || 'Không thể tải thống kê hệ thống');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    stats,
    loading,
    error,
    refetchStats: fetchStats
  };
}
