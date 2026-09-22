import React from 'react';
import Icon from '../common/Icon.jsx';
import useStorage from '../../hooks/useStorage.js';
import { formatSize, GB } from '../../mock/utils.js';

function FileStats() {
  const { files, currentUser, getPlan, typeFilter, setTypeFilter } = useStorage();

  const plan = getPlan(currentUser.plan);
  const totalCapacity = plan.gb * GB;

  // Active files belonging to currentUser that are not folders and not deleted
  const userFiles = files.filter(
    f => f.owner === currentUser.id && !f.deleted && f.type !== 'folder'
  );

  const stats = [
    { type: 'document', label: 'Tài liệu', color: '#6495eb' },
    { type: 'video', label: 'Video', color: '#a382da' },
    { type: 'image', label: 'Hình ảnh', color: '#56bda2' },
    { type: 'other', label: 'Khác', color: '#eda178' }
  ];

  return (
    <div className="cards mb-4">
      {stats.map(({ type, label, color }) => {
        const matching = userFiles.filter(f => f.type === type);
        const bytes = matching.reduce((sum, f) => sum + (f.bytes || 0), 0);
        const percent = Math.max(2, Math.round((bytes / totalCapacity) * 100));
        const isSelected = typeFilter === type;

        return (
          <button
            key={type}
            type="button"
            className="statcard text-start"
            style={{
              borderColor: isSelected ? 'var(--blue)' : undefined,
              boxShadow: isSelected ? '0 0 0 2px rgba(23, 101, 233, 0.2)' : undefined
            }}
            onClick={() => setTypeFilter(prev => (prev === type ? '' : type))}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className={`fileicon ${type}`}>
                <Icon name={type === 'document' ? 'file' : type} />
              </span>
              <span className="muted small">{matching.length} tệp</span>
            </div>

            <div className="d-flex justify-content-between align-items-baseline gap-1">
              <h3 className="mb-0">{label}</h3>
              <strong>{formatSize(bytes)}</strong>
            </div>

            <div className="progress">
              <div
                className="progress-bar"
                style={{
                  background: color,
                  width: `${percent}%`
                }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default FileStats;
