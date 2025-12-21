// src/api/axiosConfig.js
export const API_BASE_URL = 'http://localhost:8080/api';

export const api = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();
      return data.data; // Backend'deki ApiResponse yapısına göre data dönüyoruz
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },
  
  post: async (endpoint, body) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return { success: response.ok, data: data.data, message: data.message };
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: 'Bir hata oluştu' };
    }
  },
  
  put: async (endpoint, body) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return { success: response.ok, data: data.data, message: data.message };
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: 'Bir hata oluştu' };
    }
  },
  
  delete: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  }
};