import React, { useState, useEffect } from "react";
import { getNotices, addNotice, updateNotice, deleteNotice } from '../services/noticeService';
import { uploadImageToCloudinary } from '../services/cloudinaryService';
import bell from '../assets/icons/bell.svg';
import trash from '../assets/icons/trash.svg';
import "./components.css";

export default function NoticeBoard({ canAdd = false, canEdit = false }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'medium', image: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    setLoading(true);
    const data = await getNotices();
    setNotices(data);
    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNotice = async () => {
    if (!formData.title || !formData.content) return;
    try {
      setUploading(true);
      const noticeData = {
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      };
      
      if (formData.image) {
        try {
          const imageUrl = await uploadImageToCloudinary(formData.image);
          noticeData.image = imageUrl;
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Notice will be saved without image.');
        }
      }
      
      await addNotice(noticeData);
      setFormData({ title: '', content: '', priority: 'medium', image: null });
      setImagePreview(null);
      setShowAddForm(false);
      setUploading(false);
      loadNotices();
    } catch (error) {
      console.error('Error adding notice:', error);
      setUploading(false);
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
        <h2>
          <img src={bell} alt="" style={{ width: 18, height: 18, verticalAlign: 'middle', marginRight: 8 }} />
          Notice Board
        </h2>
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
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Upload Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>
          {imagePreview && (
            <div style={{ marginBottom: '8px' }}>
              <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '6px' }} />
            </div>
          )}
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            style={{ padding: '8px', marginRight: '8px' }}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button className="btn" onClick={handleAddNotice} disabled={uploading}>{uploading ? 'Uploading...' : 'Save'}</button>
          <button className="btn" onClick={() => { setShowAddForm(false); setFormData({ title: '', content: '', priority: 'medium', image: null }); setImagePreview(null); }} style={{ marginLeft: '8px' }} disabled={uploading}>Cancel</button>
        </div>
      )}

      {notices.length === 0 && !showAddForm && <p>No notices available.</p>}
      
      {notices.map((n) => (
        <div key={n._id || n.id} className="notice-item">
          <div className="notice-header">
            <h3>{n.title}</h3>
            <div>
              <span className={`priority ${n.priority}`}>{n.priority}</span>
              {canEdit && (
                <button className="btn-icon" onClick={() => handleDeleteNotice(n._id || n.id)} title="Delete">
                  <img src={trash} alt="Delete" style={{ width: 16, height: 16 }} />
                </button>
              )}
            </div>
          </div>
          {n.image && (
            <img src={n.image} alt="Notice" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '6px', marginBottom: '8px' }} />
          )}
          <p>{n.content}</p>
          <small>{n.date}</small>
        </div>
      ))}
    </section>
  );
}
