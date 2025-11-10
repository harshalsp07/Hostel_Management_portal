import React, { useState, useEffect } from "react";
import { getNotices, addNotice, updateNotice, deleteNotice } from '../services/noticeService';
import "./components.css";

export default function NoticeBoard({ canAdd = false, canEdit = false }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'medium' });

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    setLoading(true);
    const data = await getNotices();
    setNotices(data);
    setLoading(false);
  };

  const handleAddNotice = async () => {
    if (!formData.title || !formData.content) return;
    try {
      await addNotice({
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      });
      setFormData({ title: '', content: '', priority: 'medium' });
      setShowAddForm(false);
      loadNotices();
    } catch (error) {
      console.error('Error adding notice:', error);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await deleteNotice(id);
      loadNotices();
    } catch (error) {
      console.error('Error deleting notice:', error);
    }
  };

  if (loading) return <section className="card"><p>Loading notices...</p></section>;
  return (
    <section className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>🔔 Notice Board</h2>
        <div>
          {canAdd && !showAddForm && <button className="btn" onClick={() => setShowAddForm(true)}>+ Add Notice</button>}
        </div>
      </div>

      {showAddForm && (
        <div className="notice-item" style={{ background: '#f0f9ff', border: '2px solid #3b82f6' }}>
          <input
            type="text"
            placeholder="Notice Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={{ width: '100%', padding: '8px', marginBottom: '8px', fontSize: '16px' }}
          />
          <textarea
            placeholder="Notice Content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={3}
            style={{ width: '100%', padding: '8px', marginBottom: '8px', fontSize: '14px' }}
          />
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            style={{ padding: '8px', marginRight: '8px' }}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button className="btn" onClick={handleAddNotice}>Save</button>
          <button className="btn" onClick={() => { setShowAddForm(false); setFormData({ title: '', content: '', priority: 'medium' }); }} style={{ marginLeft: '8px' }}>Cancel</button>
        </div>
      )}

      {notices.length === 0 && !showAddForm && <p>No notices available.</p>}
      
      {notices.map((n) => (
        <div key={n.id} className="notice-item">
          <div className="notice-header">
            <h3>{n.title}</h3>
            <div>
              <span className={`priority ${n.priority}`}>{n.priority}</span>
              {canEdit && <button className="btn-icon" onClick={() => handleDeleteNotice(n.id)}>🗑️</button>}
            </div>
          </div>
          <p>{n.content}</p>
          <small>{n.date}</small>
        </div>
      ))}
    </section>
  );
}
