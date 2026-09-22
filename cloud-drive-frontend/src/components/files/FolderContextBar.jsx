import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon.jsx';

function FolderContextBar({ currentFolder, basePath = '/files' }) {
  const navigate = useNavigate();

  if (!currentFolder) return null;

  const handleGoUp = () => {
    if (currentFolder.parent) {
      navigate(`${basePath}/${currentFolder.parent}`);
    } else {
      navigate(basePath);
    }
  };

  return (
    <div className="folder-context">
      <span>
        <Icon name="folder" /> Nội dung trong <b>{currentFolder.name}</b>
      </span>
      <button
        type="button"
        className="btn btn-light py-2"
        onClick={handleGoUp}
      >
        <Icon name="arrow" style={{ transform: 'rotate(180deg)' }} /> Lên một cấp
      </button>
    </div>
  );
}

export default FolderContextBar;
