import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';

function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Từ khóa ở ô tìm kiếm trên topbar, các trang con đọc qua useOutletContext.
  const [searchQuery, setSearchQuery] = useState('');

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
        <AdminTopbar
          onToggleMenu={toggleMenu}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="content">
          <Outlet context={{ searchQuery }} />

          <footer className="prototype">
            <span>© 2026 LưuTrữ · Không gian quản trị hệ thống</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
