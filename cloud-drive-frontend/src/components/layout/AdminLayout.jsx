import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import Toast from '../common/Toast.jsx';
import useStorage from '../../hooks/useStorage.js';

function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toastMessage } = useStorage();

  const toggleMenu = () => setMobileMenuOpen(prev => !prev);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="admin admin-layout-wrapper">
      <div
        className={`mobile-scrim ${mobileMenuOpen ? 'open' : ''}`}
        onClick={closeMenu}
      />

      <AdminSidebar isOpen={mobileMenuOpen} onClose={closeMenu} />

      <main className="main">
        <AdminTopbar onToggleMenu={toggleMenu} />

        <div className="content">
          <Outlet />

          <footer className="prototype">
            <span>© 2026 LưuTrữ · Không gian quản trị hệ thống</span>
            <span>Prototype · Dữ liệu chỉ lưu trên trình duyệt</span>
          </footer>
        </div>
      </main>

      <Toast message={toastMessage} />
    </div>
  );
}

export default AdminLayout;
