import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import DonutChart from '../../components/admin/DonutChart.jsx';
import UserStatusCard from '../../components/admin/UserStatusCard.jsx';
import AdminUsersTable from '../../components/admin/AdminUsersTable.jsx';
import UserDetailModal from '../../components/admin/UserDetailModal.jsx';
import BlockUserModal from '../../components/admin/BlockUserModal.jsx';
import usePlans from '../../hooks/usePlans.js';
import useAdminUsers from '../../hooks/useAdminUsers.js';
import useAdminStats from '../../hooks/useAdminStats.js';
import { formatSize, formatMoney, formatDate } from '../../mock/utils.js';

function AdminDashboardPage() {
  const {
    stats,
    loading: loadingStats,
    error: errorStats,
    refetchStats
  } = useAdminStats();

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

  const navigate = useNavigate();

  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
  const [selectedUserForBlock, setSelectedUserForBlock] = useState(null);

  // Use stats from API /api/admin/stats, with fallback to users calculations
  const totalUsers = stats ? stats.totalUsers : users.length;
  const activeCount = stats ? stats.activeUsers : users.filter(u => !u.blocked).length;
  const paidUsersCount = stats
    ? stats.paidUsers
    : users.filter(u => (u.packageName || u.plan || '').toLowerCase() !== 'free').length;

  const totalBytes = stats
    ? stats.storageUsedBytes
    : users.reduce((acc, u) => acc + (u.storageUsedBytes || 0), 0);

  const totalCapacity = stats
    ? stats.storageLimitBytes
    : users.reduce((acc, u) => acc + (u.storageLimitBytes || 0), 0);

  const totalPaid = stats
    ? stats.totalPaidAmount
    : users.reduce((acc, u) => acc + (u.paid || 0), 0);

  const recentUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => (b.created || 0) - (a.created || 0))
      .slice(0, 5);
  }, [users]);

  const [currentDate] = useState(() => formatDate(Date.now()));

  const handleRefresh = () => {
    if (refetchStats) refetchStats();
    if (refetchUsers) refetchUsers();
    if (refetchPlans) refetchPlans();
  };

  const isLoading = (loadingStats && !stats) && ((loadingUsers || loadingPlans) && users.length === 0);
  const errorMessage = errorStats || errorUsers || errorPlans;

  return (
    <div className="admin-dashboard-page">
      <div className="pagehead">
        <div>
          <h1 className="mb-0">Tổng quan hệ thống</h1>
          <p>Theo dõi người dùng và hoạt động lưu trữ.</p>
        </div>

        <div className="actions d-flex gap-2 align-items-center">
          <span className="btn btn-light">
            <Icon name="clock" /> {currentDate}
          </span>
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

      {isLoading ? (
        <div className="panel p-5 text-center mb-4">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="text-muted mb-0">Đang tải thông tin tổng quan hệ thống...</p>
        </div>
      ) : errorMessage ? (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4">
          <div>
            <strong>Lỗi tải dữ liệu:</strong> {errorMessage}
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
        <>
          {/* 4 Metric Cards */}
          <div className="cards mb-4">
            <StatCard
              label="Tổng người dùng"
              value={totalUsers}
              subtext={`${activeCount} tài khoản đang hoạt động`}
              icon="users"
              iconColor="#2563eb"
              iconBg="#eff6ff"
            />

            <StatCard
              label="Người dùng trả phí"
              value={paidUsersCount}
              subtext={
                paidUsersCount > 0
                  ? `${paidUsersCount} tài khoản đang dùng gói nâng cao`
                  : 'Chưa có tài khoản trả phí'
              }
              icon="card"
              iconColor="#7c3aed"
              iconBg="#f5f3ff"
            />

            <StatCard
              label="Dung lượng đã dùng"
              value={formatSize(totalBytes)}
              subtext={
                totalCapacity > 0
                  ? `Trên tổng số ${formatSize(totalCapacity)} được cấp`
                  : 'Chưa có dung lượng được cấp'
              }
              icon="cloud"
              iconColor="#0284c7"
              iconBg="#f0f9ff"
              progress={totalCapacity > 0 ? Math.round((totalBytes / totalCapacity) * 100) : 0}
              progressBarColor="#0284c7"
            />

            <StatCard
              label="Tổng đã thanh toán"
              value={formatMoney(totalPaid)}
              subtext="Lũy kế doanh thu hệ thống"
              icon="chart"
              iconColor="#10b981"
              iconBg="#ecfdf5"
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

            <UserStatusCard users={users} stats={stats} />
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
        </>
      )}

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
