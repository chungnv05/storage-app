import React, { useState, useMemo } from 'react';
import AdminUsersTable from '../../components/admin/AdminUsersTable.jsx';
import UserDetailModal from '../../components/admin/UserDetailModal.jsx';
import BlockUserModal from '../../components/admin/BlockUserModal.jsx';
import useStorage from '../../hooks/useStorage.js';

function AdminUsersPage() {
  const { users, adminBlockUser } = useAdminUsers();

  const { plans } = usePlans();

  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
  const [selectedUserForBlock, setSelectedUserForBlock] = useState(null);

  const filterPills = [
    { value: '', label: 'Tất cả người dùng', count: users.length },
    ...plans.map(p => ({
      value: p.id,
      label: p.name,
      count: users.filter(u => u.plan === p.id).length
    }))
  ];

  const filteredUsers = useMemo(() => {
    let list = users;

    if (selectedPlanFilter) {
      list = list.filter(u => u.plan === selectedPlanFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }

    return list;
  }, [users, selectedPlanFilter, searchQuery]);

  return (
    <div className="admin-users-page">
      <div className="pagehead">
        <div>
          <h1 className="mb-0">Quản lý người dùng</h1>
          <p>Theo dõi gói dịch vụ, dung lượng và trạng thái tài khoản.</p>
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

      <AdminUsersTable
        users={filteredUsers}
        onSelectUser={(u) => setSelectedUserForDetail(u)}
        onBlockToggle={(u) => setSelectedUserForBlock(u)}
      />

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
