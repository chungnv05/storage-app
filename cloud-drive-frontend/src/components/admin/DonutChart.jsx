import React from 'react';

function DonutChart({ plans, users }) {
  const total = users.length || 1;
  const colors = ['#a9bfcd', '#21899a', '#244860'];

  const counts = plans.map(p => users.filter(u => u.plan === p.id).length);

  const p0 = (counts[0] / total) * 100;
  const p1 = ((counts[0] + counts[1]) / total) * 100;

  const gradientStyle = {
    background: `conic-gradient(${colors[0]} 0 ${p0}%, ${colors[1]} ${p0}% ${p1}%, ${colors[2]} ${p1}% 100%)`
  };

  return (
    <div className="distribution">
      <div
        className="donut"
        role="img"
        aria-label={`Free ${counts[0]}, Plus ${counts[1]}, Pro ${counts[2]}`}
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
          const pct = Math.round((count / total) * 100);

          return (
            <div key={p.id} className="legend-row">
              <span className="swatch" style={{ background: colors[i] }} />
              <span>
                {p.name} · {p.gb} GB
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
