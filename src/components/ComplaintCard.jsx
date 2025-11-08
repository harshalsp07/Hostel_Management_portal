import React from "react";
import "./components.css";

export default function ComplaintCard({ name, room, date, tags, status, content }) {
  return (
    <div className="complaint-card">
      <div className="complaint-header">
        <h3>
          {name} - Room {room}
        </h3>
        <span className={`status ${status.toLowerCase().replace(" ", "-")}`}>
          {status}
        </span>
      </div>
      <small>{date}</small>
      <div className="tags">
        {tags.map((t) => (
          <span key={t} className={`tag ${t.toLowerCase()}`}>
            {t}
          </span>
        ))}
      </div>
      <p>{content}</p>
    </div>
  );
}
