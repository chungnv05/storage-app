import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import Toast from '../common/Toast.jsx';
import useStorage from '../../hooks/useStorage.js';

function UserLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toastMessage } = useStorage();

  const toggleMenu = () => setMobileMenuOpen(prev => !prev);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="user-layout-wrapper">
      <div
        className={`mobile-scrim ${mobileMenuOpen ? 'open' : ''}`}
        onClick={closeMenu}
      />

      <Sidebar isOpen={mobileMenuOpen} onClose={closeMenu} />

      <main className="main">
        <Topbar onToggleMenu={toggleMenu} />

        <div className="content">
          <Outlet />

          <footer className="prototype">
            <span>© 2026 LưuTrữ · Không gian cho mọi tài liệu</span>
            <span>Prototype · Dữ liệu chỉ lưu trên trình duyệt</span>
          </footer>
        </div>
      </main>

      <Toast message={toastMessage} />
    </div>
  );
}

export default UserLayout;
