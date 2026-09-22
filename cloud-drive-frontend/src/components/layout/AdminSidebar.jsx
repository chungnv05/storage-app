import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import Badge from '../common/Badge.jsx';
import useAuth from '../../hooks/useAuth.js';


function AdminSidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <Link to="/admin/dashboard" className="brand" onClick={onClose}>
        <span className="brandmark">
          <Icon name="cloud" />
        </span>
        Cloud Storage
      </Link>

      <div className="workspace-label">QUẢN TRỊ HỆ THỐNG</div>

      <nav>
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Icon name="grid" />
          Tổng quan
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Icon name="users" />
          Người dùng
        </NavLink>

        <NavLink
          to="/admin/plans"
          className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Icon name="card" />
          Gói &amp; khuyến mãi
        </NavLink>

        <NavLink
          to="/admin/broadcast"
          className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Icon name="bell" />
          Gửi thông báo
        </NavLink>
      </nav>

      <div className="workspace-label">TÀI KHOẢN</div>

      <nav>
        <NavLink
          to="/admin/profile"
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

      <div className="side-bottom">
        <div className="storagebox">
          <Badge variant="green">Admin workspace</Badge>
          <p className="small muted mt-3 mb-0">
            Quản lý tài khoản, dung lượng và ưu đãi tại một nơi.
          </p>
        </div>

      </div>
    </aside>
  );
}

export default AdminSidebar;
