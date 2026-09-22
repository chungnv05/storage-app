import React, { useState, useMemo } from 'react';
import AdminUsersTable from '../../components/admin/AdminUsersTable.jsx';
import UserDetailModal from '../../components/admin/UserDetailModal.jsx';
import BlockUserModal from '../../components/admin/BlockUserModal.jsx';
import Icon from '../../components/common/Icon.jsx';
import usePlans from '../../hooks/usePlans.js';
import useAdminUsers from '../../hooks/useAdminUsers.js';
import useStorage from '../../hooks/useStorage.js';

function AdminUsersPage() {
  const {
    users = [],
    loading: loadingUsers,
    error: errorUsers,
    adminBlockUser,
    refetchUsers
  } = useAdminUsers();

  const {
    plans = [],
    loading: loadingPlans,
    error: errorPlans,
    refetchPlans
  } = usePlans();

  const { searchQuery: globalSearchQuery } = useStorage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
  const [selectedUserForBlock, setSelectedUserForBlock] = useState(null);

  const filterPills = useMemo(() => {
    return [
      { value: '', label: 'Tất cả người dùng', count: users.length },
      ...plans.map(p => {
        const count = users.filter(u => {
          const matchId = u.plan === p.id || u.packageId === p.id;
          const matchName =
            (u.packageName && u.packageName.toLowerCase() === p.name.toLowerCase()) ||
            (u.plan && String(u.plan).toLowerCase() === p.name.toLowerCase());
          return matchId || matchName;
        }).length;

        return {
          value: p.id,
          label: p.name,
          count
        };
      })
    ];
  }, [plans, users]);

  const filteredUsers = useMemo(() => {
    let list = users;

    if (selectedPlanFilter !== '') {
      const selectedPlanObj = plans.find(p => p.id === selectedPlanFilter);
      const targetName = selectedPlanObj
        ? selectedPlanObj.name.toLowerCase()
        : String(selectedPlanFilter).toLowerCase();

      list = list.filter(u => {
        const matchId = u.plan === selectedPlanFilter || u.packageId === selectedPlanFilter;
        const matchName =
          (u.packageName && u.packageName.toLowerCase() === targetName) ||
          (u.plan && String(u.plan).toLowerCase() === targetName);
        return matchId || matchName;
      });
    }

    const effectiveSearch = (searchQuery || globalSearchQuery || '').toLowerCase().trim();
    if (effectiveSearch) {
      list = list.filter(u => {
        const name = (u.name || u.fullName || '').toLowerCase();
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
  }, [users, selectedPlanFilter, searchQuery, globalSearchQuery, plans]);

  const handleRefresh = () => {
    if (refetchUsers) refetchUsers();
    if (refetchPlans) refetchPlans();
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

      <div className="pills mb-4">
        {filterPills.map(({ value, label, count }) => (
          <button
            key={value}
            type="button"
            className={`pill ${selectedPlanFilter === value ? 'active' : ''}`}
            onClick={() => setSelectedPlanFilter(value)}
          >
            {label} <span className="ms-1 fw-normal">({count})</span>
          </button>
        ))}
      </div>

      {(loadingUsers || loadingPlans) && users.length === 0 ? (
        <div className="panel p-5 text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="text-muted mb-0">Đang tải danh sách người dùng từ hệ thống...</p>
        </div>
      ) : (errorUsers || errorPlans) ? (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4">
          <div>
            <strong>Lỗi tải dữ liệu:</strong> {errorUsers || errorPlans}
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={handleRefresh}
          >
            Thử lại
          </button>
        </div>
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
        user={selectedUserForDetail}
        onBlockToggle={(u) => setSelectedUserForBlock(u)}
      />

      <BlockUserModal
        isOpen={Boolean(selectedUserForBlock)}
        onClose={() => setSelectedUserForBlock(null)}
        user={selectedUserForBlock}
        onConfirm={(uid) => adminBlockUser(uid)}
      />
    </div>
  );
}

export default AdminUsersPage;
