import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';

function EditPlanForm({ plan, onSave, onClose }) {
  const [gb, setGb] = useState(plan.gb || 0);
  const [basePrice, setBasePrice] = useState(plan.basePrice ?? plan.price ?? 0);
  const [discountPercent, setDiscountPercent] = useState(plan.discountPercent ?? plan.discount ?? 0);
  const [validTo, setValidTo] = useState(
    plan.validTo ? String(plan.validTo).split('T')[0] : (plan.until ? String(plan.until).split('T')[0] : '')
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onSave(plan.id, {
      gb: Number(gb),
      basePrice: Number(basePrice),
      price: Number(basePrice),
      discountPercent: Number(discountPercent),
      discount: Number(discountPercent),
      validTo: validTo || null,
      until: validTo || ''
    });
    if (success) {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label className="form-label" htmlFor="plan-gb">
          Dung lượng (GB)
        </label>
        <input
          id="plan-gb"
          className="form-control"
          type="number"
          min="1"
          max="10000"
          required
          value={gb}
          onChange={(e) => setGb(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="plan-price">
          Giá gốc mỗi tháng (VNĐ)
        </label>
        <input
          id="plan-price"
          className="form-control"
          type="number"
          min="0"
          step="1000"
          required
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="plan-discount">
          Khuyến mãi (%)
        </label>
        <input
          id="plan-discount"
          className="form-control"
          type="number"
          min="0"
          max="100"
          value={discountPercent}
          onChange={(e) => setDiscountPercent(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="plan-until">
          Khuyến mãi đến hết ngày (bỏ trống nếu vô thời hạn)
        </label>
        <input
          id="plan-until"
          className="form-control"
          type="date"
          value={validTo}
          onChange={(e) => setValidTo(e.target.value)}
        />
        <span className="small muted">Để khuyến mãi 0% nếu không áp dụng ưu đãi.</span>
      </div>

      <button type="submit" className="btn btn-primary w-100 mt-3">
        Lưu cấu hình
      </button>
    </form>
  );
}

function EditPlanModal({ isOpen, onClose, plan, onSave }) {
  if (!plan) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Cấu hình gói ${plan.name}`}>
      <EditPlanForm key={plan.id} plan={plan} onSave={onSave} onClose={onClose} />
    </Modal>
  );
}

export default EditPlanModal;
