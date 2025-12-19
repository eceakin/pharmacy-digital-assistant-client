// src/api/inventoryApi.js
const API_BASE_URL = 'http://localhost:8080/api';

export const inventoryApi = {
  // Get all stocks
  getAllStocks: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching stocks:', error);
      return [];
    }
  },

  // Get stocks summary
  getStocksSummary: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks/summary`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching stocks summary:', error);
      return [];
    }
  },

  // Get total stock count
  getTotalStockCount: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks/count`);
      const data = await response.json();
      return data.data || 0;
    } catch (error) {
      console.error('Error fetching stock count:', error);
      return 0;
    }
  },

  // Get low stock alerts
  getLowStocks: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks/alerts/low`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching low stocks:', error);
      return [];
    }
  },

  // Get expiring stocks
  getExpiringStocks: async (days = 90) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks/alerts/expiring?days=${days}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching expiring stocks:', error);
      return [];
    }
  },

  // Get expired stocks
  getExpiredStocks: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks/alerts/expired`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching expired stocks:', error);
      return [];
    }
  },

  // Get stocks by status
  getStocksByStatus: async (status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks/status/${status}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching stocks by status:', error);
      return [];
    }
  },

  // Get stock by ID
  getStockById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks/${id}`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching stock:', error);
      return null;
    }
  },

  // Create new stock
  createStock: async (stockData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockData),
      });
      const data = await response.json();
      return { success: response.ok, data: data.data, message: data.message };
    } catch (error) {
      console.error('Error creating stock:', error);
      return { success: false, message: 'Stok oluşturulamadı' };
    }
  },

  // Update stock
  updateStock: async (id, stockData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockData),
      });
      const data = await response.json();
      return { success: response.ok, data: data.data, message: data.message };
    } catch (error) {
      console.error('Error updating stock:', error);
      return { success: false, message: 'Stok güncellenemedi' };
    }
  },

  // Delete stock
  deleteStock: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting stock:', error);
      return false;
    }
  },

  // Add quantity to stock
  addQuantity: async (id, quantity, reason) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/stocks/${id}/add?quantity=${quantity}${reason ? `&reason=${reason}` : ''}`,
        { method: 'PATCH' }
      );
      const data = await response.json();
      return { success: response.ok, data: data.data };
    } catch (error) {
      console.error('Error adding quantity:', error);
      return { success: false };
    }
  },

  // Deduct quantity from stock
  deductQuantity: async (id, quantity, reason) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/stocks/${id}/deduct?quantity=${quantity}${reason ? `&reason=${reason}` : ''}`,
        { method: 'PATCH' }
      );
      const data = await response.json();
      return { success: response.ok, data: data.data };
    } catch (error) {
      console.error('Error deducting quantity:', error);
      return { success: false };
    }
  },

  // Get all products (for dropdown)
  getAllProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },
};