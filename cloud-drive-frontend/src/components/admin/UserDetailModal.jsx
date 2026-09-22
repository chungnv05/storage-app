import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';
import Avatar from '../common/Avatar.jsx';
import Badge from '../common/Badge.jsx';
import useStorage from '../../hooks/useStorage.js';
import { formatSize, formatDate, GB } from '../../mock/utils.js';

function UserDetailModal({ isOpen, onClose, user, onBlockToggle }) {
  const { getPlan, getUserUsedBytes } = useStorage();
  const navigate = useNavigate();

  if (!user) return null;

  const plan = getPlan(user.plan);
  const planName = user.packageName || plan?.name || 'Free';
  const used = user.storageUsedBytes !== undefined ? user.storageUsedBytes : getUserUsedBytes(user.id);
  const totalBytes = user.storageLimitBytes || (plan?.gb ? plan.gb * GB : 5 * GB);
  const totalGb = user.storageLimitBytes
    ? Math.round(user.storageLimitBytes / (1024 * 1024 * 1024))
    : (plan?.gb || 0);
  const remaining = Math.max(0, totalBytes - used);

  const planKey = (user.packageName || plan?.name || user.plan || '').toLowerCase();
  const badgeVariant = planKey.includes('pro')
    ? 'purple'
    : (planKey.includes('premium') || planKey.includes('plus'))
      ? 'blue'
      : 'gray';

  const details = [
    { label: 'Tổng dung lượng', value: `${totalGb} GB` },
    { label: 'Đã sử dụng', value: formatSize(used) },
    { label: 'Dung lượng còn lại', value: formatSize(remaining) },
    { label: 'Vai trò', value: user.role || 'USER' },
    { label: 'Ngày tạo tài khoản', value: formatDate(user.createdAt || user.created) },
    { label: 'Số điện thoại', value: user.phone || 'Chưa cập nhật' }
  ];

  const handleSendOffer = () => {
    onClose();
    navigate('/admin/broadcast', { state: { targetUserId: user.id } });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết người dùng">
      <div className="d-flex align-items-center gap-3 mb-4">
        <Avatar user={user} size="large" />
        <div>
          <h3 className="mb-1">{user.name || user.fullName}</h3>
          <span className="small muted">{user.email}</span>
        </div>
      </div>

      <div className="mb-4 d-flex gap-2">
        <Badge variant={badgeVariant}>{planName}</Badge>
        <Badge variant={user.blocked ? 'red' : 'green'}>
          {user.blocked ? 'Đã khóa' : 'Đang hoạt động'}
        </Badge>
      </div>

      {details.map(({ label, value }) => (
        <div
          key={label}
          className="d-flex justify-content-between gap-3 border-bottom py-3 small"
        >
          <span className="muted">{label}</span>
          <b className="text-end">{value}</b>
        </div>
      ))}

      <div className="d-flex gap-2 mt-4">
        <button
          type="button"
          className="btn btn-primary flex-grow-1"
          onClick={handleSendOffer}
        >
          <Icon name="bell" /> Gửi ưu đãi
        </button>

        <button
          type="button"
          className="btn btn-light"
          onClick={() => {
            onClose();
            onBlockToggle(user);
          }}
        >
          <Icon name={user.blocked ? 'refresh' : 'lock'} />
          {user.blocked ? 'Mở khóa' : 'Khóa tài khoản'}
        </button>
      </div>
    </Modal>
  );
}

export default UserDetailModal;
