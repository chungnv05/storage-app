import React from 'react';
import Icon from '../common/Icon.jsx';

function AdminTopbar({ onToggleMenu, searchQuery, onSearchChange }) {
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

      <div className="search">
        <Icon name="search" />
        <input
          id="search-admin"
          aria-label="Tìm kiếm người dùng"
          placeholder="Tìm người dùng theo tên hoặc email…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="top-right">

        <div className="d-flex align-items-center gap-2">
          <span className="avatar" style={{ background: '#e0eeee', color: '#147c89' }}>
            AD
          </span>
          <span className="user-name small fw-bold">Quản trị viên</span>
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;
