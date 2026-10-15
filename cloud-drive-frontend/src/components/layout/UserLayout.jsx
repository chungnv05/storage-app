import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import useCurrentUser from '../../hooks/useCurrentUser.js';

function UserLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Một request GET /api/user/me dùng chung cho sidebar, topbar và các trang con
  // (đọc qua useOutletContext) thay vì mỗi nơi tự gọi lại.
  const currentUserState = useCurrentUser();
  const { currentUser } = currentUserState;

  const toggleMenu = () => setMobileMenuOpen(prev => !prev);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="user-layout-wrapper">
      <div
        className={`mobile-scrim ${mobileMenuOpen ? 'open' : ''}`}
        onClick={closeMenu}
      />

      <Sidebar isOpen={mobileMenuOpen} onClose={closeMenu} currentUser={currentUser} />

      <main className="main">
        <Topbar onToggleMenu={toggleMenu} currentUser={currentUser} />

        <div className="content">
          <Outlet context={currentUserState} />

          <footer className="prototype">
            <span>© 2026 LưuTrữ · Không gian cho mọi tài liệu</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default UserLayout;
