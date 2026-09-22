import React from 'react';

function Avatar({ user, size = 'normal', style = {} }) {
  if (!user) {
    return <span className={`avatar ${size === 'large' ? 'large' : ''}`} style={style}>U</span>;
  }

  if (user.avatar) {
    return (
      <img
        className={`avatar ${size === 'large' ? 'large' : ''}`}
        src={user.avatar}
        alt={user.name || 'Ảnh đại diện'}
        style={style}
      />
    );
  }

  const name = user.name || user.username || 'Người dùng';
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(-2).map(p => p[0]?.toUpperCase()).join('') || 'U';

  return (
    <span
      className={`avatar ${size === 'large' ? 'large' : ''}`}
      style={style}
      title={name}
    >
      {initials}
    </span>
  );
}

export default Avatar;
