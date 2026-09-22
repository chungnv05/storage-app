import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';
import Badge from '../common/Badge.jsx';
import useStorage from '../../hooks/useStorage.js';

function ProtectionModal({
  isOpen,
  onClose,
  file,
  mode = 'encrypt', // 'encrypt' | 'unlock' | 'manage'
  onSuccess
}) {
  const { protectItem, unlockItem, relockAll, isItemLocked } = useStorage();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!file) return null;

  const isFolder = file.type === 'folder';
  const locked = isItemLocked(file);

  const handleEncrypt = (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Mật khẩu bảo vệ phải có ít nhất 8 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    protectItem(file.id, password);
    setPassword('');
    setConfirmPassword('');
    onClose();
    if (onSuccess) onSuccess();
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    setError('');

    const ok = unlockItem(file.id, password);
    if (ok) {
      setPassword('');
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setError('Mật khẩu không đúng. Vui lòng thử lại.');
    }
  };

  // Determine which sub-view to render
  if (mode === 'unlock') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Nhập mật khẩu để mở">
        <div className="lock-intro">
          <Icon name="lock" />
          <h3>{file.name}</h3>
          <p className="small muted">
            {isFolder ? 'Thư mục này' : 'Tài liệu này'} được bảo vệ bằng mật khẩu.
            Mở khóa sẽ có hiệu lực trong phiên làm việc hiện tại.
          </p>
        </div>

        <form onSubmit={handleUnlock}>
          <div className="form-field">
            <label className="form-label" htmlFor="unlock-password">
              Mật khẩu tệp / thư mục
            </label>
            <input
              id="unlock-password"
              className="form-control"
              type="password"
              required
              placeholder="Nhập mật khẩu đã đặt"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          {error && <div className="text-danger small mb-3">{error}</div>}

          <button type="submit" className="btn btn-primary w-100">
            <Icon name="lock" /> Mở khóa
          </button>
        </form>
      </Modal>
    );
  }

  if (mode === 'manage' && file.isLocked) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Bảo vệ bằng mật khẩu">
        <div className="lock-intro">
          <Icon name="lock" />
          <h3>{file.name}</h3>
          <div className="d-flex justify-content-center mt-2">
            <Badge variant={locked ? 'purple' : 'green'} icon="lock">
              {locked ? 'Đang khóa' : 'Đã mở khóa phiên này'}
            </Badge>
          </div>
        </div>

        <p className="small muted text-center mb-4">
          Mật khẩu được yêu cầu khi mở nội dung, kể cả với người được chia sẻ. Tệp được lưu dưới dạng mã hóa; tên và thông tin tệp vẫn hiển thị.
        </p>

        <div className="d-grid gap-2">
          <button
            type="button"
            className="btn btn-primary w-100"
            onClick={() => {
              onClose();
              if (onSuccess) onSuccess();
            }}
          >
            Mở {isFolder ? 'thư mục' : 'tệp'}
          </button>

          <button
            type="button"
            className="btn btn-light w-100"
            onClick={() => {
              relockAll();
              onClose();
            }}
          >
            Khóa lại ngay
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Mã hóa ${isFolder ? 'thư mục' : 'tài liệu'}`}
    >
      <div className="d-flex align-items-center gap-3 mb-3">
        <span className={`fileicon ${file.type}`}>
          <Icon name={file.type === 'document' ? 'file' : file.type} />
        </span>
        <b className="text-truncate">{file.name}</b>
      </div>

      <p className="small muted">
        {isFolder
          ? 'Mật khẩu bảo vệ cả thư mục con và các tệp bên trong, kể cả tệp tải lên sau này.'
          : 'Nhập mật khẩu khi xem hoặc tải xuống tệp này.'}
      </p>

      <form onSubmit={handleEncrypt}>
        <div className="form-field">
          <label className="form-label" htmlFor="protect-password">
            Mật khẩu bảo vệ
          </label>
          <input
            id="protect-password"
            className="form-control"
            type="password"
            required
            minLength={8}
            placeholder="Tối thiểu 8 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="confirm-protect-password">
            Nhập lại mật khẩu
          </label>
          <input
            id="confirm-protect-password"
            className="form-control"
            type="password"
            required
            minLength={8}
            placeholder="Nhập lại mật khẩu ở trên"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <div className="text-danger small mb-3">{error}</div>}

        <p className="small muted">
          Hãy ghi nhớ mật khẩu; bản mẫu không có chức năng khôi phục mật khẩu mã hóa.
        </p>

        <button type="submit" className="btn btn-primary w-100">
          <Icon name="lock" /> Đặt mật khẩu và mã hóa
        </button>
      </form>
    </Modal>
  );
}

export default ProtectionModal;
