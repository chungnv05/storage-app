import React from 'react';
import Icon from '../../components/common/Icon.jsx';
import PlanCard from '../../components/storage/PlanCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { LoadingPanel, ErrorAlert } from '../../components/common/PageStatus.jsx';
import usePackages from '../../hooks/usePackages.js';
import adminApi from '../../api/adminApi.js';

function AdminPackagesPage() {
  const { packages, loading, error, refetchPackages } = usePackages(adminApi.getAllPackages);

  return (
    <div className="admin-plans-page">
      <div className="pagehead">
        <div>
          <h1 className="mb-0">Gói &amp; khuyến mãi</h1>
          <p>Dung lượng, giá bán và ưu đãi đang hiệu lực của từng gói.</p>
        </div>

        <div className="actions">
          <button
            type="button"
            className="btn btn-light"
            onClick={refetchPackages}
            title="Làm mới danh sách gói"
          >
            <Icon name="refresh" /> Làm mới
          </button>
        </div>
      </div>

      {/*
        TODO(BACKEND): Chưa có API cấu hình gói nên đã gỡ nút "Cấu hình gói" và modal chỉnh sửa.
        Cần API (role ADMIN) để: cập nhật dung lượng gói (có kiểm tra user đang dùng vượt hạn mức mới),
        thêm dòng giá mới cho gói (basePrice, discountPercent, validFrom, validTo — backend lưu lịch sử
        giá theo dòng, không sửa dòng cũ), và tạo / ngừng kích hoạt gói.
      */}

      {loading ? (
        <LoadingPanel message="Đang tải danh sách gói lưu trữ từ hệ thống..." />
      ) : error ? (
        <ErrorAlert title="Lỗi tải gói lưu trữ:" message={error} onRetry={refetchPackages} />
      ) : packages.length === 0 ? (
        <div className="panel mb-4">
          <EmptyState icon="card" title="Chưa có gói lưu trữ nào đang hoạt động" />
        </div>
      ) : (
        <div className="plan-grid mb-4">
          {packages.map(plan => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPackagesPage;
