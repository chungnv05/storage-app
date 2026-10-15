import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import Badge from '../common/Badge.jsx';
import useAuth from '../../hooks/useAuth.js';
import { formatSize, usagePercent } from '../../utils/format.js';

function Sidebar({ isOpen, onClose, currentUser }) {
  const { logout } = useAuth();

  const usedPercent = currentUser
    ? usagePercent(currentUser.storageUsedBytes, currentUser.storageLimitBytes)
    : 0;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <Link to="/files" className="brand" onClick={onClose}>
        <span className="brandmark">
          <Icon name="cloud" />
        </span>
        Cloud Storage<span style={{ color: '#1765e9' }}>.</span>
      </Link>

      <div className="workspace-label">KHÔNG GIAN LÀM VIỆC</div>

      <nav>
        <NavLink
          to="/files"
          className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Icon name="folder" />
          Tài liệu của tôi
        </NavLink>

        <NavLink
          to="/shared"
          className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Icon name="users" />
          Chia sẻ với tôi
        </NavLink>

        <NavLink
          to="/trash"
          className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Icon name="trash" />
          Thùng rác
        </NavLink>

        {/* TODO(BACKEND): Hiển thị số thông báo chưa đọc khi có API đếm thông báo chưa đọc của user. */}
        <NavLink
          to="/notifications"
          className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Icon name="bell" />
          Thông báo
        </NavLink>
      </nav>

      <div className="workspace-label">TÀI KHOẢN</div>

      <nav>
        <NavLink
          to="/plans"
          className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Icon name="card" />
          Gói dung lượng
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Icon name="user" />
          Thông tin cá nhân
        </NavLink>

        <button className="navlink" onClick={logout}>
          <Icon name="logout" />
          Đăng xuất
        </button>
      </nav>

      {currentUser && (
        <div className="side-bottom">
          <div className="storagebox">
            <div className="d-flex justify-content-between align-items-center small mb-3">
              <b>Dung lượng</b>
              <Badge variant="blue">{currentUser.packageName}</Badge>
            </div>
            <div className="progress">
              <div
                className="progress-bar"
                style={{ width: `${usedPercent}%` }}
              />
            </div>
            <p className="small muted mt-2 mb-3">
              {formatSize(currentUser.storageUsedBytes)} / {formatSize(currentUser.storageLimitBytes)} đã dùng ({usedPercent}%)
            </p>
            <Link
              to="/plans"
              className="btn btn-outline-primary w-100"
              onClick={onClose}
            >
              Xem các gói dung lượng <Icon name="arrow" />
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
