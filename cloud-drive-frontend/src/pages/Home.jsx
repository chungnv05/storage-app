import React from 'react';
import useAuth from '../hooks/useAuth';
import keycloak from '../auth/keycloak';

function HomePage() {
  const { user, token, logout, refreshToken } = useAuth();

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🎉 Test Keycloak Authentication</h1>

      {/* Thông tin User */}
      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
        <h3>Thông tin người dùng:</h3>
        <p><strong>Username:</strong> {user?.username}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Họ & Tên:</strong> {user?.firstName} {user?.lastName}</p>
        <p><strong>Roles:</strong> {user?.roles?.join(', ') || 'Không có role'}</p>
      </div>

      {/* Access Token (Rút gọn) */}
      <div style={{ background: '#eef6ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Access Token (10 ký tự đầu):</h3>
        <code style={{ wordBreak: 'break-all' }}>
          {token ? `${token.substring(0, 30)}...` : 'Không có token'}
        </code>
      </div>

      {/* Các nút bấm test chức năng */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={refreshToken}
          style={{ padding: '10px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          🔄 Refresh Token thủ công
        </button>

        <button 
          onClick={logout}
          style={{ padding: '10px 15px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          🚪 Đăng xuất (Logout)
        </button>
      </div>
    </div>
  );
}

export default HomePage;