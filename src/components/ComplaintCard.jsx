import React, { useState } from "react";
import calendarIcon from '../assets/icons/calendar.svg';
import editIcon from '../assets/icons/edit.svg';
import trashIcon from '../assets/icons/trash.svg';
import "./components.css";

export default function ComplaintCard({
  id,
  name,
  room,
  date,
  tags,
  status,
  content,
  image,
  category,
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
          <small className="complaint-date">
            <img src={calendarIcon} alt="" style={{ width: 14, height: 14, verticalAlign: 'middle', marginRight: 6 }} />
            {date}
          </small>
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
          {image && (
            <img src={image} alt="Complaint" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '6px', marginBottom: '8px' }} />
          )}
          {category && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ display: 'inline-block', backgroundColor: '#e5e7eb', color: '#374151', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                {category}
              </span>
            </div>
          )}
          <p className="complaint-content">{content}</p>
          {canEdit && (
            <div className="complaint-actions">
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                <img src={editIcon} alt="Edit" style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} />
                Edit
              </button>
              <button className="btn-delete" onClick={() => onDelete?.(id)}>
                <img src={trashIcon} alt="Delete" style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} />
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
