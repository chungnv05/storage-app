import React, { useState } from 'react';
import Icon from '../../components/common/Icon.jsx';
import PlanCard from '../../components/storage/PlanCard.jsx';
import EditPlanModal from '../../components/admin/EditPlanModal.jsx';
import useStorage from '../../hooks/useStorage.js';

function AdminPlansPage() {
  const { plans, adminEditPlan } = useStorage();
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState(null);

  const handleEditPlan = (plan) => {
    setSelectedPlanForEdit(plan);
  };

  return (
    <div className="admin-plans-page">
      <div className="pagehead">
        <div>
          <h1 className="mb-0">Gói &amp; khuyến mãi</h1>
          <p>Quản lý dung lượng, giá bán và ưu đãi của từng gói.</p>
        </div>
      </div>

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
        onSave={adminEditPlan}
      />
    </div>
  );
}

export default AdminPlansPage;
