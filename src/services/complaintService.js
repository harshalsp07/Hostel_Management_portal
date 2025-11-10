import apiCall from './api';

export const getComplaints = async (userType = null, userId = null) => {
  try {
    const params = new URLSearchParams();
    if (userType) params.append('userType', userType);
    if (userId) params.append('userId', userId);
    
    const queryString = params.toString();
    return await apiCall(`/complaints${queryString ? '?' + queryString : ''}`);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return [];
  }
};

export const addComplaint = async (complaintData) => {
  try {
    return await apiCall('/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    });
  } catch (error) {
    console.error('Error adding complaint:', error);
    throw error;
  }
};

export const updateComplaint = async (id, updates) => {
  try {
    return await apiCall(`/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    throw error;
  }
};
