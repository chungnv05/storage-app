import React from 'react';
import Modal from '../common/Modal.jsx';

function DeleteConfirmModal({ isOpen, onClose, file, mode = 'trash', onConfirm }) {
  if (!file) return null;

  const isTrash = mode === 'trash';
  const isFolder = file.type === 'folder';

  const title = isTrash ? 'Chuyển vào thùng rác?' : 'Xóa vĩnh viễn?';

  const message = isTrash
    ? `“${file.name}”${isFolder ? ' và toàn bộ nội dung bên trong' : ''} sẽ được giữ trong 30 ngày. Người được chia sẻ sẽ tạm mất quyền truy cập.`
    : `“${file.name}” sẽ bị xóa vĩnh viễn${isFolder ? ' cùng toàn bộ nội dung con' : ''}. Thao tác này không thể hoàn tác và sẽ giải phóng dung lượng.`;

  const handleConfirm = () => {
    onConfirm(file);
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
          className="btn btn-danger flex-grow-1"
          style={{ background: '#dc3545', borderColor: '#dc3545', color: '#fff' }}
          onClick={handleConfirm}
        >
          {isTrash ? 'Chuyển vào thùng rác' : 'Xóa vĩnh viễn'}
        </button>
      </div>
    </Modal>
  );
}

export default DeleteConfirmModal;
