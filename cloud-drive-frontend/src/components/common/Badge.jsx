import React from 'react';
import Icon from './Icon.jsx';

function Badge({ variant = 'blue', children, icon, className = '', style = {} }) {
  return (
    <span className={`badge ${variant} ${className}`} style={style}>
      {icon && <Icon name={icon} className="icon" />}
      {children}
    </span>
  );
}

export default Badge;
