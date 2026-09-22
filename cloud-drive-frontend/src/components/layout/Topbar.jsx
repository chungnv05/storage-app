import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import Avatar from '../common/Avatar.jsx';
import Badge from '../common/Badge.jsx';
import useStorage from '../../hooks/useStorage.js';

function Topbar({ onToggleMenu }) {
  const { currentUser, notices, searchQuery, setSearchQuery } = useStorage();
  const navigate = useNavigate();

  const unreadCount = notices.filter(n => n.to === currentUser.id && !n.read).length;

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
          id="search"
          aria-label="Tìm kiếm"
          placeholder="Tìm kiếm file hoặc thư mục…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="top-right">
        

        <button
          className="iconbtn"
          aria-label={`Thông báo, ${unreadCount} chưa đọc`}
          onClick={() => navigate('/notifications')}
          type="button"
        >
          <Icon name="bell" />
          {unreadCount > 0 && <span className="dot" />}
        </button>

        <button
          className="iconbtn d-flex align-items-center gap-2"
          onClick={() => navigate('/profile')}
          type="button"
          style={{ padding: '4px 8px' }}
        >
          <Avatar user={currentUser} />
          <span className="user-name small fw-bold">
            {currentUser?.name ? currentUser.name.split(' ').slice(-2).join(' ') : 'Tài khoản'}
          </span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
