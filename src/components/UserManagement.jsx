import React, { useState, useEffect } from 'react';
import apiCall from '../services/api';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    roomNumber: '',
    userType: 'student',
  });
  const [generatedPassword, setGeneratedPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/users/all');
      setUsers(response || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ text: 'Failed to load users', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name) {
      setMessage({ text: 'Email and name are required', isError: true });
      return;
    }

    try {
      setLoading(true);
      const password = generatePassword();
      
      const response = await apiCall('/users/create-by-admin', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          roomNumber: formData.roomNumber,
          userType: formData.userType,
          password: password,
        }),
      });

      if (response && response.tempPassword) {
        setGeneratedPassword(response.tempPassword);
        setMessage({ 
          text: `User created successfully! Temporary password: ${response.tempPassword}`, 
          isError: false 
        });
        
        setFormData({
          email: '',
          name: '',
          phone: '',
          roomNumber: '',
          userType: 'student',
        });
        
        await fetchUsers();
        setTimeout(() => setShowForm(false), 2000);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setMessage({ 
        text: error?.message || 'Failed to create user', 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (uid) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setLoading(true);
      await apiCall(`/users/${uid}`, {
        method: 'DELETE',
      });
      
      setMessage({ text: 'User deleted successfully', isError: false });
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage({ 
        text: error?.message || 'Failed to delete user', 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage({ text: 'Password copied to clipboard', isError: false });
  };

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h2>User Management</h2>
        <button 
          className="btn-add-user"
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
        >
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.isError ? 'error' : 'success'}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="user-form-container">
          <form onSubmit={handleCreateUser} className="user-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="user@example.com"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="roomNumber">Room Number</label>
                <input
                  id="roomNumber"
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  placeholder="Room Number"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="userType">User Type</label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="student">Student</option>
                  <option value="worker">Worker</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
      )}

      {generatedPassword && (
        <div className="password-display">
          <p>Temporary Password:</p>
          <div className="password-box">
            <code>{generatedPassword}</code>
            <button 
              onClick={() => copyToClipboard(generatedPassword)}
              className="btn-copy"
            >
              Copy
            </button>
          </div>
          <small>Share this password with the user. They should change it on first login.</small>
        </div>
      )}

      <div className="users-table-container">
        <h3>All Users ({users.length})</h3>
        {loading ? (
          <p className="loading">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="no-users">No users found</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Room</th>
                <th>Type</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id || user.uid}>
                  <td>{user.email}</td>
                  <td>{user.name || '-'}</td>
                  <td>{user.phone || '-'}</td>
                  <td>{user.roomNumber || '-'}</td>
                  <td>
                    <span className={`badge badge-${user.userType}`}>
                      {user.userType}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt || user.timestamps?.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteUser(user.uid)}
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

export default UserManagement;
