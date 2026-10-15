import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import Avatar from '../common/Avatar.jsx';

function Topbar({ onToggleMenu, currentUser }) {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <button
        className="iconbtn mobile-toggle"
        aria-label="Mở menu"
        onClick={onToggleMenu}
        type="button"
      >
        <Icon name="menu" />
      </button>

      {/*
        TODO(BACKEND): Ô tìm kiếm file/thư mục và chuông thông báo đã được gỡ vì chưa có API.
        Cần API tìm kiếm file/thư mục của user (theo tên, loại) và API đếm thông báo chưa đọc
        trước khi hiển thị lại hai thành phần này.
      */}
      <div className="flex-grow-1" />

      <div className="top-right">
        <button
          className="iconbtn d-flex align-items-center gap-2"
          onClick={() => navigate('/profile')}
          type="button"
          style={{ padding: '4px 8px' }}
        >
          <Avatar user={currentUser} />
          <span className="user-name small fw-bold">
            {currentUser?.fullName ? currentUser.fullName.split(' ').slice(-2).join(' ') : 'Tài khoản'}
          </span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
