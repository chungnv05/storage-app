import React from 'react';
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';
import Avatar from '../common/Avatar.jsx';
import Badge from '../common/Badge.jsx';
import { formatSize, formatDate, packageBadgeVariant } from '../../utils/format.js';

/** `user` là một UserResponse từ GET /api/admin/users. */
function UserDetailModal({ isOpen, onClose, user, onBlockToggle }) {
  if (!user) return null;

  const remaining = Math.max(0, user.storageLimitBytes - user.storageUsedBytes);
  const isBlocked = user.status === 'LOCKED';

  const details = [
    { label: 'Tổng dung lượng', value: formatSize(user.storageLimitBytes) },
    { label: 'Đã sử dụng', value: formatSize(user.storageUsedBytes) },
    { label: 'Dung lượng còn lại', value: formatSize(remaining) },
    { label: 'Vai trò', value: user.role },
    { label: 'Ngày tạo tài khoản', value: formatDate(user.createdAt) },
    { label: 'Số điện thoại', value: user.phone || 'Chưa cập nhật' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết người dùng">
      <div className="d-flex align-items-center gap-3 mb-4">
        <Avatar user={user} size="large" />
        <div>
          <h3 className="mb-1">{user.fullName || user.email}</h3>
          <span className="small muted">{user.email}</span>
        </div>
      </div>

      <div className="mb-4 d-flex gap-2">
        <Badge variant={packageBadgeVariant(user.packageName)}>{user.packageName}</Badge>
        <Badge variant={isBlocked ? 'red' : 'green'}>
          {isBlocked ? 'Đã khóa' : 'Đang hoạt động'}
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

      {/*
        TODO(BACKEND): Nút "Gửi ưu đãi" đã được gỡ vì chưa có API gửi thông báo cho một user
        (xem AdminBroadcastPage).
      */}
      <div className="d-flex gap-2 mt-4">
        <button
          type="button"
          className="btn btn-light flex-grow-1"
          onClick={() => {
            onClose();
            onBlockToggle(user);
          }}
        >
          <Icon name={isBlocked ? 'refresh' : 'lock'} />
          {isBlocked ? 'Mở khóa' : 'Khóa tài khoản'}
        </button>
      </div>
    </Modal>
  );
}

export default UserDetailModal;
