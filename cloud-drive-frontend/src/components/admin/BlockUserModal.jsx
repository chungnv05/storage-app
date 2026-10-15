import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';

function BlockUserModal({ isOpen, onClose, user, onConfirm }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!user) return null;

  const isBlocked = user.status === 'LOCKED';
  const title = isBlocked ? 'Mở khóa tài khoản?' : 'Khóa tài khoản?';

  const userName = user.fullName || user.email;
  const message = isBlocked
    ? `${userName} (${user.email}) sẽ có thể đăng nhập và tiếp tục sử dụng lại dịch vụ.`
    : `${userName} (${user.email}) sẽ không thể đăng nhập hoặc truy cập tài liệu. Dữ liệu được giữ nguyên.`;

  const handleClose = () => {
    if (!submitting) {
      setError(null);
      onClose();
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const nextStatus = isBlocked ? 'ACTIVE' : 'LOCKED';
      await onConfirm(user.id, nextStatus);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={submitting ? undefined : handleClose} title={title}>
      {error && (
        <div className="alert alert-danger py-2 small mb-3">
          {error}
        </div>
      )}

      <p className="mb-4">{message}</p>

      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-light flex-grow-1"
          onClick={handleClose}
          disabled={submitting}
        >
          Hủy bỏ
        </button>

        <button
          type="button"
          className={`btn ${isBlocked ? 'btn-primary' : 'btn-danger'} flex-grow-1`}
          style={!isBlocked ? { background: '#dc3545', borderColor: '#dc3545', color: '#fff' } : {}}
          onClick={handleConfirm}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Đang xử lý...
            </>
          ) : (
            isBlocked ? 'Mở khóa tài khoản' : 'Xác nhận khóa'
          )}
        </button>
      </div>
    </Modal>
  );
}

export default BlockUserModal;
