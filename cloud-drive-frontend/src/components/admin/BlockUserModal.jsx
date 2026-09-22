import React from 'react';
import Modal from '../common/Modal.jsx';

function BlockUserModal({ isOpen, onClose, user, onConfirm }) {
  if (!user) return null;

  const isBlocked = user.blocked;
  const title = isBlocked ? 'Mở khóa tài khoản?' : 'Khóa tài khoản?';

  const message = isBlocked
    ? `${user.name} (${user.email}) sẽ có thể đăng nhập và tiếp tục sử dụng lại dịch vụ.`
    : `${user.name} (${user.email}) sẽ không thể đăng nhập hoặc truy cập tài liệu. Dữ liệu được giữ nguyên.`;

  const handleConfirm = () => {
    onConfirm(user.id);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="mb-4">{message}</p>

      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-light flex-grow-1"
          onClick={onClose}
        >
          Hủy bỏ
        </button>

        <button
          type="button"
          className={`btn ${isBlocked ? 'btn-primary' : 'btn-danger'} flex-grow-1`}
          style={!isBlocked ? { background: '#dc3545', borderColor: '#dc3545', color: '#fff' } : {}}
          onClick={handleConfirm}
        >
          {isBlocked ? 'Mở khóa tài khoản' : 'Xác nhận khóa'}
        </button>
      </div>
    </Modal>
  );
}

export default BlockUserModal;
