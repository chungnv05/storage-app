import React from 'react';
import Icon from '../common/Icon.jsx';
import Badge from '../common/Badge.jsx';
import useStorage from '../../hooks/useStorage.js';
import { formatMoney, formatDate, calculateDiscountPrice } from '../../mock/utils.js';

function PlanCard({ plan, isAdmin = false, onAction }) {
  const { currentUser } = useStorage();

  const planKey = (plan.name || String(plan.id) || '').toLowerCase();
  const isCurrentPlan =
    currentUser?.plan === plan.id ||
    currentUser?.packageName?.toLowerCase() === plan.name?.toLowerCase() ||
    currentUser?.plan === plan.name?.toLowerCase();
  const isFeatured = planKey.includes('plus') || planKey.includes('premium');
  const effectivePrice = calculateDiscountPrice(plan);
  const hasDiscount = plan.price > 0 && effectivePrice < plan.price;

  const getBadgeText = () => {
    if (!isAdmin && isCurrentPlan) return 'Đang sử dụng';
    if (planKey.includes('plus') || planKey.includes('premium')) return 'Phổ biến';
    if (planKey.includes('free')) return 'Khởi đầu';
    if (planKey.includes('pro')) return 'Chuyên nghiệp';
    return 'Tiêu chuẩn';
  };

  const getButtonText = () => {
    if (isAdmin) return 'Cấu hình gói';
    if (isCurrentPlan) return 'Gói hiện tại';
    if (planKey.includes('free')) return 'Chuyển về Free';
    return `Chọn gói ${plan.name}`;
  };

  return (
    <section className={`plancard ${isFeatured ? 'featured' : ''}`}>
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="mb-0">{plan.name}</h2>
        <Badge
          variant={isCurrentPlan && !isAdmin ? 'blue' : isFeatured ? 'blue' : 'gray'}
        >
          {getBadgeText()}
        </Badge>
      </div>

      <div className="plan-space">
        {plan.gb}{' '}
        <span style={{ fontSize: '23px', fontWeight: 500, letterSpacing: 0 }}>
          GB
        </span>
      </div>

      <p className="small muted">Dung lượng lưu trữ của bạn</p>

      <div className="plan-price">
        {formatMoney(effectivePrice)}
        <span className="small muted fw-normal"> / tháng</span>
      </div>

      {hasDiscount ? (
        <p className="small mb-0">
          <del className="muted">{formatMoney(plan.basePrice ?? plan.price)}</del>{' '}
          <Badge variant="green">Giảm {plan.discountPercent ?? plan.discount}%</Badge>
          <br />
          {plan.validTo ? (
            <span className="muted">Đến {formatDate(plan.validTo)}</span>
          ) : (
            <span className="muted">Áp dụng dài hạn</span>
          )}
        </p>
      ) : (
        <p className="small muted mb-0">
          {(plan.basePrice ?? plan.price) === 0 ? 'Miễn phí trải nghiệm' : 'Thanh toán theo tháng'}
        </p>
      )}

      <ul className="plan-features">
        <li>
          <Icon name="check" className="icon" /> Lưu trữ và sắp xếp tài liệu
        </li>
        <li>
          <Icon name="check" className="icon" /> Chia sẻ với tài khoản khác
        </li>
        <li>
          <Icon name="check" className="icon" /> Khôi phục trong vòng 30 ngày
        </li>
      </ul>

      <button
        type="button"
        className={`btn ${isFeatured ? 'btn-primary' : 'btn-light'} w-100`}
        disabled={!isAdmin && isCurrentPlan}
        onClick={() => onAction(plan)}
      >
        {getButtonText()}
        <Icon name={isAdmin ? 'edit' : 'arrow'} />
      </button>
    </section>
  );
}

export default PlanCard;
