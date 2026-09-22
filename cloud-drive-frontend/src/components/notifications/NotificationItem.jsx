import React from 'react';
import Icon from '../common/Icon.jsx';
import Badge from '../common/Badge.jsx';
import { formatDate } from '../../mock/utils.js';

function NotificationItem({ notice, onClick }) {
  const isUnread = !notice.read;

  return (
    <button
      type="button"
      className={`notification ${isUnread ? 'unread' : ''}`}
      onClick={() => onClick(notice)}
    >
      <span className="fileicon">
        <Icon name={notice.file ? 'share' : 'bell'} />
      </span>

      <div className="flex-grow-1 text-start">
        <div className="d-flex align-items-center gap-2">
          <strong>{notice.title}</strong>
          {isUnread && <Badge variant="blue">Mới</Badge>}
        </div>

        <p>{notice.text}</p>

        <span className="small muted">
          {formatDate(notice.at)}
          {notice.file ? ' · Bấm để xem tài liệu được chia sẻ' : ''}
        </span>
      </div>

      <Icon name="arrow" />
    </button>
  );
}

export default NotificationItem;
