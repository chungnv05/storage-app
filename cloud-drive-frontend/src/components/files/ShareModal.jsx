import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';
import Avatar from '../common/Avatar.jsx';
import useStorage from '../../hooks/useStorage.js';

function ShareModal({ isOpen, onClose, file }) {
  const { users, shareFile, revokeShare } = useStorage();
  const [selectedUserId, setSelectedUserId] = useState('');

  if (!file) return null;

  const otherUsers = users.filter(
    u => u.id !== file.owner && !u.blocked && !(file.shared || []).includes(u.id)
  );

  const sharedUsers = users.filter(u => (file.shared || []).includes(u.id));

  const handleShareSubmit = (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    shareFile(file.id, selectedUserId);
    setSelectedUserId('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chia sẻ ${file.type === 'folder' ? 'thư mục' : 'tài liệu'}`}
    >
      <div className="d-flex align-items-center gap-3 mb-4">
        <span className={`fileicon ${file.type}`}>
          <Icon name={file.type === 'document' ? 'file' : file.type} />
        </span>
        <b className="text-truncate">{file.name}</b>
      </div>

      <form onSubmit={handleShareSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="recipient-select">
            Chọn tài khoản nhận chia sẻ
          </label>
          <select
            id="recipient-select"
            className="form-select"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            required
          >
            <option value="">-- Chọn tài khoản --</option>
            {otherUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} · {u.email}
              </option>
            ))}
          </select>
        </div>

        <p className="small muted">
          Quyền xem và tải xuống
          {file.type === 'folder' ? ', bao gồm các tệp trong thư mục' : ''}. Người nhận sẽ nhận được thông báo tương ứng.
        </p>

        <button
          type="submit"
          className="btn btn-primary w-100 mb-4"
          disabled={!selectedUserId}
        >
          <Icon name="share" /> Chia sẻ ngay
        </button>
      </form>

      <h3 className="mb-3">Những người có quyền truy cập</h3>

      {sharedUsers.length > 0 ? (
        <div className="d-flex flex-column gap-2">
          {sharedUsers.map(u => (
            <div
              key={u.id}
              className="d-flex align-items-center justify-content-between p-2 rounded"
              style={{ background: '#f8fafc' }}
            >
              <div className="d-flex align-items-center gap-2">
                <Avatar user={u} />
                <div>
                  <div className="small fw-bold">{u.name}</div>
                  <div className="small muted">{u.email}</div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-light py-1 px-3 small"
                onClick={() => revokeShare(file.id, u.id)}
              >
                Thu hồi
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="small muted">Chưa chia sẻ với tài khoản nào.</p>
      )}
    </Modal>
  );
}

export default ShareModal;
