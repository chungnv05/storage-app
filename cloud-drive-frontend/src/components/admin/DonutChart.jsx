import React from 'react';
import { formatSize } from '../../utils/format.js';

const PALETTE = ['#a9bfcd', '#21899a', '#244860', '#5e72e4', '#11cdef', '#2dce89', '#fb6340'];

/**
 * Phân bổ user theo gói. UserResponse chỉ có packageName (không có packageId)
 * nên đếm theo tên gói.
 */
function DonutChart({ plans = [], users = [] }) {
  const total = users.length;

  const counts = plans.map(p => users.filter(u => u.packageName === p.name).length);

  let gradientStyle;
  if (total === 0) {
    gradientStyle = { background: '#e9ecef' };
  } else {
    let accumulated = 0;
    const segments = [];
    plans.forEach((_, i) => {
      const count = counts[i] || 0;
      const pct = (count / total) * 100;
      const start = accumulated;
      const end = accumulated + pct;
      const color = PALETTE[i % PALETTE.length];
      segments.push(`${color} ${start.toFixed(1)}% ${end.toFixed(1)}%`);
      accumulated = end;
    });
    gradientStyle = {
      background: segments.length > 0 ? `conic-gradient(${segments.join(', ')})` : '#e9ecef'
    };
  }

  const ariaLabel = plans.map((p, i) => `${p.name} ${counts[i] || 0}`).join(', ');

  return (
    <div className="distribution">
      <div
        className="donut"
        role="img"
        aria-label={ariaLabel || 'Phân bổ gói người dùng'}
        style={gradientStyle}
      >
        <span>
          <b style={{ fontSize: '30px' }}>{total}</b>
          <br />
          <small className="muted">người dùng</small>
        </span>
      </div>

      <div className="legend">
        {plans.map((p, i) => {
          const count = counts[i] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const color = PALETTE[i % PALETTE.length];

          return (
            <div key={p.id} className="legend-row">
              <span className="swatch" style={{ background: color }} />
              <span>
                {p.name} · {formatSize(p.storageLimitBytes)}
              </span>
              <b>{count}</b>
              <span className="muted">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DonutChart;
