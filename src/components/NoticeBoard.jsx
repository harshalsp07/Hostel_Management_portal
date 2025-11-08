import React from "react";
import "./components.css";

const notices = [
  {
    title: "Mess Timing Change",
    date: "Nov 7, 2025",
    content: "Dinner timing changed to 8:00 PM - 10:00 PM starting tomorrow.",
    priority: "high",
  },
  {
    title: "Water Supply Maintenance",
    date: "Nov 6, 2025",
    content: "Water supply will be interrupted on Sunday from 10 AM to 2 PM.",
    priority: "medium",
  },
  {
    title: "Cultural Night",
    date: "Nov 5, 2025",
    content: "Annual cultural night on Nov 15. Register at the reception.",
    priority: "low",
  },
];

export default function NoticeBoard({ canAdd = false }) {
  return (
    <section className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>🔔 Notice Board</h2>
        {canAdd && <button className="btn">+ Add Notice</button>}
      </div>
      {notices.map((n) => (
        <div key={n.title} className="notice-item">
          <div className="notice-header">
            <h3>{n.title}</h3>
            <span className={`priority ${n.priority}`}>{n.priority}</span>
          </div>
          <p>{n.content}</p>
          <small>{n.date}</small>
        </div>
      ))}
    </section>
  );
}
