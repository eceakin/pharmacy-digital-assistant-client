// src/api/settingsApi.js
const API_BASE_URL = 'http://localhost:8080/api';

export const settingsApi = {
  // Get current settings
  getSettings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  },

  // Update settings
  updateSettings: async (settingsData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });
      const data = await response.json();
      return { 
        success: response.ok, 
        data: data.data, 
        message: data.message 
      };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { 
        success: false, 
        message: 'Ayarlar güncellenemedi' 
      };
    }
  },

  // Reset to defaults
  resetSettings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/reset`, {
        method: 'POST',
      });
      const data = await response.json();
      return { 
        success: response.ok, 
        data: data.data, 
        message: data.message 
      };
    } catch (error) {
      console.error('Error resetting settings:', error);
      return { 
        success: false, 
        message: 'Ayarlar sıfırlanamadı' 
      };
    }
  },

  // Test notifications (for demo)
  testNotifications: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/demo/check-all`);
      const data = await response.json();
      return { 
        success: response.ok, 
        data: data.data, 
        message: data.message 
      };
    } catch (error) {
      console.error('Error testing notifications:', error);
      return { 
        success: false, 
        message: 'Bildirim testi başarısız oldu' 
      };
    }
  }
};