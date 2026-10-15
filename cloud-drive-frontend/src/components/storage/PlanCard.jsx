import React from 'react';
import Badge from '../common/Badge.jsx';
import { formatMoney, formatDate, formatSize } from '../../utils/format.js';

/**
 * `plan` là một gói đã gộp bởi usePackages: { id, name, storageLimitBytes, pricing }
 * với `pricing` là dòng giá đang hiệu lực hoặc null.
 */
function PlanCard({ plan, isCurrent = false }) {
  const planKey = (plan.name || '').toLowerCase();
  const isFeatured = planKey.includes('plus') || planKey.includes('premium');
  const { pricing } = plan;
  const hasDiscount = pricing && pricing.discountPercent > 0;

  const getBadgeText = () => {
    if (isCurrent) return 'Đang sử dụng';
    if (planKey.includes('plus') || planKey.includes('premium')) return 'Phổ biến';
    if (planKey.includes('free')) return 'Khởi đầu';
    if (planKey.includes('pro')) return 'Chuyên nghiệp';
    return 'Tiêu chuẩn';
  };

  return (
    <section className={`plancard ${isFeatured ? 'featured' : ''}`}>
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="mb-0">{plan.name}</h2>
        <Badge variant={isCurrent || isFeatured ? 'blue' : 'gray'}>
          {getBadgeText()}
        </Badge>
      </div>

      <div className="plan-space">
        {formatSize(plan.storageLimitBytes)}
      </div>

      <p className="small muted">Dung lượng lưu trữ</p>

      {pricing ? (
        <>
          <div className="plan-price">
            {formatMoney(pricing.effectivePrice)}
          </div>

          {hasDiscount ? (
            <p className="small mb-0">
              <del className="muted">{formatMoney(pricing.basePrice)}</del>{' '}
              <Badge variant="green">Giảm {pricing.discountPercent}%</Badge>
              <br />
              {pricing.validTo ? (
                <span className="muted">Đến {formatDate(pricing.validTo)}</span>
              ) : (
                <span className="muted">Áp dụng dài hạn</span>
              )}
            </p>
          ) : (
            <p className="small muted mb-0">
              {pricing.basePrice === 0 ? 'Miễn phí' : 'Giá hiện hành'}
            </p>
          )}
        </>
      ) : (
        <p className="small muted mb-0">Chưa có bảng giá đang hiệu lực</p>
      )}
    </section>
  );
}

export default PlanCard;
