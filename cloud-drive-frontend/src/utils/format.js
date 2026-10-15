const GB = 1e9;

export function formatSize(bytes) {
  if (bytes === undefined || bytes === null) return '0 B';
  const n = Number(bytes);
  if (n >= GB) return (n / GB).toFixed(2) + ' GB';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' MB';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + ' KB';
  return n + ' B';
}

export function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount || 0);
}

/** Nhận timestamp hoặc chuỗi ISO (LocalDateTime từ backend). */
export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN');
}

export function usagePercent(usedBytes, limitBytes) {
  if (!limitBytes || limitBytes <= 0) return 0;
  return Math.min(100, Math.round((usedBytes / limitBytes) * 100));
}

export function packageBadgeVariant(packageName) {
  const key = (packageName || '').toLowerCase();
  if (key.includes('pro')) return 'purple';
  if (key.includes('premium') || key.includes('plus')) return 'blue';
  return 'gray';
}
