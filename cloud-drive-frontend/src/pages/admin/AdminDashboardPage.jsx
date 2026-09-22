import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import DonutChart from '../../components/admin/DonutChart.jsx';
import UserStatusCard from '../../components/admin/UserStatusCard.jsx';
import AdminUsersTable from '../../components/admin/AdminUsersTable.jsx';
import UserDetailModal from '../../components/admin/UserDetailModal.jsx';
import BlockUserModal from '../../components/admin/BlockUserModal.jsx';
import useStorage from '../../hooks/useStorage.js';
import { formatSize, formatMoney, formatDate, GB } from '../../mock/utils.js';

function AdminDashboardPage() {
  const { users, plans, getUserUsedBytes, getPlan, adminBlockUser } = useStorage();
  const navigate = useNavigate();

  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
  const [selectedUserForBlock, setSelectedUserForBlock] = useState(null);

  const totalUsers = users.length;
  const activeCount = users.filter(u => !u.blocked).length;
  const paidUsersCount = users.filter(u => u.plan === 'plus' || u.plan === 'pro').length;

  const totalBytes = useMemo(() => {
    return users.reduce((acc, u) => acc + getUserUsedBytes(u.id), 0);
  }, [users, getUserUsedBytes]);

  const totalCapacity = useMemo(() => {
    return users.reduce((acc, u) => acc + getPlan(u.plan).gb * GB, 0);
  }, [users, getPlan]);

  const totalPaid = useMemo(() => {
    return users.reduce((acc, u) => acc + (u.paid || 0), 0);
  }, [users]);

  const recentUsers = useMemo(() => {
    return [...users].sort((a, b) => b.created - a.created).slice(0, 5);
  }, [users]);

  const [currentDate] = useState(() => formatDate(Date.now()));

  return (
    <div className="admin-dashboard-page">
      <div className="pagehead">
        <div>
          <h1 className="mb-0">Tổng quan hệ thống</h1>
          <p>Theo dõi người dùng và hoạt động lưu trữ.</p>
        </div>

        <div className="actions">
          <span className="btn btn-light">
            <Icon name="clock" /> {currentDate}
          </span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="cards mb-4">
        <StatCard
          label="Tổng người dùng"
          value={totalUsers}
          subtext={`${activeCount} tài khoản đang hoạt động`}
          icon="users"
        />

        <StatCard
          label="Người dùng trả phí"
          value={paidUsersCount}
          subtext="Đang sử dụng Plus hoặc Pro"
          icon="card"
        />

        <StatCard
          label="Dung lượng đã dùng"
          value={formatSize(totalBytes)}
          subtext={`Trên ${formatSize(totalCapacity)} được cấp`}
          icon="cloud"
        />

        <StatCard
          label="Tổng đã thanh toán"
          value={formatMoney(totalPaid)}
          subtext="Lũy kế · dữ liệu minh họa"
          icon="chart"
        />
      </div>

      {/* 2-column Charts */}
      <div className="admincols mb-4">
        <section className="panel chartpanel">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Người dùng theo gói</h2>
            <span className="small muted">{totalUsers} tài khoản</span>
          </div>

          <DonutChart plans={plans} users={users} />
        </section>

        <UserStatusCard users={users} />
      </div>

      {/* Recent Users Section */}
      <div className="sectionhead">
        <h2 className="mb-0">Người dùng gần đây</h2>
        <button
          type="button"
          className="breadcrumb-button"
          onClick={() => navigate('/admin/users')}
        >
          Xem tất cả <Icon name="arrow" />
        </button>
      </div>

      <AdminUsersTable
        users={recentUsers}
        onSelectUser={(u) => setSelectedUserForDetail(u)}
        onBlockToggle={(u) => setSelectedUserForBlock(u)}
      />

      {/* Modals */}
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

export default AdminDashboardPage;
