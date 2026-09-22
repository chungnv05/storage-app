import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import Badge from '../common/Badge.jsx';
import useStorage from '../../hooks/useStorage.js';
import useAuth from '../../hooks/useAuth.js';
import { formatSize, GB } from '../../mock/utils.js';

function Sidebar({ isOpen, onClose }) {
  const { currentUser, getPlan, getUserUsedBytes, notices } = useStorage();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const plan = getPlan(currentUser.plan);
  const usedBytes = getUserUsedBytes(currentUser.id);
  const totalBytes = plan.gb * GB;
  const usedPercent = Math.min(100, Math.round((usedBytes / totalBytes) * 100));

  const unreadNoticesCount = notices.filter(n => n.to === currentUser.id && !n.read).length;

 

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

        <NavLink
          to="/notifications"
          className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Icon name="bell" />
          Thông báo
          {unreadNoticesCount > 0 && (
            <span className="nav-count">{unreadNoticesCount}</span>
          )}
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

      <div className="side-bottom">
        <div className="storagebox">
          <div className="d-flex justify-content-between align-items-center small mb-3">
            <b>Dung lượng</b>
            <Badge variant="blue">{plan.name}</Badge>
          </div>
          <div className="progress">
            <div
              className="progress-bar"
              style={{ width: `${usedPercent}%` }}
            />
          </div>
          <p className="small muted mt-2 mb-3">
            {formatSize(usedBytes)} / {plan.gb} GB đã dùng ({usedPercent}%)
          </p>
          <Link
            to="/plans"
            className="btn btn-outline-primary w-100"
            onClick={onClose}
          >
            Nâng cấp dung lượng <Icon name="arrow" />
          </Link>
        </div>

      </div>
    </aside>
  );
}

export default Sidebar;
