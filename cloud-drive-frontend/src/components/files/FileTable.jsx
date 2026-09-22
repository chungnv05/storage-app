import React, { useState } from 'react';
import Icon from '../common/Icon.jsx';
import EmptyState from '../common/EmptyState.jsx';
import FileTableRow from './FileTableRow.jsx';
import useStorage from '../../hooks/useStorage.js';

function FileTable({
  files,
  title = 'Danh sách tài liệu',
  onOpenFile,
  onProtectFile,
  onShareFile,
  onTrashFile,
  onRestoreFile,
  onDeleteForeverFile,
  onDropUpload,
  isTrash = false,
  isShared = false
}) {
  const { typeFilter, setTypeFilter, searchQuery } = useStorage();
  const [isDragOver, setIsDragOver] = useState(false);

  const pills = [
    { value: '', label: 'Tất cả' },
    { value: 'document', label: 'Tài liệu' },
    { value: 'video', label: 'Video' },
    { value: 'image', label: 'Hình ảnh' },
    { value: 'other', label: 'Khác' }
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isTrash && onDropUpload) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isTrash && onDropUpload && e.dataTransfer.files.length > 0) {
      onDropUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="mb-4">
      <div className="sectionhead">
        <h2 className="mb-0">{title}</h2>
        <span className="small muted">{files.length} mục</span>
      </div>

      <div
        className={`panel ${isDragOver ? 'dropzone over' : ''}`}
        id="filepanel"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!isTrash && (
          <div className="toolbar">
            <div className="pills">
              {pills.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`pill ${typeFilter === value ? 'active' : ''}`}
                  onClick={() => setTypeFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <span className="small muted d-flex align-items-center gap-1">
              <Icon name="clock" /> Cập nhật gần đây
            </span>
          </div>
        )}

        {files.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>TÊN TÀI LIỆU</th>
                    <th>{isShared ? 'CHỦ SỞ HỮU' : 'DUNG LƯỢNG'}</th>
                    <th>{isTrash ? 'CÒN LẠI' : 'NGÀY CẬP NHẬT'}</th>
                    <th>{isTrash ? 'KHÔI PHỤC / XÓA' : 'CHIA SẺ / THAO TÁC'}</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map(file => (
                    <FileTableRow
                      key={file.id}
                      file={file}
                      onOpen={onOpenFile}
                      onProtect={onProtectFile}
                      onShare={onShareFile}
                      onTrash={onTrashFile}
                      onRestore={onRestoreFile}
                      onDeleteForever={onDeleteForeverFile}
                      isTrash={isTrash}
                      isShared={isShared}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-note">
              {files.length} mục
              {!isTrash && !isShared && ' · Có thể kéo thả tệp vào khu vực này để tải lên'}
            </div>
          </>
        ) : (
          <EmptyState
            icon={isTrash ? 'trash' : 'folder'}
            title={
              searchQuery
                ? 'Không tìm thấy tài liệu'
                : isTrash
                  ? 'Thùng rác trống'
                  : isShared
                    ? 'Chưa có tệp nào được chia sẻ'
                    : 'Chưa có tệp trong mục này'
            }
            description={
              searchQuery
                ? 'Thử từ khóa khác hoặc kiểm tra tên tài liệu.'
                : isTrash
                  ? 'Tài liệu đã xóa sẽ xuất hiện tại đây.'
                  : isShared
                    ? 'Tài liệu được chia sẻ sẽ xuất hiện tại đây.'
                    : 'Tải lên tệp đầu tiên để bắt đầu.'
            }
          />
        )}
      </div>
    </div>
  );
}

export default FileTable;
