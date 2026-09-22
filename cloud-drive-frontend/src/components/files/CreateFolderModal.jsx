import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';

function CreateFolderModal({ isOpen, onClose, onCreate }) {
  const [folderName, setFolderName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    const success = onCreate(folderName);
    if (success) {
      setFolderName('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo thư mục">
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="folder-name-input">
            Tên thư mục
          </label>
          <input
            id="folder-name-input"
            className="form-control"
            name="name"
            type="text"
            required
            maxLength={100}
            placeholder="Ví dụ: Hợp đồng 2026"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            autoFocus
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Tạo thư mục
        </button>
      </form>
    </Modal>
  );
}

export default CreateFolderModal;
