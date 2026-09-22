import React from 'react';
import Icon from './Icon.jsx';

function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="toast-container-custom" role="status" aria-live="polite">
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#a8bed5',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Icon name="close" style={{ width: 16, height: 16 }} />
        </button>
      )}
    </div>
  );
}

export default Toast;
