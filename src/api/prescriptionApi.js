// src/api/prescriptionApi.js
const API_BASE_URL = 'http://localhost:8080/api';

export const prescriptionApi = {
  // Tüm reçeteleri getir
  getAllPrescriptions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prescriptions`);
      const data = await response.json();
      console.log('All Prescriptions Response:', data); // DEBUG
      return data.data || [];
    } catch (error) {
      console.error('Reçeteler yüklenirken hata:', error);
      return [];
    }
  },

  // ID'ye göre reçete getir
  getPrescriptionById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Reçete detayı yüklenirken hata:', error);
      return null;
    }
  },

  // Yeni reçete oluştur
  createPrescription: async (prescriptionData) => {
    try {
      // Backend'in CreatePrescriptionRequest formatına uygun payload oluştur
      const payload = {
        patientId: prescriptionData.patientId,
        prescriptionNumber: prescriptionData.prescriptionNumber,
        type: prescriptionData.type || 'E_PRESCRIPTION',
        issueDate: prescriptionData.startDate, // issueDate gerekli
        startDate: prescriptionData.startDate,
        endDate: prescriptionData.endDate,
        validityDays: calculateValidityDays(prescriptionData.startDate, prescriptionData.endDate),
        doctorName: prescriptionData.doctorName || 'Belirtilmemiş',
        doctorSpecialty: prescriptionData.doctorSpecialty || null,
        institution: prescriptionData.institution || null,
        diagnosis: prescriptionData.diagnosis || null,
        notes: prescriptionData.notes || null,
        refillCount: prescriptionData.refillCount || 0
      };

      console.log('Creating prescription with payload:', payload); // DEBUG

      const response = await fetch(`${API_BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Create prescription response:', data); // DEBUG

      if (response.ok) {
        return { success: true, data: data.data, message: data.message };
      } else {
        return { success: false, message: data.message || 'Bir hata oluştu' };
      }
    } catch (error) {
      console.error('Reçete oluşturulurken hata:', error);
      return { success: false, message: error.message || 'Bir hata oluştu' };
    }
  },

  // Reçete güncelle
  updatePrescription: async (id, prescriptionData) => {
    try {
      const payload = {
        type: prescriptionData.type || 'E_PRESCRIPTION',
        issueDate: prescriptionData.startDate,
        startDate: prescriptionData.startDate,
        endDate: prescriptionData.endDate,
        validityDays: calculateValidityDays(prescriptionData.startDate, prescriptionData.endDate),
        doctorName: prescriptionData.doctorName || 'Belirtilmemiş',
        doctorSpecialty: prescriptionData.doctorSpecialty || null,
        institution: prescriptionData.institution || null,
        diagnosis: prescriptionData.diagnosis || null,
        notes: prescriptionData.notes || null,
        refillCount: prescriptionData.refillCount || 0
      };

      console.log('Updating prescription with payload:', payload); // DEBUG

      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data, message: data.message };
      } else {
        return { success: false, message: data.message || 'Bir hata oluştu' };
      }
    } catch (error) {
      console.error('Reçete güncellenirken hata:', error);
      return { success: false, message: error.message || 'Bir hata oluştu' };
    }
  },

  // Reçete sil
  deletePrescription: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Reçete silinirken hata:', error);
      return false;
    }
  },

  // Duruma göre reçeteleri getir
  getPrescriptionsByStatus: async (status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/prescriptions/status/${status}`);
      const data = await response.json();
      console.log(`Prescriptions by status ${status}:`, data); // DEBUG
      return data.data || [];
    } catch (error) {
      console.error('Filtreleme hatası:', error);
      return [];
    }
  },
  
  // Hasta listesini dropdown için çekmek
  getAllPatients: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Hastalar yüklenirken hata:', error);
      return [];
    }
  }
};

// Helper function to calculate validity days
function calculateValidityDays(startDate, endDate) {
  if (!startDate || !endDate) return 30; // Default 30 days
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}