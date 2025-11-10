import React, { useMemo, useState, useEffect } from "react";
import { getComplaints, addComplaint, updateComplaint } from '../services/complaintService';
import ComplaintCard from "./ComplaintCard";
import "./components.css";

export default function ComplaintList({ canAdd = true, canEdit = false, user, userType }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ content: '', room: '' });

  useEffect(() => {
    loadComplaints();
  }, [userType, user]);

  const loadComplaints = async () => {
    setLoading(true);
    const data = await getComplaints(userType, user?.uid || user?.id);
    setComplaints(data);
    setLoading(false);
  };

  const handleAddComplaint = async () => {
    if (!formData.content) return;
    try {
      await addComplaint({
        content: formData.content,
        name: user?.name || user?.email || 'Anonymous',
        room: formData.room || user?.roomNumber || 'N/A',
        userId: user?.uid || user?.id,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        tags: ['Open'],
        status: 'Open',
      });
      setFormData({ content: '', room: '' });
      setShowAddForm(false);
      loadComplaints();
    } catch (error) {
      console.error('Error adding complaint:', error);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateComplaint(id, { status: newStatus });
      loadComplaints();
    } catch (error) {
      console.error('Error updating complaint:', error);
    }
  };

  const [activeTag, setActiveTag] = useState("All");

  // derive unique tags from complaints
  const tags = useMemo(() => {
    const s = new Set();
    complaints.forEach((c) => c.tags?.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [complaints]);

  const visibleComplaints = useMemo(() => {
    if (activeTag === "All") return complaints;
    return complaints.filter((c) => c.tags?.includes(activeTag));
  }, [activeTag, complaints]);

  if (loading) return <section className="card"><p>Loading complaints...</p></section>;

  return (
    <section className="card">
      <div className="complaint-header-bar">
        <h2>💬 {userType === 'student' ? 'My Complaints' : 'All Complaints'}</h2>
        <div>
          {canAdd && !showAddForm && <button className="btn" onClick={() => setShowAddForm(true)}>+ Add Complaint</button>}
        </div>
      </div>

      {showAddForm && (
        <div className="notice-item" style={{ background: '#fef2f2', border: '2px solid #ef4444' }}>
          <textarea
            placeholder="Describe your complaint..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={3}
            style={{ width: '100%', padding: '8px', marginBottom: '8px', fontSize: '14px' }}
          />
          <input
            type="text"
            placeholder="Room Number (optional)"
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            style={{ width: '100%', padding: '8px', marginBottom: '8px', fontSize: '14px' }}
          />
          <button className="btn" onClick={handleAddComplaint}>Submit</button>
          <button className="btn" onClick={() => { setShowAddForm(false); setFormData({ content: '', room: '' }); }} style={{ marginLeft: '8px' }}>Cancel</button>
        </div>
      )}

      <div className="filter-buttons">
        {[["All"], tags].flat().map((f) => (
          <button
            key={f}
            onClick={() => setActiveTag(f)}
            className={`filter-btn ${f === activeTag ? "active" : ""}`}
          >
            {f}
          </button>
        ))}
      </div>

      {complaints.length === 0 && !showAddForm && <p>No complaints found.</p>}

      {visibleComplaints.map((c) => (
        <ComplaintCard key={c.id} {...c} canEdit={canEdit} onUpdateStatus={handleUpdateStatus} />
      ))}
    </section>
  );
}
