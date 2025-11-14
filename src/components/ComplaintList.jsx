import React, { useState, useEffect } from 'react';
import apiCall from '../services/api';

const ComplaintList = ({ canAdd, canEdit, user, userType }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'maintenance',
    priority: 'medium',
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/complaints');
      setComplaints(response || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiCall('/complaints', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          userId: user?.uid,
          userName: user?.name || user?.email,
        }),
      });
      setFormData({
        title: '',
        description: '',
        category: 'maintenance',
        priority: 'medium',
      });
      setShowForm(false);
      await fetchComplaints();
    } catch (error) {
      console.error('Error creating complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      setLoading(true);
      await apiCall(`/complaints/${id}`, { method: 'DELETE' });
      await fetchComplaints();
    } catch (error) {
      console.error('Error deleting complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complaint-section">
      <div className="section-header">
        <h3>Complaints</h3>
        {canAdd && (
          <button 
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
            disabled={loading}
          >
            {showForm ? 'Cancel' : '+ New Complaint'}
          </button>
        )}
      </div>

      {showForm && canAdd && (
        <form onSubmit={handleSubmit} className="complaint-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Complaint title"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the issue"
              required
              disabled={loading}
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="maintenance">Maintenance</option>
                <option value="cleaning">Cleaning</option>
                <option value="noise">Noise</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="loading">Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <p className="no-data">No complaints yet</p>
      ) : (
        <div className="complaints-list">
          {complaints.map(complaint => (
            <div key={complaint._id} className="complaint-card">
              <div className="complaint-header">
                <h4>{complaint.title}</h4>
                <span className={`badge badge-${complaint.priority}`}>
                  {complaint.priority}
                </span>
              </div>
              <p className="complaint-description">{complaint.description}</p>
              <div className="complaint-meta">
                <span className="category">{complaint.category}</span>
                <span className="status">{complaint.status || 'pending'}</span>
              </div>
              {canEdit && (
                <button
                  onClick={() => handleDelete(complaint._id)}
                  className="btn-delete"
                  disabled={loading}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplaintList;
