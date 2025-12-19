// src/api/reportApi.js
import { api } from './axiosConfig';

export const reportApi = {
  // Tüm bildirimleri çek (Frontend'de gruplayıp en çok bildirim alanları bulacağız)
  getAllNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response || []; // axiosConfig.js yapına göre response.data olabilir, kontrol et
    } catch (error) {
      console.error('Error fetching notifications for report:', error);
      return [];
    }
  },

  // Düşük stoklu ürünleri getir
  getLowStockItems: async () => {
    try {
      const response = await api.get('/stocks/alerts/low');
      return response || [];
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      return [];
    }
  },

  // Son kullanma tarihi yaklaşanları getir (Varsayılan 90 gün)
  getExpiringItems: async (days = 90) => {
    try {
      const response = await api.get(`/stocks/alerts/expiring?days=${days}`);
      return response || [];
    } catch (error) {
      console.error('Error fetching expiring items:', error);
      return [];
    }
  }
};