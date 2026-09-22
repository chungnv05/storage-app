import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';

function PromoBanner() {
  return (
    <div className="promo-banner">
      <div className="d-flex align-items-center gap-3">
        <span className="fileicon">
          <Icon name="cloud" />
        </span>
        <div>
          <h3 className="mb-0">Thêm không gian cho những ý tưởng mới</h3>
          <p>Khám phá Plus 10 GB và Pro 20 GB dành cho bạn.</p>
        </div>
      </div>

      <Link to="/plans" className="btn btn-light">
        Khám phá các gói <Icon name="arrow" />
      </Link>
    </div>
  );
}

export default PromoBanner;
