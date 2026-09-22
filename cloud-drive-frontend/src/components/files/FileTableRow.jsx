import React from 'react';
import Icon from '../common/Icon.jsx';
import Badge from '../common/Badge.jsx';
import useStorage from '../../hooks/useStorage.js';
import { formatSize, formatDate, calculateDaysRemaining } from '../../mock/utils.js';

function FileTableRow({
  file,
  onOpen,
  onProtect,
  onShare,
  onTrash,
  onRestore,
  onDeleteForever,
  isTrash = false,
  isShared = false
}) {
  const { getUser, currentUser, isItemLocked } = useStorage();

  const owner = getUser(file.owner);
  const isOwner = file.owner === currentUser.id;
  const locked = isItemLocked(file);

  const getExtension = (fileName) => {
    if (file.type === 'folder') return 'Thư mục';
    const ext = fileName.split('.').pop();
    return ext ? ext.toUpperCase() : 'TỆP';
  };

  const daysRemaining = calculateDaysRemaining(file.deleted);

  return (
    <tr id={`row-${file.id}`}>
      <td>
        <div className="namecell">
          <span className={`fileicon ${file.type}`}>
            <Icon name={file.type === 'document' ? 'file' : file.type} />
          </span>
          <div>
            <button
              type="button"
              className="file-name"
              onClick={() => (isTrash ? onRestore(file) : onOpen(file))}
            >
              {file.name}
            </button>

            {file.isLocked && (
              <span className="ms-2">
                <Badge variant={locked ? 'purple' : 'green'} icon="lock">
                  {locked ? 'Có mật khẩu' : 'Đã mở khóa'}
                </Badge>
              </span>
            )}

            <div className="small muted mt-1">
              {getExtension(file.name)}
            </div>
          </div>
        </div>
      </td>

      <td className="muted">
        {isShared
          ? (owner?.name || 'Người dùng khác')
          : file.type === 'folder'
            ? '—'
            : formatSize(file.bytes)}
      </td>

      <td className="muted text-nowrap">
        {isTrash ? `${daysRemaining} ngày` : formatDate(file.created)}
      </td>

      <td>
        <div className="row-actions">
          {isTrash ? (
            <>
              <button
                type="button"
                className="btn btn-light py-2"
                onClick={() => onRestore(file)}
              >
                <Icon name="refresh" /> Khôi phục
              </button>
              <button
                type="button"
                className="iconbtn text-danger"
                aria-label={`Xóa vĩnh viễn ${file.name}`}
                onClick={() => onDeleteForever(file)}
              >
                <Icon name="trash" />
              </button>
            </>
          ) : isOwner ? (
            <>
              <button
                type="button"
                className="btn btn-light py-2"
                onClick={() => onProtect(file)}
                title="Bảo vệ bằng mật khẩu"
              >
                <Icon name="lock" />
                {file.isLocked ? 'Bảo mật' : 'Mã hóa'}
              </button>

              <button
                type="button"
                className="btn btn-light py-2"
                onClick={() => onShare(file)}
              >
                <Icon name="share" />
                <span>
                  {file.shared && file.shared.length > 0
                    ? `${file.shared.length} người`
                    : 'Chia sẻ'}
                </span>
              </button>

              <button
                type="button"
                className="iconbtn"
                aria-label={`Xóa ${file.name}`}
                onClick={() => onTrash(file)}
              >
                <Icon name="trash" />
              </button>
            </>
          ) : (
            <>
              <Badge variant="blue">Có quyền xem</Badge>
              <button
                type="button"
                className="iconbtn ms-2"
                aria-label={`Mở ${file.name}`}
                onClick={() => onOpen(file)}
              >
                <Icon name="arrow" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default FileTableRow;
