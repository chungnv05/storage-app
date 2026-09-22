import { useState, useEffect, useCallback } from 'react';
import adminApi from '../api/adminApi';

function mapPackages(data) {
  return Array.isArray(data)
    ? data.map(p => {
        const basePrice = Number(p.basePrice ?? p.price ?? 0);
        const discountPercent = Number(p.discountPercent ?? p.discount ?? 0);
        const gb = p.storageLimitBytes
          ? Math.round(Number(p.storageLimitBytes) / (1024 * 1024 * 1024))
          : (p.gb || 0);

        return {
          ...p,
          id: p.id,
          name: p.name,
          storageLimitBytes: Number(p.storageLimitBytes) || 0,
          gb,
          basePrice,
          price: basePrice,
          discountPercent,
          discount: discountPercent,
          validFrom: p.validFrom || null,
          validTo: p.validTo || null,
          until: p.validTo ? String(p.validTo).split('T')[0] : (p.until || ''),
          active: p.active !== undefined ? p.active : true
        };
      })
    : [];
}

export default function usePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getAllPackages();
      setPlans(mapPackages(data));
    } catch (err) {
      console.error('Lỗi khi tải danh sách gói lưu trữ:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách gói lưu trữ');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlan = useCallback((planId, updatedFields) => {
    setPlans(prev =>
      prev.map(p => {
        if (p.id === planId) {
          const newGb = updatedFields.gb !== undefined ? Number(updatedFields.gb) : p.gb;
          const basePrice =
            updatedFields.basePrice !== undefined
              ? Number(updatedFields.basePrice)
              : (updatedFields.price !== undefined ? Number(updatedFields.price) : p.basePrice);
          const discountPercent =
            updatedFields.discountPercent !== undefined
              ? Number(updatedFields.discountPercent)
              : (updatedFields.discount !== undefined ? Number(updatedFields.discount) : p.discountPercent);
          const validTo =
            updatedFields.validTo !== undefined
              ? updatedFields.validTo
              : (updatedFields.until !== undefined ? updatedFields.until : p.validTo);

          return {
            ...p,
            ...updatedFields,
            gb: newGb,
            storageLimitBytes: newGb * (1024 * 1024 * 1024),
            basePrice,
            price: basePrice,
            discountPercent,
            discount: discountPercent,
            validTo,
            until: validTo ? String(validTo).split('T')[0] : ''
          };
        }
        return p;
      })
    );
    return true;
  }, []);

  useEffect(() => {
    let isMounted = true;

    adminApi
      .getAllPackages()
      .then(data => {
        if (!isMounted) return;
        setPlans(mapPackages(data));
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Lỗi khi tải danh sách gói lưu trữ:', err);
        setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách gói lưu trữ');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    plans,
    loading,
    error,
    refetchPlans: fetchPlans,
    updatePlan
  };
}
