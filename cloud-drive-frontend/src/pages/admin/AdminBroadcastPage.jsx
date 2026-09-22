import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../../components/common/Icon.jsx';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import useStorage from '../../hooks/useStorage.js';
import { formatDate } from '../../mock/utils.js';

function AdminBroadcastPage() {
  const { users, campaigns, adminSendBroadcast, getUser } = useStorage();
  const location = useLocation();

  const [audience, setAudience] = useState(location.state?.targetUserId || 'all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [previewData, setPreviewData] = useState(null);

  const handlePreviewSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setPreviewData({
      audience,
      title: title.trim(),
      message: message.trim()
    });
  };

  const handleConfirmSend = () => {
    if (!previewData) return;
    adminSendBroadcast(previewData);
    setPreviewData(null);
    setTitle('');
    setMessage('');
  };

  const getAudienceLabel = (aud) => {
    if (aud === 'all') return `Tất cả (${users.length} tài khoản)`;
    const u = getUser(aud);
    return u ? `${u.name} (${u.email})` : aud;
  };

  return (
    <div className="admin-broadcast-page">
      <div className="pagehead">
        <div>
          <h1 className="mb-0">Gửi thông báo</h1>
          <p>Gửi ưu đãi riêng cho từng tài khoản hoặc thông báo đến tất cả người dùng.</p>
        </div>
      </div>

      <div className="account-grid">
        {/* Left: Compose Form */}
        <section className="panel padded">
          <h2 className="mb-4">Soạn thông báo mới</h2>

          <form onSubmit={handlePreviewSubmit}>
            <div className="form-field">
              <label className="form-label" htmlFor="broadcast-audience">
                Người nhận
              </label>
              <select
                id="broadcast-audience"
                className="form-select"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              >
                <option value="all">
                  Tất cả người dùng ({users.length} tài khoản)
                </option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} · {u.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="broadcast-title">
                Tiêu đề
              </label>
              <input
                id="broadcast-title"
                className="form-control"
                type="text"
                required
                maxLength={120}
                placeholder="Ví dụ: Ưu đãi nâng cấp dành riêng cho bạn"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="broadcast-message">
                Nội dung
              </label>
              <textarea
                id="broadcast-message"
                className="form-control"
                rows={6}
                maxLength={2000}
                required
                placeholder="Nhập nội dung ưu đãi, thời gian áp dụng và điều kiện…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <p className="small muted">
              Thông báo sẽ xuất hiện tại mục Thông báo của người nhận trong prototype.
            </p>

            <button type="submit" className="btn btn-primary mt-2">
              <Icon name="bell" /> Xem trước và gửi
            </button>
          </form>
        </section>

        {/* Right: History */}
        <section className="panel padded">
          <h2 className="mb-4">Lịch sử gửi</h2>

          {campaigns.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {campaigns.map(c => (
                <div key={c.id} className="border-bottom pb-3">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                    <h3 className="mb-0">{c.title}</h3>
                    <Badge variant="green">Đã gửi</Badge>
                  </div>

                  <p className="small muted mb-2" style={{ whiteSpace: 'pre-wrap' }}>
                    {c.text}
                  </p>

                  <div className="small muted">
                    {c.count} người nhận · {formatDate(c.at)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="bell"
              title="Chưa có thông báo đã gửi"
              description="Các ưu đãi bạn gửi sẽ được ghi lại tại đây."
            />
          )}
        </section>
      </div>

      {/* Preview Modal */}
      {previewData && (
        <Modal
          isOpen={Boolean(previewData)}
          onClose={() => setPreviewData(null)}
          title="Xem trước thông báo"
        >
          <div className="mb-3">
            <Badge variant="blue">
              {getAudienceLabel(previewData.audience)}
            </Badge>
          </div>

          <h3 className="mb-3">{previewData.title}</h3>

          <p className="p-3 rounded mb-4" style={{ background: '#f5f8fd', whiteSpace: 'pre-wrap' }}>
            {previewData.message}
          </p>

          <button
            type="button"
            className="btn btn-primary w-100"
            onClick={handleConfirmSend}
          >
            Xác nhận gửi thông báo mẫu
          </button>
        </Modal>
      )}
    </div>
  );
}

export default AdminBroadcastPage;
