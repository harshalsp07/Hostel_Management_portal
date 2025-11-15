import React, { useState, useEffect } from 'react';
import apiCall from '../services/api';
import './RoomManagement.css';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    room: '',
    level: '',
    capacity: 2,
    status: 'active',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/rooms');
      setRooms(response || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setMessage({ text: 'Failed to load rooms', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) : value
    }));
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    
    if (!formData.room || !formData.level) {
      setMessage({ text: 'Room number and level are required', isError: true });
      return;
    }

    try {
      setLoading(true);
      const response = await apiCall('/rooms', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response) {
        setMessage({ 
          text: `Room ${formData.room} added successfully!`, 
          isError: false 
        });
        
        setFormData({
          room: '',
          level: '',
          capacity: 2,
          status: 'active',
        });
        
        await fetchRooms();
        setTimeout(() => setShowForm(false), 1500);
      }
    } catch (error) {
      console.error('Error adding room:', error);
      setMessage({ 
        text: error?.message || 'Failed to add room', 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      setLoading(true);
      await apiCall(`/rooms/${id}`, {
        method: 'DELETE',
      });
      
      setMessage({ text: 'Room deleted successfully', isError: false });
      await fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      setMessage({ 
        text: error?.message || 'Failed to delete room', 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-management-container">
      <div className="room-management-header">
        <h2>Room Management</h2>
        <button 
          className="btn-add-room"
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
        >
          {showForm ? 'Cancel' : '+ Add Room'}
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.isError ? 'error' : 'success'}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="room-form-container">
          <form onSubmit={handleAddRoom} className="room-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="room">Room Number *</label>
                <input
                  id="room"
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={handleInputChange}
                  placeholder="e.g., C-301"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="level">Level *</label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Level</option>
                  <option value="Level 1">Level 1</option>
                  <option value="Level 2">Level 2</option>
                  <option value="Level 3">Level 3</option>
                  <option value="Level 4">Level 4</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="capacity">Capacity</label>
                <input
                  id="capacity"
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Room'}
            </button>
          </form>
        </div>
      )}

      <div className="rooms-table-container">
        <h3>All Rooms ({rooms.length})</h3>
        {loading ? (
          <p className="loading">Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p className="no-rooms">No rooms found. Add a room to get started.</p>
        ) : (
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Level</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room._id}>
                  <td><strong>{room.room}</strong></td>
                  <td>{room.level}</td>
                  <td>{room.capacity}</td>
                  <td>
                    <span className={`badge badge-${room.status}`}>
                      {room.status}
                    </span>
                  </td>
                  <td>{new Date(room.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteRoom(room._id)}
                      className="btn-delete"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RoomManagement;
