import React, { useMemo, useState, useEffect } from "react";
import { getCleaningSchedule, updateCleaningStatus } from '../services/cleaningService';
import broom from '../assets/icons/broom.svg';
import editIcon from '../assets/icons/edit.svg';
import "./components.css";

const DAY = 24 * 60 * 60 * 1000;
const CLEAN_DAYS = 3;

export default function CleaningStatus({ showAll = false, canEdit = false, user, userType }) {
  // All hooks MUST be declared unconditionally at the top.
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState("All");

  useEffect(() => {
    loadCleaningSchedule();
  }, [userType, user]);

  // Real-time updates via Socket.IO: import client dynamically to avoid bundler/SSR issues
  useEffect(() => {
    let socket;
    let mounted = true;

    (async () => {
      try {
        const mod = await import('socket.io-client');
        const { io } = mod;
        socket = io('http://localhost:5000', { transports: ['websocket'] });

        socket.on('connect', () => {
          // eslint-disable-next-line no-console
          console.log('[CleaningStatus] socket connected', socket.id);
        });

        socket.on('cleaning-requested', (updatedRoom) => {
          if (!mounted) return;
          try {
            setRooms((prev) => prev.map((r) => {
              if (r.room !== updatedRoom.room) return r;
              const merged = { ...r, ...updatedRoom };
              const { lastComputed, nextComputed, cleanedUntil } = computeLastNext(merged);
              return { ...merged, lastComputed, nextComputed, cleanedUntil };
            }));
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('[CleaningStatus] error applying cleaning-requested', e);
          }
        });

        socket.on('otp-verified', (updatedRoom) => {
          if (!mounted) return;
          try {
            setRooms((prev) => prev.map((r) => {
              if (r.room !== updatedRoom.room) return r;
              const merged = { ...r, ...updatedRoom };
              const { lastComputed, nextComputed, cleanedUntil } = computeLastNext(merged);
              return { ...merged, lastComputed, nextComputed, cleanedUntil };
            }));
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('[CleaningStatus] error applying otp-verified', e);
          }
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[CleaningStatus] failed to load socket.io-client', err);
      }
    })();

    return () => {
      mounted = false;
      try { socket && socket.disconnect(); } catch (e) { /* ignore */ }
    };
  }, []);

  const cleanedUntilMs = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const t = new Date(val).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  const computeLastNext = (r) => {
    // If server provided cleanedUntil, use it. Otherwise fallback to r.cleanedUntil or r.last
    const cleanedUntil = cleanedUntilMs(r.cleanedUntil || r.cleanedUntilMs || null);

    // If cleanedUntil exists, then last = cleanedUntil - CLEAN_DAYS, next = cleanedUntil
    if (cleanedUntil > 0) {
      const last = new Date(cleanedUntil - CLEAN_DAYS * DAY);
      const next = new Date(cleanedUntil);
      return {
        lastComputed: last.toLocaleString(),
        nextComputed: next.toLocaleString(),
        cleanedUntil: cleanedUntil,
      };
    }

    // If there is a 'last' timestamp from server, compute next = last + CLEAN_DAYS
    if (r.last) {
      const lastDate = new Date(r.last).getTime();
      if (Number.isFinite(lastDate) && lastDate > 0) {
        const next = new Date(lastDate + CLEAN_DAYS * DAY);
        return {
          lastComputed: new Date(lastDate).toLocaleString(),
          nextComputed: next.toLocaleString(),
          cleanedUntil: lastDate + CLEAN_DAYS * DAY,
        };
      }
    }

    // fallback to server-provided next/last strings if present
    return {
      lastComputed: r.last ? new Date(r.last).toLocaleString() : '—',
      nextComputed: r.next ? (typeof r.next === 'string' ? r.next : new Date(r.next).toLocaleString()) : '—',
      cleanedUntil: 0,
    };
  };

  const loadCleaningSchedule = async () => {
    setLoading(true);
    const data = await getCleaningSchedule(userType, user?.roomNumber);
    // enrich server data with runtime-only fields used by OTP flow
    const enriched = (Array.isArray(data) ? data : []).map((r) => {
      const otp = r.otp || null;
      const otpCreatedAt = r.otpCreatedAt || null;
      const { lastComputed, nextComputed, cleanedUntil } = computeLastNext(r);
      return {
        ...r,
        otp,
        otpCreatedAt,
        cleanedUntil,
        lastComputed,
        nextComputed,
      };
    });
    setRooms(enriched);
    // debug logs to inspect server response and enriched rooms
    // eslint-disable-next-line no-console
    console.log('[CleaningStatus] fetched schedule:', { raw: data, enriched });
    setLoading(false);
  };

  // No polling: we'll refresh the schedule only when necessary (e.g. after a worker verifies)

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
      // ask backend to generate and persist OTP; backend returns updated schedule + otp
      const resp = await fetch('http://localhost:5000/api/cleaning/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomNumber, requestedBy: user?.uid, requestedAt: new Date().toISOString() }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        const errorMsg = err.message || 'Failed to request cleaning';
        alert(errorMsg);
        throw new Error(errorMsg);
      }
      const body = await resp.json();
      if (!body.success) {
        alert(body.message || 'Failed to request cleaning');
        throw new Error(body.message || 'Failed to request cleaning');
      }

      // server should return the updated schedule for that room
      const updatedSchedule = body.schedule;
      const otp = body.otp || updatedSchedule?.otp || null;

      // merge updated schedule into local state (and recompute last/next)
      setRooms((prev) => prev.map((r) => {
        if (r.room !== updatedSchedule.room) return r;
        const merged = { ...r, ...updatedSchedule, otp };
        const { lastComputed, nextComputed, cleanedUntil } = computeLastNext(merged);
        return { ...merged, lastComputed, nextComputed, cleanedUntil };
      }));

      // show the OTP to the student (returned by server)
      if (otp) alert(`Cleaning OTP generated: ${otp} — share this with the worker to confirm cleaning.`);
    } catch (error) {
      console.error('Error requesting cleaning:', error);
    }
  };

  const handleVerifyOtp = async (roomNumber, enteredOtp) => {
    const room = rooms.find((r) => r.room === roomNumber);
    if (!room || !room.otp) {
      return { ok: false, message: 'No OTP requested for this room' };
    }
    if (room.otp !== enteredOtp) {
      return { ok: false, message: 'Invalid OTP' };
    }

    // mark cleaned for 3 days
    const cleanedUntil = Date.now() + CLEAN_DAYS * DAY;
    try {
      // attempt to update backend status (best-effort)
      // also request the server clear the OTP fields so students won't see it anymore
      await updateCleaningStatus(room._id || room.id, { status: 'cleaned', cleanedUntil, otp: null, otpCreatedAt: null });
      // reload schedule from server so timestamps (last) come from server and other clients get updated
      await loadCleaningSchedule();
    } catch (e) {
      console.warn('Backend update failed, applying local state only', e);
      // fallback to local update so worker sees immediate change
      setRooms((prev) => prev.map((r) => (r.room === roomNumber ? { ...r, cleanedUntil, otp: null, otpCreatedAt: null, status: 'cleaned', lastComputed: new Date().toLocaleString(), nextComputed: new Date(cleanedUntil).toLocaleString() } : r)));
    }

    return { ok: true };
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

  // helpful debug info: how many rooms have pending OTPs
  const pendingOtpCount = useMemo(() => rooms.filter((r) => r.otp).length, [rooms]);

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
        {userType === 'worker' && showAll && (
          <div style={{ fontSize: 12, color: '#111', background: '#f3f4f6', padding: '6px 10px', borderRadius: 8 }}>
            Pending OTPs: {pendingOtpCount}
          </div>
        )}
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
            {visibleRooms.map((r) => {
              // compute dynamic status: if there's a pending OTP request, treat as not cleaned
              const isCleaned = !r.otp && cleanedUntilMs(r.cleanedUntil) > Date.now();
              const rawStatusText = r.status ? r.status.replace('-', ' ') : 'Needs Cleaning';
              const statusLabel = isCleaned
                ? 'Cleaned'
                : (userType === 'worker' && rawStatusText.toLowerCase() === 'cleaned')
                  ? 'Needs Cleaning'
                  : rawStatusText;
              return (
                <div key={r.room} className="cleaning-box">
                  <div>
                    <h3>Room {r.room} — {r.level}</h3>
                    <p>
                      <b>Last cleaned:</b> {r.lastComputed}
                    </p>
                    <p>
                      <b>Next scheduled:</b> {r.nextComputed}
                    </p>
                    {r.otp && userType === 'student' && (
                      <div className="otp-box">OTP requested: <strong>{r.otp}</strong></div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`status ${isCleaned ? 'cleaned' : (statusLabel || 'needs-cleaning').toLowerCase().replace(' ', '-')}`}>{statusLabel}</span>
                    {userType === 'worker' && r.otp && (
                      <OtpVerifier room={r} onVerify={handleVerifyOtp} />
                    )}
                    {canEdit && userType === 'admin' && (
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
              );
            })}
          </div>
        </>
      )}

      {!showAll && (
          (visibleRooms.length ? visibleRooms : [null]).map((r) => {
          // if r is null, render a fallback card using user info (student view)
          const roomId = r?.room || user?.roomNumber || 'Your Room';
          const level = r?.level || 'Level -';
          const last = r?.lastComputed || '—';
          const next = r?.nextComputed || '—';
          // If a student has requested cleaning (r.otp present), show Needs Cleaning regardless of cleanedUntil
          const isCleaned = !r?.otp && cleanedUntilMs(r?.cleanedUntil) > Date.now();
          const rawStatusText = (r?.status || 'Needs Cleaning').replace('-', ' ');
          const statusLabel = isCleaned
            ? 'Cleaned'
            : (userType === 'worker' && rawStatusText.toLowerCase() === 'cleaned')
              ? 'Needs Cleaning'
              : rawStatusText;
          const statusClass = isCleaned ? 'cleaned' : statusLabel.toLowerCase().replace(' ', '-');
          return (
            <div key={r?.room || 'fallback'} className="cleaning-box">
              <div>
                <h3>Room {roomId} — {level}</h3>
                <p>
                  <b>Last cleaned:</b> {last}
                </p>
                <p>
                  <b>Next scheduled:</b> {next}
                </p>
                {r?.otp && userType === 'student' && <div className="otp-box">OTP: <strong>{r.otp}</strong></div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`status ${statusClass}`}>{statusLabel}</span>

                {!canEdit && userType === 'student' && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      className="btn-call-cleaning"
                      onClick={() => handleCallForCleaning(r?.room || user?.roomNumber || roomId)}
                      title="Request room cleaning"
                    >
                      Request Cleaning
                    </button>
                    
                  </div>
                )}

                {userType === 'worker' && r?.otp && (
                  <OtpVerifier room={r} onVerify={handleVerifyOtp} />
                )}

                {canEdit && userType === 'admin' && (
                  <button className="btn-icon" title="Edit">
                    <img src={editIcon} alt="Edit" style={{ width: 16, height: 16 }} />
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}

function OtpVerifier({ room, onVerify }) {
  const [value, setValue] = useState('');
  const [msg, setMsg] = useState(null);
  const submit = async () => {
    const res = await onVerify(room.room, value);
    if (res && !res.ok) {
      setMsg({ text: res.message || 'Invalid OTP', ok: false });
    } else {
      setMsg({ text: 'Verified — marked cleaned', ok: true });
      setValue('');
      setTimeout(() => setMsg(null), 2500);
    }
  };
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input className="otp-input" placeholder="Enter OTP" value={value} onChange={(e) => setValue(e.target.value)} />
      <button className="btn" onClick={submit}>Verify</button>
      {msg && <small style={{ color: msg.ok ? 'green' : 'red' }}>{msg.text}</small>}
    </div>
  );
}
