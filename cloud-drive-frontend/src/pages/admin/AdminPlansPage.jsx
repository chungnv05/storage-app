import React, { useState } from 'react';
import Icon from '../../components/common/Icon.jsx';
import PlanCard from '../../components/storage/PlanCard.jsx';
import EditPlanModal from '../../components/admin/EditPlanModal.jsx';
import usePlans from '../../hooks/usePlans.js';

function AdminPlansPage() {
  const { plans = [], loading, error, refetchPlans, updatePlan } = usePlans();
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState(null);
  const [notification, setNotification] = useState('');

  const handleEditPlan = (plan) => {
    setSelectedPlanForEdit(plan);
  };

  const handleSavePlan = (planId, updatedFields) => {
    const success = updatePlan ? updatePlan(planId, updatedFields) : false;
    if (success) {
      setNotification('Đã cập nhật cấu hình gói cước thành công.');
      setTimeout(() => setNotification(''), 4000);
    }
    return success;
  };

  return (
    <div className="admin-plans-page">
      <div className="pagehead">
        <div>
          <h1 className="mb-0">Gói &amp; khuyến mãi</h1>
          <p>Quản lý dung lượng, giá bán và ưu đãi của từng gói.</p>
        </div>

        <div className="actions">
          <button
            type="button"
            className="btn btn-light"
            onClick={refetchPlans}
            title="Làm mới danh sách gói"
          >
            <Icon name="refresh" /> Làm mới
          </button>
        </div>
      </div>

      {notification && (
        <div className="alert alert-success d-flex justify-content-between align-items-center mb-4">
          <span>{notification}</span>
          <button
            type="button"
            className="btn-close"
            onClick={() => setNotification('')}
            aria-label="Đóng"
          />
        </div>
      )}

      {loading && plans.length === 0 ? (
        <div className="panel p-5 text-center mb-4">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="text-muted mb-0">Đang tải danh sách gói lưu trữ từ hệ thống...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4">
          <div>
            <strong>Lỗi tải gói lưu trữ:</strong> {error}
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={refetchPlans}
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="plan-grid mb-4">
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isAdmin={true}
              onAction={handleEditPlan}
            />
          ))}
        </div>
      )}

      <div className="panel padded">
        <div className="d-flex gap-3 align-items-start">
          <span className="fileicon" style={{ marginTop: 2 }}>
            <Icon name="card" />
          </span>
          <div>
            <h3 className="mb-1">Cấu hình áp dụng cho toàn bộ tài khoản</h3>
            <p className="small muted mb-0">
              Ưu đãi được áp dụng khi mua gói trong thời gian còn hiệu lực. Hệ thống kiểm tra dung lượng đang dùng trước khi giảm hạn mức.
            </p>
          </div>
        </div>
      </div>

      <EditPlanModal
        isOpen={Boolean(selectedPlanForEdit)}
        onClose={() => setSelectedPlanForEdit(null)}
        plan={selectedPlanForEdit}
        onSave={handleSavePlan}
      />
    </div>
  );
}

export default AdminPlansPage;
