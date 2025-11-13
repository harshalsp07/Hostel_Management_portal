import React, { useMemo, useState, useEffect } from "react";
import { getCleaningSchedule, updateCleaningStatus } from '../services/cleaningService';
import broom from '../assets/icons/broom.svg';
import editIcon from '../assets/icons/edit.svg';
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

  const handleCallForCleaning = async (roomNumber) => {
    try {
      const response = await fetch('/api/cleaning/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber,
          requestedBy: user?.uid,
          requestedAt: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        alert('Cleaning request sent successfully!');
        loadCleaningSchedule();
      } else {
        alert('Failed to send cleaning request');
      }
    } catch (error) {
      console.error('Error requesting cleaning:', error);
      alert('Error sending cleaning request');
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
        <h2>
          <img src={broom} alt="" style={{ width: 18, height: 18, verticalAlign: 'middle', marginRight: 8 }} />
          {showAll ? 'All Rooms Cleaning Status' : 'My Room Cleaning Status'}
        </h2>
        {canEdit && (
          <button className="btn">
            <img src={editIcon} alt="Edit" style={{ width: 14, height: 14, marginRight: 6, verticalAlign: 'middle' }} />
            Edit
          </button>
        )}
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
                      onChange={(e) => handleUpdateStatus(r._id || r.id, e.target.value)}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`status ${r.status.replace(' ', '-')}`}>{r.status.replace('-', ' ')}</span>
              {!canEdit && userType === 'student' && (
                <button 
                  className="btn-call-cleaning"
                  onClick={() => handleCallForCleaning(r.room)}
                  title="Request room cleaning"
                >
                  Call for Cleaning
                </button>
              )}
              {canEdit && (
                <button className="btn-icon" title="Edit">
                  <img src={editIcon} alt="Edit" style={{ width: 16, height: 16 }} />
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </section>
  );
}
