import React, { useEffect } from 'react';
import Icon from './Icon.jsx';

function Modal({ isOpen, onClose, title, children, maxWidth = '560px' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content-custom"
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
      >
        <div className="dialog-head">
          <h2 id="dialog-title" className="mb-0">{title}</h2>
          <button
            className="iconbtn"
            type="button"
            aria-label="Đóng"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="dialog-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
