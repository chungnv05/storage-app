import { useMemo } from 'react';
import useApiQuery from './useApiQuery';

/**
 * Cùng quy ước với PackagePricing.isValidAt ở backend:
 * validFrom tính là đã bao gồm, validTo không bao gồm, validTo null = vô thời hạn.
 */
function isPricingValidAt(row, moment) {
  if (moment < new Date(row.validFrom)) return false;
  return !row.validTo || moment < new Date(row.validTo);
}

/** Cùng công thức với PackagePricing.effectivePrice ở backend. */
function effectivePrice(basePrice, discountPercent) {
  return Math.round(basePrice * (1 - discountPercent / 100) * 100) / 100;
}

/**
 * Backend trả mỗi dòng là một cặp (gói, dòng giá) và không lọc theo thời gian,
 * nên một gói có thể xuất hiện nhiều lần. Gộp theo id và chỉ giữ dòng giá đang
 * hiệu lực; `pricing` là null nếu gói chưa có dòng giá nào hiệu lực.
 */
function groupPackages(rows) {
  const now = new Date();
  const byId = new Map();

  (rows || []).forEach(row => {
    if (!byId.has(row.id)) {
      byId.set(row.id, {
        id: row.id,
        name: row.name,
        storageLimitBytes: Number(row.storageLimitBytes),
        pricing: null
      });
    }

    if (isPricingValidAt(row, now)) {
      const basePrice = Number(row.basePrice);
      const discountPercent = Number(row.discountPercent);
      byId.get(row.id).pricing = {
        basePrice,
        discountPercent,
        effectivePrice: effectivePrice(basePrice, discountPercent),
        validFrom: row.validFrom,
        validTo: row.validTo
      };
    }
  });

  return [...byId.values()].sort((a, b) => a.storageLimitBytes - b.storageLimitBytes);
}

/**
 * @param fetchPackages adminApi.getAllPackages hoặc userApi.getPackages
 *   (hai endpoint trả cùng cấu trúc StoragePackageResponse[], khác quyền truy cập).
 */
export default function usePackages(fetchPackages) {
  const { data, loading, error, refetch } = useApiQuery(fetchPackages);
  const packages = useMemo(() => groupPackages(data), [data]);

  return {
    packages,
    loading,
    error,
    refetchPackages: refetch
  };
}
