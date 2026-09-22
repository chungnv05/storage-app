import React, { useState, useMemo } from 'react';
import FileTable from '../../components/files/FileTable.jsx';
import DeleteConfirmModal from '../../components/files/DeleteConfirmModal.jsx';
import useStorage from '../../hooks/useStorage.js';

function TrashPage() {
  const { files, currentUser, searchQuery, restoreFile, deleteForever } = useStorage();
  const [selectedFileForDelete, setSelectedFileForDelete] = useState(null);

  const trashFiles = useMemo(() => {
    let list = files.filter(f => f.owner === currentUser.id && f.deleted != null);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q));
    }

    return list.sort((a, b) => b.deleted - a.deleted);
  }, [files, currentUser.id, searchQuery]);

  return (
    <div className="trash-page">
      <div className="pagehead">
        <div>
          <h1 className="mb-0">Thùng rác</h1>
          <p>Tài liệu được giữ trong 30 ngày trước khi xóa vĩnh viễn.</p>
        </div>
      </div>

      <FileTable
        files={trashFiles}
        title="Đã xóa"
        isTrash={true}
        onOpenFile={(f) => restoreFile(f.id)}
        onRestoreFile={(f) => restoreFile(f.id)}
        onDeleteForeverFile={(f) => setSelectedFileForDelete(f)}
      />

      <DeleteConfirmModal
        isOpen={Boolean(selectedFileForDelete)}
        onClose={() => setSelectedFileForDelete(null)}
        file={selectedFileForDelete}
        mode="permanent"
        onConfirm={(f) => deleteForever(f.id)}
      />
    </div>
  );
}

export default TrashPage;
