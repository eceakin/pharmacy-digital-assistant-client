// src/api/medicationApi.js
const API_BASE_URL = 'http://localhost:8080/api';

export const medicationApi = {


  // Tüm ilaçları getir
  getAllMedications: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/medications`);
      const data = await response.json();
      console.log('All Medications Response:', data);
      return data.data || [];
    } catch (error) {
      console.error('İlaçlar yüklenirken hata:', error);
      return [];
    }
  },
  createMedication: async (medicationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medicationData),
      });
      const data = await response.json();
      return {
        success: response.ok,
        data: data.data,
        message: data.message || 'İşlem başarısız'
      };
    } catch (error) {
      console.error('İlaç oluşturulurken hata:', error);
      return {
        success: false,
        message: 'Sunucu hatası oluştu'
      };
    }},

  // İlaç özetlerini getir (daha hafif)
  getMedicationsSummary: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/medications/summary`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('İlaç özetleri yüklenirken hata:', error);
      return [];
    }
  },

  // Hasta bazında ilaçlar
  getMedicationsByPatient: async (patientId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medications/patient/${patientId}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Hasta ilaçları yüklenirken hata:', error);
      return [];
    }
  },

  // Duruma göre ilaçlar
  getMedicationsByStatus: async (status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medications/status/${status}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('İlaçlar filtrelenirken hata:', error);
      return [];
    }
  },

  // Yenilenmesi gereken ilaçlar
  getMedicationsNeedingRefill: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/medications/refill-needed`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Yenileme gereken ilaçlar yüklenirken hata:', error);
      return [];
    }
  },

  // 🎯 İLAÇ BİLDİRİMLERİNİ KONTROL ET (DEMO)
  checkMedicationNotifications: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/demo/check-medications`);
      const data = await response.json();
      console.log('Medication Check Result:', data);
      return {
        success: response.ok,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('Bildirim kontrolü başarısız:', error);
      return {
        success: false,
        message: 'Bildirim kontrolü sırasında hata oluştu'
      };
    }
  }
};