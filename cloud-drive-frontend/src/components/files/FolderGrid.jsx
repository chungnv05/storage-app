import React from 'react';
import FolderCard from './FolderCard.jsx';

function FolderGrid({
  folders,
  onOpenFolder,
  onProtectFolder,
  onDetailsFolder,
  isShared = false,
  isSubfolder = false
}) {
  if (!folders || folders.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="sectionhead">
        <h2 className="mb-0">
          {isSubfolder ? 'Thư mục con' : isShared ? 'Thư mục được chia sẻ' : 'Thư mục'}
        </h2>
        <span className="small muted">{folders.length} thư mục</span>
      </div>

      <div className="foldergrid">
        {folders.map(folder => (
          <FolderCard
            key={folder.id}
            folder={folder}
            onOpen={onOpenFolder}
            onProtect={onProtectFolder}
            onDetails={onDetailsFolder}
            isSharedView={isShared}
          />
        ))}
      </div>
    </div>
  );
}

export default FolderGrid;
