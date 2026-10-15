import React from 'react';

/** `user` có cấu trúc UserResponse của backend ({ fullName, email, avatarUrl, ... }). */
function Avatar({ user, size = 'normal', style = {} }) {
  if (!user) {
    return <span className={`avatar ${size === 'large' ? 'large' : ''}`} style={style}>U</span>;
  }

  if (user.avatarUrl) {
    return (
      <img
        className={`avatar ${size === 'large' ? 'large' : ''}`}
        src={user.avatarUrl}
        alt={user.fullName || 'Ảnh đại diện'}
        style={style}
      />
    );
  }

  const name = user.fullName || user.email || 'Người dùng';
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
