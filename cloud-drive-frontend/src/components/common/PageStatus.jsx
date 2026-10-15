import React from 'react';

/** Trạng thái loading hoặc lỗi (có nút thử lại) dùng chung cho các trang gọi API. */
export function LoadingPanel({ message }) {
  return (
    <div className="panel p-5 text-center mb-4">
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Đang tải...</span>
      </div>
      <p className="text-muted mb-0">{message}</p>
    </div>
  );
}

export function ErrorAlert({ title = 'Lỗi tải dữ liệu:', message, onRetry }) {
  return (
    <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4">
      <div>
        <strong>{title}</strong> {message}
      </div>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  );
}

export function SuccessAlert({ message, onClose }) {
  return (
    <div className="alert alert-success d-flex justify-content-between align-items-center mb-4">
      <span>{message}</span>
      <button type="button" className="btn-close" onClick={onClose} aria-label="Đóng" />
    </div>
  );
}
