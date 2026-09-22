import React from 'react';
import Icon from './Icon.jsx';

function EmptyState({ icon = 'folder', title, description, action }) {
  return (
    <div className="empty">
      <Icon name={icon} className="icon" />
      <h3 className="mt-3">{title}</h3>
      {description && <p className="small mb-0">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
