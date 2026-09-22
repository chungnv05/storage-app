import React from 'react';
import Icon from '../common/Icon.jsx';
import Avatar from '../common/Avatar.jsx';
import Badge from '../common/Badge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import useStorage from '../../hooks/useStorage.js';
import { formatSize, GB } from '../../mock/utils.js';

function AdminUsersTable({ users, onSelectUser, onBlockToggle }) {
  const { getPlan, getUserUsedBytes } = useStorage();

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
              const plan = getPlan(u.plan);
              const used = getUserUsedBytes(u.id);
              const totalBytes = plan.gb * GB;
              const percent = Math.min(100, Math.round((used / totalBytes) * 100));

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
                          {u.name}
                        </button>
                        <div className="small muted mt-1">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <Badge
                      variant={
                        u.plan === 'pro'
                          ? 'purple'
                          : u.plan === 'plus'
                            ? 'blue'
                            : 'gray'
                      }
                    >
                      {plan.name}
                    </Badge>
                  </td>

                  <td style={{ minWidth: '160px' }}>
                    <div className="small mb-2">
                      {formatSize(used)}{' '}
                      <span className="muted">/ {plan.gb} GB</span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </td>

                  <td>
                    <Badge variant={u.blocked ? 'red' : 'green'}>
                      {u.blocked ? 'Đã khóa' : 'Hoạt động'}
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
                        aria-label={`${u.blocked ? 'Mở khóa' : 'Khóa'} ${u.name}`}
                        onClick={() => onBlockToggle(u)}
                      >
                        <Icon name={u.blocked ? 'refresh' : 'lock'} />
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
        Hiển thị {users.length} tài khoản · Dữ liệu cập nhật từ môi trường mô phỏng
      </div>
    </div>
  );
}

export default AdminUsersTable;
