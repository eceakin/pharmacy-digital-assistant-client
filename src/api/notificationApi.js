
import { API_BASE_URL } from './axiosConfig';

export const notificationApi = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  getByStatus: async (status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/status/${status}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching ${status} notifications:`, error);
      return [];
    }
  },

  retry: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/retry`, {
        method: 'PATCH',
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error retrying notification:', error);
      return false;
    }
  },

  getCounts: async () => {
    try {
      const [totalResponse, sentResponse, failedResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/notifications/count`),
        fetch(`${API_BASE_URL}/notifications/status/SENT`),
        fetch(`${API_BASE_URL}/notifications/status/FAILED`)
      ]);

      const total = await totalResponse.json();
      const sent = await sentResponse.json();
      const failed = await failedResponse.json();

      return {
        total: total.data || 0,
        successful: sent.data?.length || 0,
        failed: failed.data?.length || 0
      };
    } catch (error) {
      console.error('Error fetching notification counts:', error);
      return { total: 0, successful: 0, failed: 0 };
    }
  }
};