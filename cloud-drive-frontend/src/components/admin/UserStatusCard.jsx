import React from 'react';
import Badge from '../common/Badge.jsx';

function UserStatusCard({ users = [], stats = null }) {
  const total = stats ? stats.totalUsers : (users.length || 0);
  const activeCount = stats ? stats.activeUsers : users.filter(u => !u.blocked).length;
  const lockedCount = Math.max(0, total - activeCount);
  const activePercent = total > 0 ? Math.round((activeCount / total) * 100) : 0;

  return (
    <section className="panel chartpanel h-100">
      <h2 className="mb-0">Tình trạng tài khoản</h2>

      <div className="legend-row mt-4">
        <span>Đang hoạt động</span>
        <b>{activeCount}</b>
        <Badge variant="green">{activePercent}%</Badge>
      </div>

      <div className="progress mb-4">
        <div
          className="progress-bar"
          style={{ width: `${activePercent}%`, background: 'var(--blue)' }}
        />
      </div>

      <div className="legend-row">
        <span>Đã khóa</span>
        <b>{lockedCount}</b>
        <Badge variant="red">{lockedCount > 0 ? 'Tạm ngưng' : '0'}</Badge>
      </div>

      <p className="small muted mt-3 mb-0">
        Tài khoản bị khóa không thể đăng nhập hoặc truy cập tài liệu trong hệ thống.
      </p>
    </section>
  );
}

export default UserStatusCard;
