import apiCall from './api';

export const getCleaningSchedule = async (userType = null, roomNumber = null) => {
  try {
    const params = new URLSearchParams();
    if (userType) params.append('userType', userType);
    if (roomNumber) params.append('roomNumber', roomNumber);
    
    const queryString = params.toString();
    return await apiCall(`/cleaning${queryString ? '?' + queryString : ''}`);
  } catch (error) {
    console.error('Error fetching cleaning schedule:', error);
    return [];
  }
};

export const updateCleaningStatus = async (id, statusOrBody) => {
  try {
    const body = typeof statusOrBody === 'string' ? { status: statusOrBody } : statusOrBody;
    return await apiCall(`/cleaning/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error('Error updating cleaning status:', error);
    throw error;
  }
};

export const addCleaningSchedule = async (scheduleData) => {
  try {
    return await apiCall('/cleaning', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  } catch (error) {
    console.error('Error adding cleaning schedule:', error);
    throw error;
  }
};
