import React from 'react';
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';
import useStorage from '../../hooks/useStorage.js';
import { formatSize } from '../../mock/utils.js';

function FilePreviewModal({ isOpen, onClose, file, onShare, onProtect }) {
  const { getUser, currentUser } = useStorage();

  if (!file) return null;

  const owner = getUser(file.owner);
  const isOwner = file.owner === currentUser.id;

  const handleDownload = () => {
    // Simulated download or local blob download
    const blob = new Blob([`Nội dung mô phỏng cho tệp ${file.name}`], {
      type: 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={file.name}>
      <div className="text-center mb-4">
        <span
          className={`fileicon ${file.type}`}
          style={{ width: 64, height: 68, fontSize: 28 }}
        >
          <Icon name={file.type === 'document' ? 'file' : file.type} style={{ width: 32, height: 32 }} />
        </span>
      </div>

      <div className="d-flex justify-content-between small mb-3 border-bottom pb-2">
        <span className="muted">Chủ sở hữu</span>
        <b>{owner?.name || 'Chưa xác định'}</b>
      </div>

      <div className="d-flex justify-content-between small mb-3 border-bottom pb-2">
        <span className="muted">Dung lượng</span>
        <b>{formatSize(file.bytes)}</b>
      </div>

      <div className="d-flex justify-content-between small mb-4 border-bottom pb-2">
        <span className="muted">Định dạng</span>
        <b className="text-uppercase">{file.name.split('.').pop() || file.type}</b>
      </div>

      <div className="alert alert-light small mb-4">
        Đây là tài liệu minh họa giao diện. Bạn có thể tải xuống hoặc chia sẻ với người dùng khác trong prototype.
      </div>

      <div className="d-grid gap-2">
        <button
          type="button"
          className="btn btn-primary w-100"
          onClick={handleDownload}
        >
          <Icon name="down" /> Tải xuống
        </button>

        {isOwner && (
          <>
            <button
              type="button"
              className="btn btn-light w-100"
              onClick={() => {
                onClose();
                onProtect(file);
              }}
            >
              <Icon name="lock" /> {file.isLocked ? 'Bảo mật' : 'Mã hóa'}
            </button>

            <button
              type="button"
              className="btn btn-light w-100"
              onClick={() => {
                onClose();
                onShare(file);
              }}
            >
              <Icon name="share" /> Chia sẻ tài liệu
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

export default FilePreviewModal;
