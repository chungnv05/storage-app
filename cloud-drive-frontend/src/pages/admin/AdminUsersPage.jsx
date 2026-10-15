import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminUsersTable from '../../components/admin/AdminUsersTable.jsx';
import UserDetailModal from '../../components/admin/UserDetailModal.jsx';
import BlockUserModal from '../../components/admin/BlockUserModal.jsx';
import Icon from '../../components/common/Icon.jsx';
import { LoadingPanel, ErrorAlert, SuccessAlert } from '../../components/common/PageStatus.jsx';
import useAdminUsers from '../../hooks/useAdminUsers.js';
import usePackages from '../../hooks/usePackages.js';
import adminApi from '../../api/adminApi.js';

function AdminUsersPage() {
  const {
    users,
    loading: loadingUsers,
    error: errorUsers,
    updateUserStatus,
    refetchUsers
  } = useAdminUsers();

  const {
    packages,
    loading: loadingPackages,
    error: errorPackages,
    refetchPackages
  } = usePackages(adminApi.getAllPackages);

  const { searchQuery: globalSearchQuery } = useOutletContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackageFilter, setSelectedPackageFilter] = useState('');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
  const [selectedUserForBlock, setSelectedUserForBlock] = useState(null);
  const [notification, setNotification] = useState('');

  // UserResponse chỉ có packageName (không có packageId) nên lọc theo tên gói.
  const filterPills = useMemo(() => {
    return [
      { value: '', label: 'Tất cả người dùng', count: users.length },
      ...packages.map(p => ({
        value: p.name,
        label: p.name,
        count: users.filter(u => u.packageName === p.name).length
      }))
    ];
  }, [packages, users]);

  const filteredUsers = useMemo(() => {
    let list = users;

    if (selectedPackageFilter !== '') {
      list = list.filter(u => u.packageName === selectedPackageFilter);
    }

    const effectiveSearch = (searchQuery || globalSearchQuery || '').toLowerCase().trim();
    if (effectiveSearch) {
      list = list.filter(u => {
        const name = (u.fullName || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const phone = (u.phone || '').toLowerCase();
        return (
          name.includes(effectiveSearch) ||
          email.includes(effectiveSearch) ||
          phone.includes(effectiveSearch)
        );
      });
    }

    return list;
  }, [users, selectedPackageFilter, searchQuery, globalSearchQuery]);

  const currentUserDetail = useMemo(() => {
    if (!selectedUserForDetail) return null;
    return users.find(u => u.id === selectedUserForDetail.id) || selectedUserForDetail;
  }, [selectedUserForDetail, users]);

  const handleRefresh = () => {
    refetchUsers();
    refetchPackages();
  };

  const handleConfirmStatusChange = async (userId, targetStatus) => {
    await updateUserStatus(userId, targetStatus);
    setNotification(targetStatus === 'LOCKED' ? 'Đã khóa tài khoản thành công.' : 'Đã mở khóa tài khoản thành công.');
  };

  return (
    <div className="admin-users-page">
      <div className="pagehead">
        <div>
          <h1 className="mb-0">Quản lý người dùng</h1>
          <p>Theo dõi gói dịch vụ, dung lượng và trạng thái tài khoản.</p>
        </div>

        <div className="actions d-flex gap-2 align-items-center">
          <input
            type="search"
            className="form-control"
            placeholder="Tìm theo tên, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: '240px' }}
          />
          <button
            type="button"
            className="btn btn-light"
            onClick={handleRefresh}
            title="Làm mới dữ liệu"
          >
            <Icon name="refresh" /> Làm mới
          </button>
        </div>
      </div>

      {notification && (
        <SuccessAlert message={notification} onClose={() => setNotification('')} />
      )}

      <div className="pills mb-4">
        {filterPills.map(({ value, label, count }) => (
          <button
            key={value}
            type="button"
            className={`pill ${selectedPackageFilter === value ? 'active' : ''}`}
            onClick={() => setSelectedPackageFilter(value)}
          >
            {label} <span className="ms-1 fw-normal">({count})</span>
          </button>
        ))}
      </div>

      {loadingUsers || loadingPackages ? (
        <LoadingPanel message="Đang tải danh sách người dùng từ hệ thống..." />
      ) : (errorUsers || errorPackages) ? (
        <ErrorAlert message={errorUsers || errorPackages} onRetry={handleRefresh} />
      ) : (
        <AdminUsersTable
          users={filteredUsers}
          onSelectUser={(u) => setSelectedUserForDetail(u)}
          onBlockToggle={(u) => setSelectedUserForBlock(u)}
        />
      )}

      <UserDetailModal
        isOpen={Boolean(selectedUserForDetail)}
        onClose={() => setSelectedUserForDetail(null)}
        user={currentUserDetail}
        onBlockToggle={(u) => setSelectedUserForBlock(u)}
      />

      <BlockUserModal
        isOpen={Boolean(selectedUserForBlock)}
        onClose={() => setSelectedUserForBlock(null)}
        user={selectedUserForBlock}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}

export default AdminUsersPage;
