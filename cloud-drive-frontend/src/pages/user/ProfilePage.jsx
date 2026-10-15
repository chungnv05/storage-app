import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Icon from '../../components/common/Icon.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import { LoadingPanel, ErrorAlert, SuccessAlert } from '../../components/common/PageStatus.jsx';
import { formatSize } from '../../utils/format.js';

// Cùng ràng buộc với UserRequest ở backend (full_name trong DB tối đa 100 ký tự).
const PHONE_PATTERN = /^\+?[0-9]{9,15}$/;
const FULL_NAME_MAX = 100;

function ProfileForm({ currentUser, onSave }) {
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const fields = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || null
    };

    const errors = {};
    if (!fields.fullName) errors.fullName = 'Vui lòng nhập họ và tên.';
    if (!fields.email) errors.email = 'Vui lòng nhập email.';
    if (fields.phone && !PHONE_PATTERN.test(fields.phone)) errors.phone = 'Số điện thoại không hợp lệ.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await onSave(fields);
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="alert alert-danger py-2 small mb-3">{error}</div>
      )}

      <div className="form-field">
        <label className="form-label" htmlFor="profile-name">
          Họ và tên
        </label>
        <input
          id="profile-name"
          className={`form-control ${fieldErrors.fullName ? 'is-invalid' : ''}`}
          type="text"
          required
          maxLength={FULL_NAME_MAX}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        {fieldErrors.fullName && <div className="invalid-feedback">{fieldErrors.fullName}</div>}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="profile-email">
          Email
        </label>
        <input
          id="profile-email"
          className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
          type="email"
          required
          maxLength={255}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="profile-phone">
          Số điện thoại
        </label>
        <input
          id="profile-phone"
          className={`form-control ${fieldErrors.phone ? 'is-invalid' : ''}`}
          type="tel"
          placeholder="Ví dụ: 0901234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {fieldErrors.phone && <div className="invalid-feedback">{fieldErrors.phone}</div>}
      </div>

      <button type="submit" className="btn btn-primary mt-2" disabled={submitting}>
        {submitting ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            Đang lưu...
          </>
        ) : (
          'Lưu thay đổi'
        )}
      </button>
    </form>
  );
}

function ProfilePage() {
  const { currentUser, loading, error, refetch, updateProfile } = useOutletContext();
  const navigate = useNavigate();
  // Đặt ở trang (không ở form) vì form được khởi tạo lại sau khi lưu.
  const [saved, setSaved] = useState(false);

  const handleSave = async (fields) => {
    setSaved(false);
    await updateProfile(fields);
    setSaved(true);
  };

  if (!currentUser) {
    return loading
      ? <LoadingPanel message="Đang tải thông tin tài khoản..." />
      : <ErrorAlert message={error} onRetry={refetch} />;
  }

  return (
    <div className="profile-page">
      <div className="pagehead">
        <div>
          <h1 className="mb-0">Thông tin cá nhân</h1>
          <p>Quản lý hồ sơ tài khoản của bạn.</p>
        </div>
      </div>

      <div className="account-grid">
        <section className="panel padded">
          <h2 className="mb-4">Hồ sơ của bạn</h2>

          {/*
            TODO(BACKEND): Chưa có API đổi ảnh đại diện. Cần API upload ảnh (multipart) để cập nhật
            avatarUrl của user; UserResponse đã có trường avatarUrl để hiển thị.
          */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <Avatar user={currentUser} size="large" />
          </div>

          {saved && (
            <SuccessAlert message="Đã cập nhật thông tin cá nhân." onClose={() => setSaved(false)} />
          )}

          {/* key: khởi tạo lại form theo dữ liệu mới nhất sau khi lưu thành công */}
          <ProfileForm
            key={`${currentUser.fullName}|${currentUser.email}|${currentUser.phone}`}
            currentUser={currentUser}
            onSave={handleSave}
          />
        </section>

        <div>
          {/*
            TODO(BACKEND): Chưa có API đổi mật khẩu. Mật khẩu do Keycloak quản lý; cần API backend
            (gọi Keycloak Admin API, có xác thực mật khẩu hiện tại) hoặc quyết định dùng trang
            Account Console của Keycloak trước khi dựng lại form đổi mật khẩu.
          */}

          <section className="panel padded">
            <h3 className="mb-2">Gói {currentUser.packageName}</h3>
            <p className="small muted mb-3">
              Đang dùng {formatSize(currentUser.storageUsedBytes)} / {formatSize(currentUser.storageLimitBytes)}
            </p>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => navigate('/plans')}
            >
              Xem các gói <Icon name="arrow" />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
