import React, { useState } from 'react';
import Icon from '../../components/common/Icon.jsx';
import PlanCard from '../../components/storage/PlanCard.jsx';
import BuyPlanModal from '../../components/storage/BuyPlanModal.jsx';
import useAuth from '../../hooks/useAuth.js';

function PlansPage() {
  const { plans, buyPlan } = useAuth();
  const [selectedPlanForBuy, setSelectedPlanForBuy] = useState(null);

  const handleSelectPlan = (plan) => {
    setSelectedPlanForBuy(plan);
  };

  return (
    <div className="plans-page">
      <div className="pagehead">
        <div>
          <h1 className="mb-0">Không gian phù hợp với bạn</h1>
          <p>Chọn gói lưu trữ phù hợp. Có thể nâng cấp bất cứ lúc nào.</p>
        </div>
      </div>

      <div className="plan-grid mb-4">
        {plans.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isAdmin={false}
            onAction={handleSelectPlan}
          />
        ))}
      </div>

      <div className="panel padded">
        <div className="d-flex gap-3 align-items-start">
          <span className="fileicon" style={{ marginTop: 2 }}>
            <Icon name="card" />
          </span>
          <div>
            <h3 className="mb-1">Thông tin thanh toán</h3>
            <p className="small muted mb-0">
              Đây là luồng thanh toán mô phỏng, không thu tiền. Giá tính theo tháng; đổi gói sẽ thay thế hạn mức hiện tại, không cộng dồn dung lượng.
            </p>
          </div>
        </div>
      </div>

      <BuyPlanModal
        isOpen={Boolean(selectedPlanForBuy)}
        onClose={() => setSelectedPlanForBuy(null)}
        plan={selectedPlanForBuy}
        onConfirm={(planId) => buyPlan(planId)}
      />
    </div>
  );
}

export default PlansPage;
