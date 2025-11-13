import React, { useState } from "react";
import "./components.css";

export default function ComplaintCard({
  id,
  name,
  room,
  date,
  tags,
  status,
  content,
  canEdit = false,
  onUpdateStatus,
  onEdit,
  onDelete,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleSaveEdit = () => {
    if (editedContent.trim()) {
      onEdit?.(id, { content: editedContent });
      setIsEditing(false);
    }
  };

  return (
    <div className="complaint-card">
      <div className="complaint-header">
        <div>
          <h3>{name} - Room {room}</h3>
          <small className="complaint-date">📅 {date}</small>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {canEdit ? (
            <select 
              value={status} 
              onChange={(e) => onUpdateStatus?.(id, e.target.value)}
              className="status-select"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          ) : (
            <span className={`status ${status.toLowerCase().replace(" ", "-")}`}>
              {status}
            </span>
          )}
        </div>
      </div>

      <div className="tags">
        {tags?.map((t) => (
          <span key={t} className={`tag ${t.toLowerCase()}`}>
            {t}
          </span>
        ))}
      </div>

      {isEditing ? (
        <div className="edit-form">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={3}
            className="edit-textarea"
          />
          <div className="edit-actions">
            <button className="btn-save" onClick={handleSaveEdit}>Save</button>
            <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <p className="complaint-content">{content}</p>
          {canEdit && (
            <div className="complaint-actions">
              <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit</button>
              <button className="btn-delete" onClick={() => onDelete?.(id)}>Delete</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
