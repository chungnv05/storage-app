import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon.jsx';
import Modal from '../../components/common/Modal.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import NotificationItem from '../../components/notifications/NotificationItem.jsx';
import FilePreviewModal from '../../components/files/FilePreviewModal.jsx';
import useStorage from '../../hooks/useStorage.js';
import { formatDate } from '../../mock/utils.js';

function NotificationsPage() {
  const { notices, currentUser, files, markAllNoticesRead, markNoticeRead, toast } = useStorage();
  const navigate = useNavigate();

  const [activeNoticeModal, setActiveNoticeModal] = useState(null);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState(null);

  const userNotices = useMemo(() => {
    return notices
      .filter(n => n.to === currentUser.id)
      .sort((a, b) => b.at - a.at);
  }, [notices, currentUser.id]);

  const handleNoticeClick = (notice) => {
    markNoticeRead(notice.id);

    if (notice.file) {
      const f = files.find(item => item.id === notice.file);
      if (!f || f.deleted) {
        toast('Tài liệu đã bị xóa hoặc quyền chia sẻ đã được thu hồi.');
        return;
      }
      if (f.type === 'folder') {
        navigate(`/shared/${f.id}`);
      } else {
        setSelectedFileForPreview(f);
      }
    } else {
      setActiveNoticeModal(notice);
    }
  };

  return (
    <div className="notifications-page">
      <div className="pagehead">
        <div>
          <h1 className="mb-0">Thông báo</h1>
          <p>Cập nhật chia sẻ tài liệu và các ưu đãi dành cho bạn.</p>
        </div>

        <div className="actions">
          <button
            type="button"
            className="btn btn-light"
            onClick={markAllNoticesRead}
          >
            <Icon name="check" /> Đánh dấu đã đọc tất cả
          </button>
        </div>
      </div>

      <div className="panel">
        {userNotices.length > 0 ? (
          <div>
            {userNotices.map(notice => (
              <NotificationItem
                key={notice.id}
                notice={notice}
                onClick={handleNoticeClick}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="bell"
            title="Bạn chưa có thông báo"
            description="Các thông báo mới sẽ xuất hiện tại đây."
          />
        )}
      </div>

      {/* Notice info modal for system / plan broadcast */}
      {activeNoticeModal && (
        <Modal
          isOpen={Boolean(activeNoticeModal)}
          onClose={() => setActiveNoticeModal(null)}
          title={activeNoticeModal.title}
        >
          <p className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>
            {activeNoticeModal.text}
          </p>

          <p className="small muted mb-4">
            {formatDate(activeNoticeModal.at)}
          </p>

          <button
            type="button"
            className="btn btn-primary w-100"
            onClick={() => {
              setActiveNoticeModal(null);
              navigate('/plans');
            }}
          >
            Xem các gói dung lượng
          </button>
        </Modal>
      )}

      {/* File preview modal when notice is about a shared file */}
      <FilePreviewModal
        isOpen={Boolean(selectedFileForPreview)}
        onClose={() => setSelectedFileForPreview(null)}
        file={selectedFileForPreview}
      />
    </div>
  );
}

export default NotificationsPage;
