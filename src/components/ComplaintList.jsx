import React, { useMemo, useState, useEffect } from "react";
import { getComplaints, addComplaint, updateComplaint, deleteComplaint } from '../services/complaintService';
import { uploadImageToCloudinary } from '../services/cloudinaryService';
import ComplaintCard from "./ComplaintCard";
import chat from '../assets/icons/chat.svg';
import "./components.css";

export default function ComplaintList({ canAdd = true, canEdit = false, user, userType }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ content: '', room: '', category: 'Other', image: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, [userType, user]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await getComplaints(userType, user?.uid || user?.id);
      setComplaints(data || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
      setError('Failed to load complaints');
    }
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

  const handleAddComplaint = async () => {
    if (!formData.content.trim()) {
      setError('Please enter a complaint');
      return;
    }
    try {
      setError('');
      setUploading(true);
      const complaintData = {
        content: formData.content,
        name: user?.name || user?.email || 'Anonymous',
        room: formData.room || user?.roomNumber || 'N/A',
        userId: user?.uid || user?.id,
        category: formData.category,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        tags: ['Open'],
        status: 'Open',
      };
      
      if (formData.image) {
        try {
          const imageUrl = await uploadImageToCloudinary(formData.image);
          complaintData.image = imageUrl;
        } catch (error) {
          console.error('Error uploading image:', error);
          setError('Failed to upload image. Complaint will be saved without image.');
        }
      }
      
      await addComplaint(complaintData);
      setFormData({ content: '', room: '', category: 'Other', image: null });
      setImagePreview(null);
      setShowAddForm(false);
      setUploading(false);
      setSuccess('Complaint added successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await loadComplaints();
    } catch (error) {
      console.error('Error adding complaint:', error);
      setError('Failed to add complaint. Please try again.');
      setUploading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setError('');
      await updateComplaint(id, { status: newStatus });
      setSuccess('Complaint updated!');
      setTimeout(() => setSuccess(''), 3000);
      await loadComplaints();
    } catch (error) {
      console.error('Error updating complaint:', error);
      setError('Failed to update complaint');
    }
  };

  const handleEditComplaint = async (id, updates) => {
    try {
      setError('');
      await updateComplaint(id, updates);
      setSuccess('Complaint updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await loadComplaints();
    } catch (error) {
      console.error('Error editing complaint:', error);
      setError('Failed to edit complaint');
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        setError('');
        await deleteComplaint(id);
        setSuccess('Complaint deleted!');
        setTimeout(() => setSuccess(''), 3000);
        await loadComplaints();
      } catch (error) {
        console.error('Error deleting complaint:', error);
        setError('Failed to delete complaint');
      }
    }
  };

  const [activeTag, setActiveTag] = useState("All");
  const [showForm, setShowForm] = useState(false);

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
        <h2>
          <img src={chat} alt="" style={{ width: 18, height: 18, verticalAlign: 'middle', marginRight: 8 }} />
          {userType === 'student' ? 'My Complaints' : 'All Complaints'}
        </h2>
        <div>
          {canAdd && !showAddForm && <button className="btn" onClick={() => setShowAddForm(true)}>+ Add Complaint</button>}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showAddForm && (
        <div className="notice-item" style={{ background: '#fef2f2', border: '2px solid #ef4444' }}>
          <textarea
            placeholder="Describe your complaint..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={3}
            style={{ width: '100%', padding: '8px', marginBottom: '8px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
          <input
            type="text"
            placeholder="Room Number (optional)"
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            style={{ width: '100%', padding: '8px', marginBottom: '8px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            style={{ width: '100%', padding: '8px', marginBottom: '8px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ddd' }}
          >
            <option value="Electritian">Electritian</option>
            <option value="Carpenter">Carpenter</option>
            <option value="Plumber">Plumber</option>
            <option value="Ac Issue">Ac Issue</option>
            <option value="Other">Other</option>
          </select>
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
          <button className="btn" onClick={handleAddComplaint} disabled={uploading}>{uploading ? 'Uploading...' : 'Submit'}</button>
          <button className="btn" onClick={() => { setShowAddForm(false); setFormData({ content: '', room: '', category: 'Other', image: null }); setImagePreview(null); }} style={{ marginLeft: '8px', background: '#6b7280' }} disabled={uploading}>Cancel</button>
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
        <ComplaintCard 
          key={c._id || c.id} 
          id={c._id || c.id}
          {...c} 
          canEdit={canEdit} 
          onUpdateStatus={handleUpdateStatus}
          onEdit={handleEditComplaint}
          onDelete={handleDeleteComplaint}
        />
      ))}
    </section>
  );
}
