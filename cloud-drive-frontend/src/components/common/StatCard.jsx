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
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Header: Label on left, Icon on right */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span
          className="text-muted fw-medium"
          style={{ fontSize: '0.875rem' }}
        >
          {label}
        </span>
        {icon && (
          <span
            style={{
              color: iconColor || '#3b82f6',
              background: iconBg || '#eff6ff',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon name={icon} />
          </span>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="my-1">
        <div
          style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.5px'
          }}
        >
          {value}
        </div>
      </div>

      {/* Subtext info */}
      {subtext && (
        <div
          className="small text-muted mt-1 text-truncate"
          title={typeof subtext === 'string' ? subtext : undefined}
          style={{ fontSize: '0.8125rem' }}
        >
          {subtext}
        </div>
      )}

      {/* Optional Progress Bar */}
      {progress !== undefined && (
        <div className="progress mt-2" style={{ height: '4px' }}>
          <div
            className="progress-bar"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              background: progressBarColor || 'var(--blue, #2563eb)'
            }}
          />
        </div>
      )}
    </div>
  );
}

export default StatCard;
