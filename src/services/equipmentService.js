import apiCall from './api';

export const getEquipment = async () => {
  try {
    return await apiCall('/equipment');
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return [];
  }
};

export const addEquipment = async (equipmentData) => {
  try {
    return await apiCall('/equipment', {
      method: 'POST',
      body: JSON.stringify(equipmentData),
    });
  } catch (error) {
    console.error('Error adding equipment:', error);
    throw error;
  }
};

export const updateEquipment = async (id, updates) => {
  try {
    return await apiCall(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (error) {
    console.error('Error updating equipment:', error);
    throw error;
  }
};

export const deleteEquipment = async (id) => {
  try {
    return await apiCall(`/equipment/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    throw error;
  }
};
