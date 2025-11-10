import React, { useMemo, useState, useEffect } from "react";
import { getCleaningSchedule, updateCleaningStatus } from '../services/cleaningService';
import "./components.css";

export default function CleaningStatus({ showAll = false, canEdit = false, user, userType }) {
  // All hooks MUST be declared unconditionally at the top.
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState("All");

  useEffect(() => {
    loadCleaningSchedule();
  }, [userType, user]);

  const loadCleaningSchedule = async () => {
    setLoading(true);
    const data = await getCleaningSchedule(userType, user?.roomNumber);
    setRooms(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateCleaningStatus(id, newStatus);
      loadCleaningSchedule();
    } catch (error) {
      console.error('Error updating cleaning status:', error);
    }
  };

  // Hooks must always run in the same order; compute memos before any conditional return
  const levels = useMemo(() => ["All", "Level 1", "Level 2", "Level 3", "Level 4"], []);

  const visibleRooms = useMemo(() => {
    try {
      if (!showAll) return rooms.slice(0, 1);
      return activeLevel === "All" ? rooms : rooms.filter((r) => r.level === activeLevel);
    } catch (e) {
      // Guard against transient render errors
      return rooms;
    }
  }, [showAll, activeLevel, rooms]);

  if (loading) {
    return (
      <section className="card">
        <p>Loading cleaning schedule...</p>
      </section>
    );
  }

  return (
    <section className="card ">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>🧹 {showAll ? 'All Rooms Cleaning Status' : 'My Room Cleaning Status'}</h2>
        {canEdit && <button className="btn">✏️ Edit</button>}
      </div>

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
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className={`status ${r.status?.replace(' ', '-')}`}>{r.status?.replace('-', ' ')}</span>
                  {canEdit && (
                    <select 
                      value={r.status} 
                      onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                      style={{ marginLeft: '8px', padding: '4px' }}
                    >
                      <option value="cleaned">Cleaned</option>
                      <option value="needs-cleaning">Needs Cleaning</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  )}
                </div>
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
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className={`status ${r.status.replace(' ', '-')}`}>{r.status.replace('-', ' ')}</span>
              {canEdit && <button className="btn-icon">✏️</button>}
            </div>
          </div>
        ))
      )}
    </section>
  );
}
