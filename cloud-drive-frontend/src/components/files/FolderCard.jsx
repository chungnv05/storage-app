import React from 'react';
import Icon from '../common/Icon.jsx';
import Badge from '../common/Badge.jsx';
import useStorage from '../../hooks/useStorage.js';

function FolderCard({
  folder,
  onOpen,
  onProtect,
  onDetails
}) {
  const { files, currentUser, isItemLocked } = useStorage();

  const locked = isItemLocked(folder);
  const directItemsCount = files.filter(
    f => f.parent === folder.id && !f.deleted
  ).length;

  const isOwner = folder.owner === currentUser.id;

  return (
    <div className="foldercard">
      <button
        type="button"
        className="folder-open"
        onClick={() => onOpen(folder)}
      >
        <span className="fileicon folder">
          <Icon name="folder" />
        </span>

        <h3>{folder.name}</h3>

        <div className="small muted">
          {locked
            ? 'Nhập mật khẩu để xem nội dung'
            : `${directItemsCount} mục trực tiếp`}
        </div>

        {folder.isLocked && (
          <div className="mt-2">
            <Badge variant={locked ? 'purple' : 'green'} icon="lock">
              {locked ? 'Có mật khẩu' : 'Đã mở khóa'}
            </Badge>
          </div>
        )}
      </button>

      {isOwner ? (
        <div className="folder-tools">
          <button
            type="button"
            className="btn btn-light py-2"
            onClick={() => onProtect(folder)}
            title="Bảo vệ bằng mật khẩu"
          >
            <Icon name="lock" />
            {folder.isLocked ? 'Bảo mật' : 'Mã hóa'}
          </button>

          <button
            type="button"
            className="iconbtn"
            aria-label={`Tùy chọn ${folder.name}`}
            onClick={() => onDetails(folder)}
          >
            <Icon name="edit" />
          </button>
        </div>
      ) : (
        <div className="px-3 pb-3">
          <Badge variant="blue">Được chia sẻ</Badge>
        </div>
      )}
    </div>
  );
}

export default FolderCard;
