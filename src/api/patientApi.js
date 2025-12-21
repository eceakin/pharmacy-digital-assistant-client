const API_BASE_URL = 'http://localhost:8080/api';

export const patientApi = {
  // Tüm hastaları getir
  getAllPatients: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Hastalar yüklenirken hata:', error);
      return [];
    }
  },

  // Tek bir hastayı getir (İleride lazım olabilir)
  getPatientById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Hasta detayı yüklenirken hata:', error);
      return null;
    }
  }
};