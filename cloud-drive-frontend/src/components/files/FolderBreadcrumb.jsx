import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import useStorage from '../../hooks/useStorage.js';

function FolderBreadcrumb({ currentFolder, basePath = '/files' }) {
  const { files } = useStorage();
  const navigate = useNavigate();

  if (!currentFolder) return null;

  // Build ancestor chain
  const chain = [];
  let curr = currentFolder;
  while (curr && curr.parent) {
    const parent = files.find(f => f.id === curr.parent);
    if (parent) {
      chain.unshift(parent);
      curr = parent;
    } else {
      break;
    }
  }

  const isShared = basePath.startsWith('/shared');

  return (
    <nav className="folder-breadcrumb" aria-label="Đường dẫn thư mục">
      <button
        type="button"
        className="breadcrumb-button"
        onClick={() => navigate(basePath)}
      >
        <Icon name="folder" />
        {isShared ? 'Chia sẻ với tôi' : 'Tài liệu của tôi'}
      </button>

      {chain.map((folder) => (
        <React.Fragment key={folder.id}>
          <span className="muted">/</span>
          <button
            type="button"
            className="breadcrumb-button"
            onClick={() => navigate(`${basePath}/${folder.id}`)}
          >
            {folder.name}
          </button>
        </React.Fragment>
      ))}

      <span className="muted">/</span>
      <span aria-current="page" className="fw-bold">
        {currentFolder.name}
      </span>
    </nav>
  );
}

export default FolderBreadcrumb;
