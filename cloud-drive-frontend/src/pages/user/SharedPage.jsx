import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon.jsx';
import FolderBreadcrumb from '../../components/files/FolderBreadcrumb.jsx';
import FolderContextBar from '../../components/files/FolderContextBar.jsx';
import FolderGrid from '../../components/files/FolderGrid.jsx';
import FileTable from '../../components/files/FileTable.jsx';
import FilePreviewModal from '../../components/files/FilePreviewModal.jsx';
import ProtectionModal from '../../components/files/ProtectionModal.jsx';
import useStorage from '../../hooks/useStorage.js';

function SharedPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const { files, currentUser, searchQuery, typeFilter, isItemLocked } = useStorage();

  const [selectedFileForPreview, setSelectedFileForPreview] = useState(null);
  const [protectionModalData, setProtectionModalData] = useState(null);

  const currentFolder = useMemo(() => {
    if (!folderId) return null;
    return files.find(f => f.id === folderId && !f.deleted);
  }, [files, folderId]);

  const isCurrentFolderLocked = currentFolder ? isItemLocked(currentFolder) : false;

  // Filter shared items
  const sharedItems = useMemo(() => {
    let list = files.filter(f => !f.deleted && f.owner !== currentUser.id);

    if (folderId) {
      list = list.filter(f => f.parent === folderId);
    } else {
      list = list.filter(f => (f.shared || []).includes(currentUser.id) && !f.parent);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q));
    }

    if (typeFilter) {
      list = list.filter(f => f.type === typeFilter);
    }

    return list;
  }, [files, currentUser.id, folderId, searchQuery, typeFilter]);

  const subfolders = useMemo(() => {
    if (searchQuery || typeFilter) return [];
    return sharedItems.filter(f => f.type === 'folder');
  }, [sharedItems, searchQuery, typeFilter]);

  const fileRows = useMemo(() => {
    if (searchQuery || typeFilter) return sharedItems;
    return sharedItems.filter(f => f.type !== 'folder');
  }, [sharedItems, searchQuery, typeFilter]);

  const handleOpenItem = (item) => {
    if (isItemLocked(item)) {
      setProtectionModalData({ file: item, mode: 'unlock' });
      return;
    }

    if (item.type === 'folder') {
      navigate(`/shared/${item.id}`);
    } else {
      setSelectedFileForPreview(item);
    }
  };

  const pageTitle = currentFolder ? currentFolder.name : 'Chia sẻ với tôi';

  return (
    <div className="shared-page">
      <div className="pagehead">
        <div>
          <h1 className="mb-0">{pageTitle}</h1>
          <p>Tài liệu và thư mục được đồng nghiệp chia sẻ với bạn.</p>
        </div>
      </div>

      {currentFolder && (
        <>
          <FolderBreadcrumb currentFolder={currentFolder} basePath="/shared" />
          <FolderContextBar currentFolder={currentFolder} basePath="/shared" />
        </>
      )}

      {isCurrentFolderLocked ? (
        <div className="panel padded text-center my-4">
          <Icon name="lock" style={{ width: 44, height: 44, color: 'var(--blue)', marginBottom: 15 }} />
          <h3>Thư mục được bảo vệ bằng mật khẩu</h3>
          <p className="muted small mb-4">
            Nhập mật khẩu để xem thư mục con và các tệp bên trong.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setProtectionModalData({ file: currentFolder, mode: 'unlock' })}
          >
            <Icon name="lock" /> Mở khóa thư mục
          </button>
        </div>
      ) : (
        <>
          <FolderGrid
            folders={subfolders}
            onOpenFolder={handleOpenItem}
            onProtectFolder={() => {}}
            onDetailsFolder={(f) => setSelectedFileForPreview(f)}
            isShared={true}
            isSubfolder={Boolean(folderId)}
          />

          <FileTable
            files={fileRows}
            title={folderId ? 'Tệp trong thư mục' : 'Tài liệu được chia sẻ'}
            isShared={true}
            onOpenFile={handleOpenItem}
          />
        </>
      )}

      <FilePreviewModal
        isOpen={Boolean(selectedFileForPreview)}
        onClose={() => setSelectedFileForPreview(null)}
        file={selectedFileForPreview}
      />

      {protectionModalData && (
        <ProtectionModal
          isOpen={Boolean(protectionModalData)}
          onClose={() => setProtectionModalData(null)}
          file={protectionModalData.file}
          mode={protectionModalData.mode}
          onSuccess={() => {
            if (protectionModalData.file.type === 'folder') {
              navigate(`/shared/${protectionModalData.file.id}`);
            }
          }}
        />
      )}
    </div>
  );
}

export default SharedPage;
