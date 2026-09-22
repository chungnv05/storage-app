import React from 'react';
import Icon from './Icon.jsx';

function StatCard({
  label,
  value,
  subtext,
  icon,
  iconColor,
  iconBg,
  progress,
  progressBarColor,
  onClick,
  className = ''
}) {
  return (
    <div
      className={`statcard ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        {icon ? (
          <span
            className="fileicon"
            style={{
              color: iconColor || '#4b82db',
              background: iconBg || '#eef4ff'
            }}
          >
            <Icon name={icon} />
          </span>
        ) : (
          <span className="small muted">{label}</span>
        )}

        {subtext && !icon && (
          <span className="muted">
            <Icon name={icon || 'chart'} />
          </span>
        )}

        {icon && label && <span className="muted small">{label}</span>}
      </div>

      <div className="d-flex justify-content-between align-items-baseline gap-1">
        {icon ? (
          <>
            <h3 className="mb-0">{subtext}</h3>
            <strong>{value}</strong>
          </>
        ) : (
          <div>
            <div className="metric">{value}</div>
            <span className="small muted">{subtext}</span>
          </div>
        )}
      </div>

      {progress !== undefined && (
        <div className="progress">
          <div
            className="progress-bar"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              background: progressBarColor || 'var(--blue)'
            }}
          />
        </div>
      )}
    </div>
  );
}

export default StatCard;
