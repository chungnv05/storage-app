import React from 'react';
import Icon from '../common/Icon.jsx';
import Avatar from '../common/Avatar.jsx';
import Badge from '../common/Badge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatSize, usagePercent, packageBadgeVariant } from '../../utils/format.js';

/** `users` là danh sách UserResponse từ GET /api/admin/users. */
function AdminUsersTable({ users, onSelectUser, onBlockToggle }) {
  if (!users || users.length === 0) {
    return (
      <div className="panel">
        <EmptyState
          icon="users"
          title="Không tìm thấy người dùng"
          description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
        />
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>NGƯỜI DÙNG</th>
              <th>GÓI HIỆN TẠI</th>
              <th>DUNG LƯỢNG</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const percent = usagePercent(u.storageUsedBytes, u.storageLimitBytes);
              const isBlocked = u.status === 'LOCKED';

              return (
                <tr key={u.id}>
                  <td>
                    <div className="namecell">
                      <Avatar user={u} />
                      <div>
                        <button
                          type="button"
                          className="file-name"
                          onClick={() => onSelectUser(u)}
                        >
                          {u.fullName || u.email}
                        </button>
                        <div className="small muted mt-1">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <Badge variant={packageBadgeVariant(u.packageName)}>
                      {u.packageName}
                    </Badge>
                  </td>

                  <td style={{ minWidth: '160px' }}>
                    <div className="small mb-2">
                      {formatSize(u.storageUsedBytes)}{' '}
                      <span className="muted">/ {formatSize(u.storageLimitBytes)}</span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </td>

                  <td>
                    <Badge variant={isBlocked ? 'red' : 'green'}>
                      {isBlocked ? 'Đã khóa' : 'Hoạt động'}
                    </Badge>
                  </td>

                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn btn-light py-2"
                        onClick={() => onSelectUser(u)}
                      >
                        Chi tiết
                      </button>

                      <button
                        type="button"
                        className="iconbtn"
                        title={isBlocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                        aria-label={`${isBlocked ? 'Mở khóa' : 'Khóa'} ${u.fullName || u.email}`}
                        onClick={() => onBlockToggle(u)}
                      >
                        <Icon name={isBlocked ? 'refresh' : 'lock'} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="table-note">
        Hiển thị {users.length} tài khoản · Cập nhật từ hệ thống
      </div>
    </div>
  );
}

export default AdminUsersTable;
