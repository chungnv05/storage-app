import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';
import Avatar from '../common/Avatar.jsx';
import Badge from '../common/Badge.jsx';
import useStorage from '../../hooks/useStorage.js';
import { formatSize, formatMoney, formatDate, GB } from '../../mock/utils.js';

function UserDetailModal({ isOpen, onClose, user, onBlockToggle }) {
  const { getPlan, getUserUsedBytes } = useStorage();
  const navigate = useNavigate();

  if (!user) return null;

  const plan = getPlan(user.plan);
  const used = getUserUsedBytes(user.id);
  const remaining = Math.max(0, plan.gb * GB - used);

  const details = [
    { label: 'Tổng dung lượng', value: `${plan.gb} GB` },
    { label: 'Đã sử dụng (gồm thùng rác)', value: formatSize(used) },
    { label: 'Dung lượng còn lại', value: formatSize(remaining) },
    { label: 'Tổng tiền đã thanh toán', value: formatMoney(user.paid || 0) },
    { label: 'Ngày đăng ký', value: formatDate(user.created) },
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
          <h3 className="mb-1">{user.name}</h3>
          <span className="small muted">{user.email}</span>
        </div>
      </div>

      <div className="mb-4 d-flex gap-2">
        <Badge variant="blue">{plan.name}</Badge>
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
