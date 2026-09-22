import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';

function EditPlanForm({ plan, onSave, onClose }) {
  const [gb, setGb] = useState(plan.gb);
  const [price, setPrice] = useState(plan.price);
  const [discount, setDiscount] = useState(plan.discount || 0);
  const [until, setUntil] = useState(plan.until || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onSave(plan.id, {
      gb: Number(gb),
      price: Number(price),
      discount: Number(discount),
      until
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
          Giá mỗi tháng (VNĐ)
        </label>
        <input
          id="plan-price"
          className="form-control"
          type="number"
          min="0"
          step="1000"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
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
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="plan-until">
          Khuyến mãi đến hết ngày
        </label>
        <input
          id="plan-until"
          className="form-control"
          type="date"
          value={until}
          onChange={(e) => setUntil(e.target.value)}
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
