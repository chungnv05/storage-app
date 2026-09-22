import React, { useState, useRef } from 'react';
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';
import useStorage from '../../hooks/useStorage.js';
import { formatSize, GB } from '../../mock/utils.js';

function UploadModal({ isOpen, onClose, targetFolderName = 'Tài liệu của tôi', onUpload }) {
  const { currentUser, getPlan, getUserUsedBytes } = useStorage();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const plan = getPlan(currentUser.plan);
  const used = getUserUsedBytes(currentUser.id);
  const remaining = Math.max(0, plan.gb * GB - used);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadSubmit = () => {
    if (!selectedFiles.length) return;
    const count = onUpload(selectedFiles);
    if (count > 0) {
      setSelectedFiles([]);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tải tệp lên">
      <p className="muted small">Tải vào: <b>{targetFolderName}</b></p>

      <div
        className="dropzone"
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
      >
        <Icon name="upload" style={{ width: 36, height: 36, color: 'var(--blue)' }} />
        <p className="mt-3 mb-2 fw-medium">Chọn một hoặc nhiều tệp từ thiết bị</p>
        <p className="small muted mb-0">Hỗ trợ tài liệu, video, hình ảnh và tệp nén</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="d-none"
          onChange={handleFileChange}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-3 p-3 rounded" style={{ background: '#f5f8fd' }}>
          <div className="small fw-bold mb-2">
            Đã chọn {selectedFiles.length} tệp:
          </div>
          <div style={{ maxHeight: 120, overflowY: 'auto' }}>
            {selectedFiles.map((f, i) => (
              <div key={i} className="small muted d-flex justify-content-between py-1">
                <span className="text-truncate" style={{ maxWidth: 280 }}>{f.name}</span>
                <span>{formatSize(f.size)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="small muted mt-3">
        Còn {formatSize(remaining)} khả dụng · Tệp được lưu cục bộ trong trình duyệt.
      </p>

      <button
        type="button"
        className="btn btn-primary w-100 mt-2"
        disabled={selectedFiles.length === 0}
        onClick={handleUploadSubmit}
      >
        Tải lên {selectedFiles.length > 0 ? `(${selectedFiles.length} tệp)` : ''}
      </button>
    </Modal>
  );
}

export default UploadModal;
