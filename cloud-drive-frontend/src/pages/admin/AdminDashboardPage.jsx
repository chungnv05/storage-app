import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import DonutChart from '../../components/admin/DonutChart.jsx';
import UserStatusCard from '../../components/admin/UserStatusCard.jsx';
import AdminUsersTable from '../../components/admin/AdminUsersTable.jsx';
import UserDetailModal from '../../components/admin/UserDetailModal.jsx';
import BlockUserModal from '../../components/admin/BlockUserModal.jsx';
import { LoadingPanel, ErrorAlert, SuccessAlert } from '../../components/common/PageStatus.jsx';
import usePackages from '../../hooks/usePackages.js';
import useAdminUsers from '../../hooks/useAdminUsers.js';
import useAdminStats from '../../hooks/useAdminStats.js';
import adminApi from '../../api/adminApi.js';
import { formatDate } from '../../utils/format.js';

function AdminDashboardPage() {
  const {
    stats,
    loading: loadingStats,
    error: errorStats,
    refetchStats
  } = useAdminStats();

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

  const navigate = useNavigate();

  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
  const [selectedUserForBlock, setSelectedUserForBlock] = useState(null);
  const [notification, setNotification] = useState('');

  const currentUserDetail = useMemo(() => {
    if (!selectedUserForDetail) return null;
    return users.find(u => u.id === selectedUserForDetail.id) || selectedUserForDetail;
  }, [selectedUserForDetail, users]);

  const recentUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [users]);

  const [currentDate] = useState(() => formatDate(Date.now()));

  const handleRefresh = () => {
    refetchStats();
    refetchUsers();
    refetchPackages();
  };

  const handleConfirmStatusChange = async (userId, targetStatus) => {
    await updateUserStatus(userId, targetStatus);
    setNotification(targetStatus === 'LOCKED' ? 'Đã khóa tài khoản thành công.' : 'Đã mở khóa tài khoản thành công.');
    // Số tài khoản đang hoạt động thay đổi theo trạng thái vừa cập nhật.
    refetchStats();
  };

  // Không che cả trang khi chỉ làm mới stats sau khi khóa/mở khóa tài khoản.
  const isLoading = (loadingStats && !stats) || loadingUsers || loadingPackages;
  const errorMessage = errorStats || errorUsers || errorPackages;

  return (
    <div className="admin-dashboard-page">
      <div className="pagehead">
        <div>
          <h1 className="mb-0">Tổng quan hệ thống</h1>
          <p>Theo dõi người dùng và gói lưu trữ.</p>
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

      {notification && (
        <SuccessAlert message={notification} onClose={() => setNotification('')} />
      )}

      {isLoading ? (
        <LoadingPanel message="Đang tải thông tin tổng quan hệ thống..." />
      ) : errorMessage ? (
        <ErrorAlert message={errorMessage} onRetry={handleRefresh} />
      ) : (
        <>
          {/*
            TODO(BACKEND): Đã gỡ các thẻ "Người dùng trả phí", "Dung lượng đã dùng" và "Tổng đã thanh toán".
            GET /api/admin/stats có trả paidUsers, storageUsedBytes, storageLimitBytes, totalPaidAmount
            nhưng AdminService.getStats đang gán cứng các giá trị này bằng 0 ("xử lý sau").
            Cần backend tính thật: số user đang dùng gói trả phí, tổng dung lượng đã dùng / đã cấp
            của toàn hệ thống, và tổng doanh thu từ thanh toán — rồi mới hiển thị lại các thẻ này.
          */}
          <div className="cards mb-4">
            <StatCard
              label="Tổng người dùng"
              value={stats.totalUsers}
              subtext={`${stats.activeUsers} tài khoản đang hoạt động`}
              icon="users"
              iconColor="#2563eb"
              iconBg="#eff6ff"
            />
          </div>

          <div className="admincols mb-4">
            <section className="panel chartpanel">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Người dùng theo gói</h2>
                <span className="small muted">{users.length} tài khoản</span>
              </div>

              <DonutChart plans={packages} users={users} />
            </section>

            <UserStatusCard stats={stats} />
          </div>

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

export default AdminDashboardPage;
