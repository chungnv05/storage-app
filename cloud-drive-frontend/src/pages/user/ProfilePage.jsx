import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import useStorage from '../../hooks/useStorage.js';
import { formatSize } from '../../mock/utils.js';

function ProfilePage() {
  const { currentUser, getPlan, getUserUsedBytes, updateProfile, changePassword, changeAvatar, toast } = useStorage();
  const navigate = useNavigate();

  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const plan = getPlan(currentUser.plan);
  const used = getUserUsedBytes(currentUser.id);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Vui lòng nhập họ và tên.');
      return;
    }
    updateProfile({ name, email, phone });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('Mật khẩu nhập lại không khớp.');
      return;
    }
    const success = changePassword(oldPassword, newPassword);
    if (success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2e6) {
      toast('Vui lòng chọn ảnh định dạng JPG, PNG hoặc WebP tối đa 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 160;
        const s = Math.min(img.width, img.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(
          img,
          (img.width - s) / 2,
          (img.height - s) / 2,
          s,
          s,
          0,
          0,
          160,
          160
        );
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        changeAvatar(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-page">
      <div className="pagehead">
        <div>
          <h1 className="mb-0">Thông tin cá nhân</h1>
          <p>Quản lý hồ sơ và bảo mật tài khoản của bạn.</p>
        </div>
      </div>

      <div className="account-grid">
        {/* Left Column: Profile form */}
        <section className="panel padded">
          <h2 className="mb-4">Hồ sơ của bạn</h2>

          <div className="d-flex align-items-center gap-3 mb-4">
            <Avatar user={currentUser} size="large" />

            <div>
              <label className="btn btn-light" htmlFor="avatar-upload" style={{ cursor: 'pointer' }}>
                <Icon name="image" /> Thay ảnh đại diện
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="d-none"
                onChange={handleAvatarFile}
              />
              <p className="small muted mt-2 mb-0">
                JPG, PNG hoặc WebP · Tối đa 2 MB
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-field">
              <label className="form-label" htmlFor="profile-name">
                Họ và tên
              </label>
              <input
                id="profile-name"
                className="form-control"
                type="text"
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="profile-email">
                Email
              </label>
              <input
                id="profile-email"
                className="form-control"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="profile-phone">
                Số điện thoại
              </label>
              <input
                id="profile-phone"
                className="form-control"
                type="tel"
                placeholder="Ví dụ: 0901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary mt-2">
              Lưu thay đổi
            </button>
          </form>
        </section>

        {/* Right Column: Change Password & Storage Plan */}
        <div>
          <section className="panel padded mb-4">
            <h2 className="mb-4">Đổi mật khẩu</h2>

            <form onSubmit={handleChangePassword}>
              <div className="form-field">
                <label className="form-label" htmlFor="old-password">
                  Mật khẩu hiện tại
                </label>
                <input
                  id="old-password"
                  className="form-control"
                  type="password"
                  required
                  placeholder="Mật khẩu hiện tại"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="new-password">
                  Mật khẩu mới
                </label>
                <input
                  id="new-password"
                  className="form-control"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Tối thiểu 8 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="confirm-new-password">
                  Nhập lại mật khẩu mới
                </label>
                <input
                  id="confirm-new-password"
                  className="form-control"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-light mt-2">
                <Icon name="lock" /> Cập nhật mật khẩu
              </button>
            </form>
          </section>

          <section className="panel padded">
            <h3 className="mb-2">Gói {plan.name}</h3>
            <p className="small muted mb-3">
              Đang dùng {formatSize(used)} / {plan.gb} GB
            </p>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => navigate('/plans')}
            >
              Quản lý gói <Icon name="arrow" />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
