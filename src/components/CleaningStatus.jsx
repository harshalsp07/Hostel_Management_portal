import React, { useMemo, useState } from "react";
import "./components.css";

const roomsSample = [
  { room: "C301", level: "Level 1", last: "Today, 09:00 AM", next: "Tomorrow, 09:00 AM", status: "cleaned" },
  { room: "C302", level: "Level 2", last: "Nov 7, 2025", next: "Nov 9, 2025", status: "needs-cleaning" },
  { room: "C303", level: "Level 3", last: "Nov 6, 2025", next: "Nov 10, 2025", status: "scheduled" },
  { room: "C304", level: "Level 1", last: "Today, 08:00 AM", next: "Tomorrow, 08:00 AM", status: "cleaned" },
  { room: "C305", level: "Level 4", last: "Nov 5, 2025", next: "Nov 12, 2025", status: "scheduled" },
];

export default function CleaningStatus({ showAll = false }) {
  const [activeLevel, setActiveLevel] = useState("All");

  const levels = useMemo(() => ["All", "Level 1", "Level 2", "Level 3", "Level 4"], []);

  const visibleRooms = useMemo(() => {
    if (!showAll) return roomsSample.slice(0, 1);
    return activeLevel === "All" ? roomsSample : roomsSample.filter((r) => r.level === activeLevel);
  }, [showAll, activeLevel]);

  return (
    <section className="card ">
      <h2>🧹 {showAll ? 'All Rooms Cleaning Status' : 'My Room Cleaning Status'}</h2>

      {showAll && (
        <>
          <div style={{ marginBottom: 10 }}>
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setActiveLevel(lvl)}
                className={`filter-btn ${lvl === activeLevel ? 'active' : ''}`}
                style={{ marginRight: 6 }}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="cleaning-grid">
            {visibleRooms.map((r) => (
              <div key={r.room} className="cleaning-box">
                <div>
                  <h3>Room {r.room} — {r.level}</h3>
                  <p>
                    <b>Last cleaned:</b> {r.last}
                  </p>
                  <p>
                    <b>Next scheduled:</b> {r.next}
                  </p>
                </div>
                <span className={`status ${r.status.replace(' ', '-')}`}>{r.status.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {!showAll && (
        visibleRooms.map((r) => (
          <div key={r.room} className="cleaning-box">
            <div>
              <h3>Room {r.room} — {r.level}</h3>
              <p>
                <b>Last cleaned:</b> {r.last}
              </p>
              <p>
                <b>Next scheduled:</b> {r.next}
              </p>
            </div>
            <span className={`status ${r.status.replace(' ', '-')}`}>{r.status.replace('-', ' ')}</span>
          </div>
        ))
      )}
    </section>
  );
}
