// src/pages/Prescriptions.jsx
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Edit2, Trash2, X, Filter } from 'lucide-react';
import { prescriptionApi } from '../api/prescriptionApi';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  
  // Filtreleme durumu (ALL, ACTIVE, COMPLETED, EXPIRED)
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [formData, setFormData] = useState({
    patientId: '',
    prescriptionNumber: '',
    type: 'NORMAL', // Enum: NORMAL, RED, GREEN, PURPLE, ORANGE
    startDate: '',
    endDate: '',
    doctorName: '',
    diagnosis: '',
    medications: [] // Backend create isteğinde ilaç listesi bekliyor
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Reçeteleri ve hastaları paralel çek
      const [prescriptionsData, patientsData] = await Promise.all([
        filterStatus === 'ALL' 
          ? prescriptionApi.getAllPrescriptions() 
          : prescriptionApi.getPrescriptionsByStatus(filterStatus),
        prescriptionApi.getAllPatients()
      ]);

      setPrescriptions(prescriptionsData);
      setPatients(patientsData);
    } catch (error) {
      console.error("Veri yükleme hatası", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      loadData();
      return;
    }
    // Frontend tarafında basit arama (API'de search endpoint yoksa)
    const filtered = prescriptions.filter(p => 
      p.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setPrescriptions(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientId) newErrors.patientId = 'Hasta seçimi zorunludur';
    if (!formData.prescriptionNumber) newErrors.prescriptionNumber = 'Reçete no zorunludur';
    if (!formData.startDate) newErrors.startDate = 'Başlangıç tarihi zorunludur';
    if (!formData.endDate) newErrors.endDate = 'Bitiş tarihi zorunludur';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Tarihleri backend formatına uygun hale getirelim (gerekirse)
    const payload = {
        ...formData,
        // Backend entity ilişkisi için ID göndermeliyiz
        patientId: formData.patientId 
    };

    const result = selectedPrescription
      ? await prescriptionApi.updatePrescription(selectedPrescription.id, payload)
      : await prescriptionApi.createPrescription(payload);

    if (result.success) {
      setShowModal(false);
      resetForm();
      loadData();
    } else {
      alert(result.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu reçeteyi silmek istediğinize emin misiniz?')) {
      const success = await prescriptionApi.deletePrescription(id);
      if (success) loadData();
    }
  };

  const openAddModal = () => {
    setSelectedPrescription(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (prescription) => {
    setSelectedPrescription(prescription);
    setFormData({
      patientId: prescription.patientId, // Backend response içinde patientId dönmeli
      prescriptionNumber: prescription.prescriptionNumber,
      type: prescription.type,
      startDate: prescription.startDate ? prescription.startDate.split('T')[0] : '',
      endDate: prescription.endDate ? prescription.endDate.split('T')[0] : '',
      doctorName: prescription.doctorName || '',
      diagnosis: prescription.diagnosis || '',
      medications: [] // Düzenlemede ilaçları getirmek kompleks olabilir, şimdilik boş
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      prescriptionNumber: '',
      type: 'NORMAL',
      startDate: '',
      endDate: '',
      doctorName: '',
      diagnosis: '',
      medications: []
    });
    setErrors({});
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  // Renkli Badge'ler
  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: { bg: '#ECFDF5', color: '#10B981', text: 'Aktif' },
      COMPLETED: { bg: '#EFF6FF', color: '#3B82F6', text: 'Tamamlandı' },
      EXPIRED: { bg: '#FEF2F2', color: '#EF4444', text: 'Süresi Doldu' },
      CANCELLED: { bg: '#F3F4F6', color: '#6B7280', text: 'İptal' }
    };
    const style = styles[status] || styles.CANCELLED;
    return (
      <span style={{
        background: style.bg, color: style.color,
        padding: '4px 12px', borderRadius: '12px',
        fontSize: '12px', fontWeight: '600'
      }}>
        {style.text}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const styles = {
      NORMAL: { bg: '#F3F4F6', color: '#374151', text: 'Normal' },
      RED: { bg: '#FEF2F2', color: '#DC2626', text: 'Kırmızı' },
      GREEN: { bg: '#ECFDF5', color: '#059669', text: 'Yeşil' },
      PURPLE: { bg: '#F5F3FF', color: '#7C3AED', text: 'Mor' },
      ORANGE: { bg: '#FFF7ED', color: '#EA580C', text: 'Turuncu' }
    };
    const style = styles[type] || styles.NORMAL;
    return (
      <span style={{
        background: style.bg, color: style.color,
        padding: '2px 8px', borderRadius: '6px',
        fontSize: '11px', fontWeight: '500', border: `1px solid ${style.color}30`
      }}>
        {style.text}
      </span>
    );
  };

  return (
    <div style={{ padding: '32px' }}>
      {/* Üst Başlık ve Buton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
            Reçete Yönetimi
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '14px' }}>
                Reçete takibi, durumu ve detayları
            </p>
        </div>
        <button
          onClick={openAddModal}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', border: 'none', padding: '12px 24px',
            borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 6px rgba(102, 126, 234, 0.25)'
          }}
        >
          <Plus size={20} /> Yeni Reçete
        </button>
      </div>

      {/* Arama ve Filtreleme */}
      <div style={{ 
        background: 'white', padding: '16px', borderRadius: '12px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px',
        display: 'flex', gap: '16px', alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Reçete no veya hasta adı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '10px 10px 10px 40px',
              border: '2px solid #E5E7EB', borderRadius: '8px', outline: 'none'
            }}
          />
        </div>
        
        <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
                padding: '10px', borderRadius: '8px', border: '2px solid #E5E7EB',
                outline: 'none', color: '#374151', cursor: 'pointer'
            }}
        >
            <option value="ALL">Tüm Durumlar</option>
            <option value="ACTIVE">Aktif</option>
            <option value="COMPLETED">Tamamlandı</option>
            <option value="EXPIRED">Süresi Doldu</option>
        </select>
        
        <button 
            onClick={handleSearch}
            style={{
                background: '#667eea', color: 'white', border: 'none',
                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
            }}
        >
            Ara
        </button>
      </div>

      {/* Tablo */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
           <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>Yükleniyor...</div>
        ) : prescriptions.length === 0 ? (
           <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>Kayıt bulunamadı.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>Reçete No</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>Tip</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>Hasta</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>Doktor</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>Tarihler</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>Durum</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} color="#667eea" />
                        {p.prescriptionNumber}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>{getTypeBadge(p.type)}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>{p.patientName}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>{p.doctorName || '-'}</td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#6B7280' }}>
                    <div>{formatDate(p.startDate)}</div>
                    <div style={{ fontSize: '11px' }}>bitiş: {formatDate(p.endDate)}</div>
                  </td>
                  <td style={{ padding: '16px' }}>{getStatusBadge(p.status)}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => openEditModal(p)} style={{ background: '#F3F4F6', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#4B5563' }} title="Düzenle">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} style={{ background: '#FEE2E2', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#EF4444' }} title="Sil">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px',
            maxHeight: '90vh', overflowY: 'auto', padding: '24px', position: 'relative'
          }}>
            <button 
                onClick={() => setShowModal(false)} 
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
                <X size={24} color="#6B7280" />
            </button>
            
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 'bold' }}>
              {selectedPrescription ? 'Reçeteyi Düzenle' : 'Yeni Reçete Oluştur'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Hasta Seçimi */}
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Hasta <span style={{color:'red'}}>*</span></label>
                    <select
                        name="patientId"
                        value={formData.patientId}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #E5E7EB' }}
                        disabled={!!selectedPrescription} // Düzenlerken hasta değişmesin
                    >
                        <option value="">Hasta Seçiniz</option>
                        {patients.map(pat => (
                            <option key={pat.id} value={pat.id}>{pat.fullName}</option>
                        ))}
                    </select>
                    {errors.patientId && <span style={{ color: 'red', fontSize: '12px' }}>{errors.patientId}</span>}
                </div>

                {/* Reçete No ve Tip (Yan Yana) */}
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Reçete No <span style={{color:'red'}}>*</span></label>
                        <input
                            type="text"
                            name="prescriptionNumber"
                            value={formData.prescriptionNumber}
                            onChange={handleInputChange}
                            placeholder="Örn: REC-2024-001"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #E5E7EB' }}
                        />
                         {errors.prescriptionNumber && <span style={{ color: 'red', fontSize: '12px' }}>{errors.prescriptionNumber}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Reçete Tipi</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #E5E7EB' }}
                        >
                            <option value="NORMAL">Normal</option>
                            <option value="RED">Kırmızı</option>
                            <option value="GREEN">Yeşil</option>
                            <option value="PURPLE">Mor</option>
                            <option value="ORANGE">Turuncu</option>
                        </select>
                    </div>
                </div>

                {/* Tarihler (Yan Yana) */}
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Başlangıç Tarihi <span style={{color:'red'}}>*</span></label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #E5E7EB' }}
                        />
                         {errors.startDate && <span style={{ color: 'red', fontSize: '12px' }}>{errors.startDate}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Bitiş Tarihi <span style={{color:'red'}}>*</span></label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #E5E7EB' }}
                        />
                         {errors.endDate && <span style={{ color: 'red', fontSize: '12px' }}>{errors.endDate}</span>}
                    </div>
                </div>

                {/* Doktor ve Teşhis */}
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Doktor Adı</label>
                    <input
                        type="text"
                        name="doctorName"
                        value={formData.doctorName}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #E5E7EB' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Teşhis / Notlar</label>
                    <textarea
                        name="diagnosis"
                        value={formData.diagnosis}
                        onChange={handleInputChange}
                        rows={3}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #E5E7EB' }}
                    />
                </div>

                {/* Not: Backend'de ilaç listesi de bekleniyor (nested list). 
                    Şimdilik basitlik adına burada sadece reçete ana bilgilerini yönetiyoruz. 
                    İlaç ekleme kısmı reçete detay sayfasında veya ayrı bir adımda yapılabilir. */}

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button 
                        onClick={() => setShowModal(false)}
                        style={{ flex: 1, padding: '12px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                    >
                        İptal
                    </button>
                    <button 
                        onClick={handleSubmit}
                        style={{ flex: 1, padding: '12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                    >
                        {selectedPrescription ? 'Güncelle' : 'Kaydet'}
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;