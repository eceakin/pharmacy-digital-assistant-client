// src/pages/Prescriptions.jsx - With Debug Logs
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Edit2, Trash2, X, Send, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { prescriptionApi } from '../api/prescriptionApi';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

const [checkingNotifications, setCheckingNotifications] = useState(false);
  const [notificationResult, setNotificationResult] = useState(null);

  const [formData, setFormData] = useState({
    patientId: '',
    prescriptionNumber: '',
    type: 'E_PRESCRIPTION',
    startDate: '',
    endDate: '',
    doctorName: '',
    diagnosis: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log('Component mounted, loading data...'); // DEBUG
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    setLoading(true);
    console.log('Loading data with filter:', filterStatus); // DEBUG
    
    try {
      const [prescriptionsData, patientsData] = await Promise.all([
        filterStatus === 'ALL' 
          ? prescriptionApi.getAllPrescriptions() 
          : prescriptionApi.getPrescriptionsByStatus(filterStatus),
        prescriptionApi.getAllPatients()
      ]);

      console.log('Prescriptions loaded:', prescriptionsData); // DEBUG
      console.log('Patients loaded:', patientsData); // DEBUG

      setPrescriptions(prescriptionsData);
      setPatients(patientsData);
    } catch (error) {
      console.error("Veri yükleme hatası", error);
    } finally {
      setLoading(false);
    }
  };
  const handleCheckNotifications = async () => {
    setCheckingNotifications(true);
    setNotificationResult(null);
    try {
      const result = await prescriptionApi.checkPrescriptionNotifications();
      setNotificationResult(result);
      
      // 5 saniye sonra mesajı kaldır
      setTimeout(() => setNotificationResult(null), 8000);
      
      // Listeyi yenile (durumlar değişmiş olabilir)
      loadData();
    } catch (error) {
      setNotificationResult({ success: false, message: 'Hata oluştu' });
    } finally {
      setCheckingNotifications(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      loadData();
      return;
    }
    const filtered = prescriptions.filter(p => 
      p.prescriptionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    if (!formData.doctorName) newErrors.doctorName = 'Doktor adı zorunludur';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('Form submitted with data:', formData); // DEBUG
    
    if (!validateForm()) {
      console.log('Validation failed:', errors); // DEBUG
      return;
    }

    const result = selectedPrescription
      ? await prescriptionApi.updatePrescription(selectedPrescription.id, formData)
      : await prescriptionApi.createPrescription(formData);

    console.log('Submit result:', result); // DEBUG

    if (result.success) {
      alert('İşlem başarılı!');
      setShowModal(false);
      resetForm();
      loadData();
    } else {
      alert(result.message || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu reçeteyi silmek istediğinize emin misiniz?')) {
      const success = await prescriptionApi.deletePrescription(id);
      if (success) {
        alert('Reçete silindi');
        loadData();
      } else {
        alert('Silme işlemi başarısız');
      }
    }
  };

  const openAddModal = () => {
    setSelectedPrescription(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (prescription) => {
    console.log('Editing prescription:', prescription); // DEBUG
    setSelectedPrescription(prescription);
    setFormData({
      patientId: prescription.patientId,
      prescriptionNumber: prescription.prescriptionNumber,
      type: prescription.type,
      startDate: prescription.startDate ? prescription.startDate.split('T')[0] : '',
      endDate: prescription.endDate ? prescription.endDate.split('T')[0] : '',
      doctorName: prescription.doctorName || '',
      diagnosis: prescription.diagnosis || '',
      notes: prescription.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      prescriptionNumber: '',
      type: 'E_PRESCRIPTION',
      startDate: '',
      endDate: '',
      doctorName: '',
      diagnosis: '',
      notes: ''
    });
    setErrors({});
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: { bg: '#ECFDF5', color: '#10B981', text: 'Aktif' },
      USED: { bg: '#EFF6FF', color: '#3B82F6', text: 'Kullanıldı' },
      EXPIRED: { bg: '#FEF2F2', color: '#EF4444', text: 'Süresi Doldu' },
      CANCELLED: { bg: '#F3F4F6', color: '#6B7280', text: 'İptal' },
      PENDING: { bg: '#FFF7ED', color: '#F59E0B', text: 'Beklemede' }
    };
    const style = styles[status] || styles.PENDING;
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
      E_PRESCRIPTION: { bg: '#EFF6FF', color: '#3B82F6', text: 'E-Reçete' },
      PAPER_PRESCRIPTION: { bg: '#F3F4F6', color: '#6B7280', text: 'Kağıt' },
      REPORT: { bg: '#FFF7ED', color: '#F59E0B', text: 'Rapor' },
      SPECIAL_PRESCRIPTION: { bg: '#FEF2F2', color: '#EF4444', text: 'Özel' }
    };
    const style = styles[type] || styles.E_PRESCRIPTION;
    return (
      <span style={{
        background: style.bg, color: style.color,
        padding: '2px 8px', borderRadius: '6px',
        fontSize: '11px', fontWeight: '500'
      }}>
        {style.text}
      </span>
    );
  };

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
            Reçete Yönetimi
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '14px' }}>
            Toplam {prescriptions.length} reçete
          </p>
        </div>

        {/* Buton Grubu */}
        <div style={{ display: 'flex', gap: '12px' }}>
          
          {/* ✅ YENİ BUTON: Bildirim Kontrol */}
          <button
            onClick={handleCheckNotifications}
            disabled={checkingNotifications}
            style={{
              background: checkingNotifications ? '#9CA3AF' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', // Turuncu tonlarında
              color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px',
              cursor: checkingNotifications ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
              gap: '8px', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 6px rgba(245, 158, 11, 0.25)'
            }}
          >
            {checkingNotifications ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
            {checkingNotifications ? 'Kontrol Ediliyor...' : 'Bildirim Kontrol'}
          </button>

          {/* Yeni Reçete Butonu */}
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
      </div>

      {/* ✅ YENİ: Notification Alert Box */}
      {notificationResult && (
        <div style={{
          background: notificationResult.success ? '#ECFDF5' : '#FEF2F2',
          border: `2px solid ${notificationResult.success ? '#10B981' : '#EF4444'}`,
          borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
          display: 'flex', alignItems: 'flex-start', gap: '12px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {notificationResult.success ? (
            <CheckCircle size={24} color="#10B981" style={{ marginTop: '2px' }} />
          ) : (
            <AlertCircle size={24} color="#EF4444" style={{ marginTop: '2px' }} />
          )}
          
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: '700', 
              color: notificationResult.success ? '#065F46' : '#991B1B',
              marginBottom: '4px'
            }}>
              {notificationResult.success ? 'İşlem Başarılı' : 'Hata Oluştu'}
            </div>

            <div style={{ 
              fontSize: '14px', 
              color: notificationResult.success ? '#047857' : '#B91C1C' 
            }}>
              {notificationResult.message}
            </div>

            {/* Detaylar */}
            {notificationResult.success && notificationResult.data && (
              <div style={{ 
                marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.05)',
                fontSize: '13px', color: '#4B5563', display: 'flex', flexDirection: 'column', gap: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }}></span>
                  Gönderilen Reçete Bildirimi: <strong>{notificationResult.data.notificationsSent || 0}</strong> adet
                </div>
                 <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  (Kontrol edilen süre: {notificationResult.data.checkedDaysAhead} gün)
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Filter */}
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
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
          <option value="USED">Kullanıldı</option>
          <option value="EXPIRED">Süresi Doldu</option>
          <option value="CANCELLED">İptal</option>
          <option value="PENDING">Beklemede</option>
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
        {searchTerm && (
          <button 
            onClick={() => {
              setSearchTerm('');
              loadData();
            }}
            style={{
              background: '#6B7280', color: 'white', border: 'none',
              padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
            }}
          >
            Temizle
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>Yükleniyor...</div>
        ) : prescriptions.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
            Reçete bulunamadı. Yeni reçete eklemek için yukarıdaki butonu kullanın.
          </div>
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
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>{p.patientName || 'N/A'}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>{p.doctorName || '-'}</td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#6B7280' }}>
                    <div>{formatDate(p.startDate)}</div>
                    <div style={{ fontSize: '11px' }}>→ {formatDate(p.endDate)}</div>
                  </td>
                  <td style={{ padding: '16px' }}>{getStatusBadge(p.status)}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => openEditModal(p)} 
                        style={{ 
                          background: '#667eea20', color: '#667eea', border: 'none', 
                          padding: '6px', borderRadius: '6px', cursor: 'pointer' 
                        }} 
                        title="Düzenle"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)} 
                        style={{ 
                          background: '#EF444420', color: '#EF4444', border: 'none', 
                          padding: '6px', borderRadius: '6px', cursor: 'pointer' 
                        }} 
                        title="Sil"
                      >
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
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              padding: '24px', borderBottom: '1px solid #E5E7EB',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                {selectedPrescription ? 'Reçeteyi Düzenle' : 'Yeni Reçete Oluştur'}
              </h2>
              <button 
                onClick={() => { setShowModal(false); resetForm(); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#6B7280' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Hasta Seçimi */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                    Hasta <span style={{color:'red'}}>*</span>
                  </label>
                  <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    disabled={!!selectedPrescription}
                    style={{ 
                      width: '100%', padding: '10px', borderRadius: '8px', 
                      border: `2px solid ${errors.patientId ? '#EF4444' : '#E5E7EB'}`,
                      outline: 'none'
                    }}
                  >
                    <option value="">Hasta Seçiniz</option>
                    {patients.map(pat => (
                      <option key={pat.id} value={pat.id}>{pat.fullName}</option>
                    ))}
                  </select>
                  {errors.patientId && <span style={{ color: 'red', fontSize: '12px' }}>{errors.patientId}</span>}
                </div>

                {/* Reçete No ve Tip */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                      Reçete No <span style={{color:'red'}}>*</span>
                    </label>
                    <input
                      type="text"
                      name="prescriptionNumber"
                      value={formData.prescriptionNumber}
                      onChange={handleInputChange}
                      placeholder="RX-001"
                      style={{ 
                        width: '100%', padding: '10px', borderRadius: '8px', 
                        border: `2px solid ${errors.prescriptionNumber ? '#EF4444' : '#E5E7EB'}`,
                        outline: 'none'
                      }}
                    />
                    {errors.prescriptionNumber && <span style={{ color: 'red', fontSize: '12px' }}>{errors.prescriptionNumber}</span>}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Tip</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #E5E7EB', outline: 'none' }}
                    >
                      <option value="E_PRESCRIPTION">E-Reçete</option>
                      <option value="PAPER_PRESCRIPTION">Kağıt Reçete</option>
                      <option value="REPORT">Rapor</option>
                      <option value="SPECIAL_PRESCRIPTION">Özel Reçete</option>
                    </select>
                  </div>
                </div>

                {/* Tarihler */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                      Başlangıç <span style={{color:'red'}}>*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      style={{ 
                        width: '100%', padding: '10px', borderRadius: '8px', 
                        border: `2px solid ${errors.startDate ? '#EF4444' : '#E5E7EB'}`,
                        outline: 'none'
                      }}
                    />
                    {errors.startDate && <span style={{ color: 'red', fontSize: '12px' }}>{errors.startDate}</span>}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                      Bitiş <span style={{color:'red'}}>*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      style={{ 
                        width: '100%', padding: '10px', borderRadius: '8px', 
                        border: `2px solid ${errors.endDate ? '#EF4444' : '#E5E7EB'}`,
                        outline: 'none'
                      }}
                    />
                    {errors.endDate && <span style={{ color: 'red', fontSize: '12px' }}>{errors.endDate}</span>}
                  </div>
                </div>

                {/* Doktor */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
                    Doktor Adı <span style={{color:'red'}}>*</span>
                  </label>
                  <input
                    type="text"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleInputChange}
                    placeholder="Dr. Ahmet Yılmaz"
                    style={{ 
                      width: '100%', padding: '10px', borderRadius: '8px', 
                      border: `2px solid ${errors.doctorName ? '#EF4444' : '#E5E7EB'}`,
                      outline: 'none'
                    }}
                  />
                  {errors.doctorName && <span style={{ color: 'red', fontSize: '12px' }}>{errors.doctorName}</span>}
                </div>

                {/* Teşhis */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Teşhis</label>
                  <textarea
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Tanı bilgisi..."
                    style={{ 
                      width: '100%', padding: '10px', borderRadius: '8px', 
                      border: '2px solid #E5E7EB', outline: 'none', resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Notlar */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Notlar</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Ek bilgiler..."
                    style={{ 
                      width: '100%', padding: '10px', borderRadius: '8px', 
                      border: '2px solid #E5E7EB', outline: 'none', resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
                  <button 
                    onClick={() => { setShowModal(false); resetForm(); }}
                    style={{ 
                      flex: 1, padding: '12px', background: '#F3F4F6', color: '#374151', 
                      border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' 
                    }}
                  >
                    İptal
                  </button>
                  <button 
                    onClick={handleSubmit}
                    style={{ 
                      flex: 1, padding: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                      color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' 
                    }}
                  >
                    {selectedPrescription ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;