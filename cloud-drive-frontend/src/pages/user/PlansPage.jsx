import React from 'react';
import { useOutletContext } from 'react-router-dom';
import PlanCard from '../../components/storage/PlanCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { LoadingPanel, ErrorAlert } from '../../components/common/PageStatus.jsx';
import usePackages from '../../hooks/usePackages.js';
import userApi from '../../api/userApi.js';

function PlansPage() {
  const { currentUser } = useOutletContext();
  const { packages, loading, error, refetchPackages } = usePackages(userApi.getPackages);

  return (
    <div className="plans-page">
      <div className="pagehead">
        <div>
          <h1 className="mb-0">Không gian phù hợp với bạn</h1>
          <p>Các gói lưu trữ hiện có trên hệ thống.</p>
        </div>
      </div>

      {/*
        TODO(BACKEND): Chưa có API mua / đổi gói dung lượng nên đã gỡ nút chọn gói và luồng thanh toán.
        Cần API (role USER) tạo yêu cầu nâng cấp gói (packageId), xử lý thanh toán, kiểm tra
        dung lượng đang dùng không vượt hạn mức gói mới, và cập nhật gói của user.
      */}

      {loading ? (
        <LoadingPanel message="Đang tải danh sách gói lưu trữ..." />
      ) : error ? (
        <ErrorAlert message={error} onRetry={refetchPackages} />
      ) : packages.length === 0 ? (
        <div className="panel">
          <EmptyState icon="card" title="Chưa có gói lưu trữ nào" />
        </div>
      ) : (
        <div className="plan-grid mb-4">
          {packages.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              // UserResponse chỉ có packageName (không có packageId) nên so khớp theo tên gói.
              isCurrent={currentUser?.packageName === plan.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PlansPage;
