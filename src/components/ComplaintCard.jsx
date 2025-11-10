import React from "react";
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
}) {
  return (
    <div className="complaint-card">
      <div className="complaint-header">
        <h3>
          {name} - Room {room}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {canEdit ? (
            <select 
              value={status} 
              onChange={(e) => onUpdateStatus?.(id, e.target.value)}
              style={{ padding: '4px 8px' }}
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
      <small>{date}</small>
      <div className="tags">
        {tags?.map((t) => (
          <span key={t} className={`tag ${t.toLowerCase()}`}>
            {t}
          </span>
        ))}
      </div>
      <p>{content}</p>
    </div>
  );
}
