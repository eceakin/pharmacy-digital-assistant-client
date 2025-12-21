// src/api/prescriptionApi.js
import { api } from './axiosConfig';

export const prescriptionApi = {
  // Tüm reçeteleri getir
  getAllPrescriptions: async () => {
    try {
      const response = await api.get('/prescriptions');
      return response.data || [];
    } catch (error) {
      console.error('Reçeteler yüklenirken hata:', error);
      return [];
    }
  },

  // ID'ye göre reçete getir
  getPrescriptionById: async (id) => {
    try {
      const response = await api.get(`/prescriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Reçete detayı yüklenirken hata:', error);
      return null;
    }
  },

  // Yeni reçete oluştur
  createPrescription: async (data) => {
    try {
      const response = await api.post('/prescriptions', data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Reçete oluşturulurken hata:', error);
      return { success: false, message: error.response?.data?.message || 'Bir hata oluştu' };
    }
  },

  // Reçete güncelle
  updatePrescription: async (id, data) => {
    try {
      const response = await api.put(`/prescriptions/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Reçete güncellenirken hata:', error);
      return { success: false, message: error.response?.data?.message || 'Bir hata oluştu' };
    }
  },

  // Reçete sil
  deletePrescription: async (id) => {
    try {
      await api.delete(`/prescriptions/${id}`);
      return true;
    } catch (error) {
      console.error('Reçete silinirken hata:', error);
      return false;
    }
  },

  // Duruma göre reçeteleri getir (Örn: ACTIVE)
  getPrescriptionsByStatus: async (status) => {
    try {
      const response = await api.get(`/prescriptions/status/${status}`);
      return response.data || [];
    } catch (error) {
      console.error('Filtreleme hatası:', error);
      return [];
    }
  },
  
  // Hasta listesini dropdown için çekmek gerekecek
  getAllPatients: async () => {
      try {
          const response = await api.get('/patients');
          return response.data || [];
      } catch (error) {
          return [];
      }
  }
};