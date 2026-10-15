import { useState, useEffect, useCallback } from 'react';

/**
 * Gọi một hàm GET của API layer khi mount và cung cấp data/loading/error + refetch.
 * `fetcher` phải là tham chiếu ổn định (hàm của module api, không tạo mới mỗi render).
 */
export default function useApiQuery(fetcher) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetcher());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    let isMounted = true;

    fetcher()
      .then(result => {
        if (isMounted) setData(result);
      })
      .catch(err => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fetcher]);

  return { data, setData, loading, error, refetch };
}
