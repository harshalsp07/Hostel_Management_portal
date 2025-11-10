import apiCall from './api';

export const getNotices = async () => {
  try {
    return await apiCall('/notices');
  } catch (error) {
    console.error('Error fetching notices:', error);
    return [];
  }
};

export const addNotice = async (noticeData) => {
  try {
    return await apiCall('/notices', {
      method: 'POST',
      body: JSON.stringify(noticeData),
    });
  } catch (error) {
    console.error('Error adding notice:', error);
    throw error;
  }
};

export const updateNotice = async (id, updates) => {
  try {
    return await apiCall(`/notices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (error) {
    console.error('Error updating notice:', error);
    throw error;
  }
};

export const deleteNotice = async (id) => {
  try {
    return await apiCall(`/notices/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting notice:', error);
    throw error;
  }
};
