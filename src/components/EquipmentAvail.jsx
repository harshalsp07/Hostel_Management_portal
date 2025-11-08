import React from "react";
import "./components.css";

export default function EquipmentAvailability() {
  const items = [
    { name: "TT Rackets", available: 7, total: 12 },
    { name: "TT Balls", available: 18, total: 30 },
  ];

  return (
    <section className="card">
      <h2>📦 Equipment Availability</h2>
      <div className="equipment-grid">
        {items.map((i) => (
          <div key={i.name} className="equipment-item">
            <div className="equipment-header">
              <h3>{i.name}</h3>
              <span className="status good">Good</span>
            </div>
            <p className="available-text">Available:</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(i.available / i.total) * 100}%` }}
              ></div>
            </div>
            <p className="progress-count">
              {i.available} / {i.total}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
