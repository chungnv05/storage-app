export const GB = 1e9;

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

export function formatDate(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('vi-VN');
}

export function calculateDaysRemaining(deletedTimestamp) {
  if (!deletedTimestamp) return 0;
  return Math.max(0, Math.ceil((deletedTimestamp + 30 * 864e5 - Date.now()) / 864e5));
}

export function calculateDiscountPrice(plan) {
  if (!plan) return 0;
  const isDiscountActive =
    plan.discount > 0 &&
    plan.until &&
    new Date(plan.until + 'T23:59:59').getTime() >= Date.now();
  if (isDiscountActive) {
    return Math.round(plan.price * (1 - plan.discount / 100));
  }
  return plan.price;
}

export function generateId() {
  return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

export function classifyFileType(file) {
  if (!file) return 'other';
  const name = file.name || '';
  const ext = name.split('.').pop().toLowerCase();
  const mime = (file.type || '').toLowerCase();

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return 'image';
  }
  if (mime.startsWith('video/') || ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext)) {
    return 'video';
  }
  if (
    mime.startsWith('application/pdf') ||
    ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'odt'].includes(ext)
  ) {
    return 'document';
  }
  return 'other';
}
