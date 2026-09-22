import React from 'react';
import Badge from '../common/Badge.jsx';

function UserStatusCard({ users }) {
  const total = users.length || 1;
  const activeCount = users.filter(u => !u.blocked).length;
  const lockedCount = total - activeCount;
  const activePercent = Math.round((activeCount / total) * 100);

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
        Tài khoản bị khóa không thể đăng nhập hoặc truy cập tài liệu trong bản mẫu.
      </p>
    </section>
  );
}

export default UserStatusCard;
