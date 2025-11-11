import apiCall from './api';

export const getComplaints = async (userType = null, userId = null) => {
  try {
    const params = new URLSearchParams();
    if (userType) params.append('userType', userType);
    if (userId) params.append('userId', userId);
    
    const queryString = params.toString();
    const result = await apiCall(`/complaints${queryString ? '?' + queryString : ''}`);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return [];
  }
};

export const addComplaint = async (complaintData) => {
  try {
    const response = await apiCall('/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    });
    console.log('Complaint added successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding complaint:', error);
    throw error;
  }
};

export const updateComplaint = async (id, updates) => {
  try {
    const response = await apiCall(`/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    console.log('Complaint updated successfully:', response);
    return response;
  } catch (error) {
    console.error('Error updating complaint:', error);
    throw error;
  }
};

export const deleteComplaint = async (id) => {
  try {
    return await apiCall(`/complaints/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    throw error;
  }
};
