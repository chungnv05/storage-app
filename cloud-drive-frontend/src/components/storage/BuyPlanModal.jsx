import React from 'react';
import Modal from '../common/Modal.jsx';
import { formatMoney, calculateDiscountPrice } from '../../mock/utils.js';

function BuyPlanModal({ isOpen, onClose, plan, onConfirm }) {
  if (!plan) return null;

  const effectivePrice = calculateDiscountPrice(plan);

  const handleConfirm = () => {
    onConfirm(plan.id);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Xác nhận gói ${plan.name}`}>
      <div className="p-3 rounded mb-4" style={{ background: '#f3f7fd' }}>
        <div className="d-flex justify-content-between mb-3">
          <span>Gói {plan.name}</span>
          <b>{plan.gb} GB / tháng</b>
        </div>
        <div className="d-flex justify-content-between">
          <span>Thanh toán minh họa</span>
          <b>{formatMoney(effectivePrice)}</b>
        </div>
      </div>

      <p className="small muted">
        Hạn mức sẽ được cập nhật ngay sau xác nhận. Không có giao dịch tiền thật trong môi trường prototype.
      </p>

      <button
        type="button"
        className="btn btn-primary w-100"
        onClick={handleConfirm}
      >
        Xác nhận thanh toán mô phỏng
      </button>
    </Modal>
  );
}

export default BuyPlanModal;
