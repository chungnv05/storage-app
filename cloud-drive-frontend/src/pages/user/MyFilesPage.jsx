import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon.jsx';
import FileStats from '../../components/files/FileStats.jsx';
import FolderBreadcrumb from '../../components/files/FolderBreadcrumb.jsx';
import FolderContextBar from '../../components/files/FolderContextBar.jsx';
import FolderGrid from '../../components/files/FolderGrid.jsx';
import FileTable from '../../components/files/FileTable.jsx';
import PromoBanner from '../../components/files/PromoBanner.jsx';
import CreateFolderModal from '../../components/files/CreateFolderModal.jsx';
import UploadModal from '../../components/files/UploadModal.jsx';
import FilePreviewModal from '../../components/files/FilePreviewModal.jsx';
import ShareModal from '../../components/files/ShareModal.jsx';
import DeleteConfirmModal from '../../components/files/DeleteConfirmModal.jsx';
import ProtectionModal from '../../components/files/ProtectionModal.jsx';

import useStorage from '../../hooks/useStorage.js';

function MyFilesPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const {
    files,
    currentUser,
    searchQuery,
    typeFilter,
    createFolder,
    uploadFiles,
    trashFile,
    isItemLocked,
    relockAll
  } = useStorage();

  // Modals state
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState(null);
  const [selectedFileForShare, setSelectedFileForShare] = useState(null);
  const [selectedFileForTrash, setSelectedFileForTrash] = useState(null);
  const [protectionModalData, setProtectionModalData] = useState(null); // { file, mode }

  // Current folder
  const currentFolder = useMemo(() => {
    if (!folderId) return null;
    return files.find(f => f.id === folderId && !f.deleted);
  }, [files, folderId]);

  const isCurrentFolderLocked = currentFolder ? isItemLocked(currentFolder) : false;

  // Filter items in current view
  const currentItems = useMemo(() => {
    let list = files.filter(f => f.owner === currentUser.id && !f.deleted);

    // Filter by folder hierarchy if not searching and not type-filtering
    if (!searchQuery && !typeFilter) {
      list = list.filter(f => (folderId ? f.parent === folderId : !f.parent));
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q));
    }

    // Filter by type
    if (typeFilter) {
      list = list.filter(f => f.type === typeFilter);
    }

    return list;
  }, [files, currentUser.id, folderId, searchQuery, typeFilter]);

  // Separate subfolders and files
  const subfolders = useMemo(() => {
    if (searchQuery || typeFilter) return [];
    return currentItems.filter(f => f.type === 'folder');
  }, [currentItems, searchQuery, typeFilter]);

  const fileRows = useMemo(() => {
    if (searchQuery || typeFilter) return currentItems;
    return currentItems.filter(f => f.type !== 'folder');
  }, [currentItems, searchQuery, typeFilter]);

  // Open item handler
  const handleOpenItem = (item) => {
    if (isItemLocked(item)) {
      setProtectionModalData({ file: item, mode: 'unlock' });
      return;
    }

    if (item.type === 'folder') {
      navigate(`/files/${item.id}`);
    } else {
      setSelectedFileForPreview(item);
    }
  };

  const handleProtectItem = (item) => {
    if (item.isLocked) {
      setProtectionModalData({ file: item, mode: 'manage' });
    } else {
      setProtectionModalData({ file: item, mode: 'encrypt' });
    }
  };

  const pageTitle = currentFolder ? currentFolder.name : 'Tài liệu của tôi';

  return (
    <div className="my-files-page">
      <div className="pagehead">
        <div>
          <h1 className="mb-0">{pageTitle}</h1>
          <p>Sắp xếp, lưu trữ và chia sẻ mọi thứ quan trọng.</p>
        </div>

        <div className="actions">
          <button
            type="button"
            className="btn btn-light"
            onClick={() => setShowCreateFolder(true)}
          >
            <Icon name="plus" /> Tạo thư mục
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowUpload(true)}
          >
            <Icon name="upload" /> Tải tệp lên
          </button>

          <button
            type="button"
            className="btn btn-light"
            onClick={relockAll}
            title="Khóa lại tất cả thư mục và tệp"
          >
            <Icon name="lock" /> Khóa lại
          </button>
        </div>
      </div>

      {/* Breadcrumb and Context bar if inside folder */}
      {currentFolder && (
        <>
          <FolderBreadcrumb currentFolder={currentFolder} basePath="/files" />
          <FolderContextBar currentFolder={currentFolder} basePath="/files" />
        </>
      )}

      {/* If current folder is locked */}
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
          {/* File stats on root page when not searching */}
          {!folderId && !searchQuery && !typeFilter && <FileStats />}

          {/* Subfolders Grid */}
          <FolderGrid
            folders={subfolders}
            onOpenFolder={handleOpenItem}
            onProtectFolder={handleProtectItem}
            onDetailsFolder={(f) => setSelectedFileForPreview(f)}
            isSubfolder={Boolean(folderId)}
          />

          {/* Files Table */}
          <FileTable
            files={fileRows}
            title={
              searchQuery
                ? 'Kết quả tìm kiếm'
                : typeFilter
                  ? 'Tệp theo loại'
                  : folderId
                    ? 'Tệp trong thư mục'
                    : 'Danh sách tài liệu'
            }
            onOpenFile={handleOpenItem}
            onProtectFile={handleProtectItem}
            onShareFile={(f) => setSelectedFileForShare(f)}
            onTrashFile={(f) => setSelectedFileForTrash(f)}
            onDropUpload={(fileList) => uploadFiles(fileList, folderId || null)}
          />

          {/* Promo banner on root */}
          {!folderId && !searchQuery && <PromoBanner />}
        </>
      )}

      {/* Modals */}
      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onCreate={(name) => createFolder(name, folderId || null)}
      />

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        targetFolderName={currentFolder ? currentFolder.name : 'Tài liệu của tôi'}
        onUpload={(fileList) => uploadFiles(fileList, folderId || null)}
      />

      <FilePreviewModal
        isOpen={Boolean(selectedFileForPreview)}
        onClose={() => setSelectedFileForPreview(null)}
        file={selectedFileForPreview}
        onShare={(f) => setSelectedFileForShare(f)}
        onProtect={(f) => handleProtectItem(f)}
      />

      <ShareModal
        isOpen={Boolean(selectedFileForShare)}
        onClose={() => setSelectedFileForShare(null)}
        file={selectedFileForShare}
      />

      <DeleteConfirmModal
        isOpen={Boolean(selectedFileForTrash)}
        onClose={() => setSelectedFileForTrash(null)}
        file={selectedFileForTrash}
        mode="trash"
        onConfirm={(f) => trashFile(f.id)}
      />

      {protectionModalData && (
        <ProtectionModal
          isOpen={Boolean(protectionModalData)}
          onClose={() => setProtectionModalData(null)}
          file={protectionModalData.file}
          mode={protectionModalData.mode}
          onSuccess={() => {
            if (protectionModalData.mode === 'unlock' && protectionModalData.file.type === 'folder') {
              navigate(`/files/${protectionModalData.file.id}`);
            }
          }}
        />
      )}
    </div>
  );
}

export default MyFilesPage;
