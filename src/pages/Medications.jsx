import React, { useState, useEffect, useCallback } from 'react'; // useCallback EKLENDİ
import { Pill, User, AlertCircle, RefreshCw, Send, Clock, CheckCircle, Plus, X } from 'lucide-react';
import { medicationApi } from '../api/medicationApi';
import { patientApi } from '../api/patientApi'; // Artık hata vermeyecek
import { inventoryApi } from '../api/inventoryApi';

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Bildirim State'leri
  const [checkingNotifications, setCheckingNotifications] = useState(false);
  const [notificationResult, setNotificationResult] = useState(null);
  
  // Modal ve Form State'leri
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    patientId: '',
    productId: '',
    dosageAmount: '',
    dosageUnit: 'mg',
    dosageInstructions: '',
    startDate: '',
    endDate: '',
    frequency: 'ONCE_DAILY',
    administrationRoute: 'ORAL',
    notes: ''
  });

  // ✅ DÜZELTME: useCallback ile fonksiyonu hafızada sabitliyoruz
  const loadMedications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await medicationApi.getAllMedications();
      setMedications(data);
    } catch (error) {
      console.error('Medication loading error:', error);
    } finally {
      setLoading(false);
    }
  }, []); // Bağımlılık yok, sadece ilk oluştuğunda tanımlanır

  // useEffect artık loadMedications'ı bağımlılık olarak kabul edebilir
  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  // Modal açıldığında form verilerini yükle
  useEffect(() => {
    if (showModal) {
      loadFormData();
    }
  }, [showModal]);

  const loadFormData = async () => {
    try {
      const [patientsData, productsData] = await Promise.all([
        patientApi.getAllPatients(),
        inventoryApi.getAllProducts()
      ]);
      setPatients(patientsData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Form verileri yüklenirken hata:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.productId || !formData.startDate) {
      alert('Lütfen zorunlu alanları doldurunuz (Hasta, İlaç, Başlangıç Tarihi)');
      return;
    }

    const payload = {
      ...formData,
      dosageAmount: parseFloat(formData.dosageAmount),
      endDate: formData.endDate || null 
    };

    const result = await medicationApi.createMedication(payload);
    
    if (result.success) {
      setShowModal(false);
      resetForm();
      loadMedications();
      alert('İlaç takibi başarıyla oluşturuldu!');
    } else {
      alert('Hata: ' + result.message);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      productId: '',
      dosageAmount: '',
      dosageUnit: 'mg',
      dosageInstructions: '',
      startDate: '',
      endDate: '',
      frequency: 'ONCE_DAILY',
      administrationRoute: 'ORAL',
      notes: ''
    });
  };

  const handleCheckNotifications = async () => {
    setCheckingNotifications(true);
    setNotificationResult(null);
    try {
      const result = await medicationApi.checkMedicationNotifications();
      setNotificationResult(result);
      setTimeout(() => setNotificationResult(null), 5000);
      loadMedications();
    } catch (error) {
      setNotificationResult({ success: false, message: 'Hata oluştu' });
    } finally {
      setCheckingNotifications(false);
    }
  };

  // Helper Functions
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: { bg: '#ECFDF5', color: '#10B981', text: 'Aktif', icon: CheckCircle },
      DISCONTINUED: { bg: '#FEF2F2', color: '#EF4444', text: 'Kesildi', icon: AlertCircle },
      ON_HOLD: { bg: '#FFF7ED', color: '#F59E0B', text: 'Askıda', icon: Clock },
      COMPLETED: { bg: '#EFF6FF', color: '#3B82F6', text: 'Tamamlandı', icon: CheckCircle }
    };
    const style = styles[status] || styles.ACTIVE;
    const Icon = style.icon;
    return (
      <span style={{
        background: style.bg, color: style.color, padding: '4px 12px', borderRadius: '12px',
        fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px'
      }}>
        <Icon size={14} /> {style.text}
      </span>
    );
  };

  const getDaysRemainingBadge = (endDate) => {
    if (!endDate) return null;
    const diffDays = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    let color = '#10B981';
    let text = `${diffDays} gün kaldı`;
    
    if (diffDays < 0) {
      color = '#EF4444'; 
      text = 'Süresi Dolmuş';
    } else if (diffDays <= 3) {
      color = '#EF4444';
    } else if (diffDays <= 7) {
      color = '#F59E0B';
    }

    return (
      <span style={{
        background: `${color}20`, color: color, padding: '4px 10px',
        borderRadius: '12px', fontSize: '12px', fontWeight: '700',
        display: 'inline-flex', alignItems: 'center', gap: '4px'
      }}>
        <Clock size={14} /> {text}
      </span>
    );
  };

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Pill size={32} color="#5B21B6" />
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>İlaç Takipleri</h1>
          </div>
          <p style={{ color: '#6B7280', marginTop: '4px' }}>Hastaların düzenli kullandığı ilaçlar</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 6px rgba(102, 126, 234, 0.25)'
            }}
          >
            <Plus size={20} /> Yeni İlaç Takibi
          </button>

          <button
            onClick={loadMedications}
            style={{
              background: '#F3F4F6', color: '#374151', border: 'none', padding: '12px 20px',
              borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '14px', fontWeight: '600'
            }}
          >
            <RefreshCw size={18} /> Yenile
          </button>
          
          <button
            onClick={handleCheckNotifications}
            disabled={checkingNotifications}
            style={{
              background: checkingNotifications ? '#9CA3AF' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px',
              cursor: checkingNotifications ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
              gap: '8px', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.25)'
            }}
          >
            {checkingNotifications ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
            {checkingNotifications ? 'Kontrol Ediliyor...' : 'Bildirim Kontrol'}
          </button>
        </div>
      </div>

    {/* Notification Alert - GÜNCELLENEN KISIM */}
      {notificationResult && (
        <div style={{
          background: notificationResult.success ? '#ECFDF5' : '#FEF2F2',
          border: `2px solid ${notificationResult.success ? '#10B981' : '#EF4444'}`,
          borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
          display: 'flex', alignItems: 'flex-start', gap: '12px', // alignItems center yerine flex-start yaptım ki çok satır olunca düzgün dursun
          animation: 'slideIn 0.3s ease-out'
        }}>
          {notificationResult.success ? (
            <CheckCircle size={24} color="#10B981" style={{ marginTop: '2px' }} />
          ) : (
            <AlertCircle size={24} color="#EF4444" style={{ marginTop: '2px' }} />
          )}
          
          <div style={{ flex: 1 }}>
            {/* Başlık */}
            <div style={{ 
              fontWeight: '700', 
              color: notificationResult.success ? '#065F46' : '#991B1B',
              marginBottom: '4px'
            }}>
              {notificationResult.success ? 'İşlem Başarılı' : 'Hata Oluştu'}
            </div>

            {/* Ana Mesaj */}
            <div style={{ 
              fontSize: '14px', 
              color: notificationResult.success ? '#047857' : '#B91C1C' 
            }}>
              {notificationResult.message}
            </div>

            {/* ✅ DETAYLAR: Eğer data varsa ve bildirim sayıları mevcutsa göster */}
            {notificationResult.success && notificationResult.data && (
              <div style={{ 
                marginTop: '8px', 
                paddingTop: '8px', 
                borderTop: '1px solid rgba(0,0,0,0.05)',
                fontSize: '13px', 
                color: '#4B5563',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}></span>
                  İlaç Bildirimi: <strong>{notificationResult.data.medicationNotifications || 0}</strong> adet
                </div>
    
                <div style={{ marginTop: '4px', fontWeight: '600', color: '#059669' }}>
                  👉 Toplam Gönderilen: {notificationResult.data.totalNotifications || 
                     ((notificationResult.data.medicationNotifications || 0) + (notificationResult.data.prescriptionNotifications || 0))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>Yükleniyor...</div>
        ) : medications.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
             <Pill size={48} color="#D1D5DB" style={{ marginBottom: '16px' }} />
             <div>Kayıt bulunamadı.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#6B7280' }}>HASTA</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#6B7280' }}>İLAÇ</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#6B7280' }}>DOZ</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#6B7280' }}>BAŞLANGIÇ</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#6B7280' }}>BİTİŞ</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#6B7280' }}>DURUM</th>
              </tr>
            </thead>
            <tbody>
              {medications.map((med) => (
                <tr key={med.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '16px', fontWeight: '600' }}>{med.patientName}</td>
                  <td style={{ padding: '16px' }}>{med.medicationName}</td>
                  <td style={{ padding: '16px' }}>{med.dosageAmount} {med.dosageUnit}</td>
                  <td style={{ padding: '16px' }}>{formatDate(med.startDate)}</td>
                  <td style={{ padding: '16px' }}>
                    <div>{formatDate(med.endDate)}</div>
                    {getDaysRemainingBadge(med.endDate)}
                  </td>
                  <td style={{ padding: '16px' }}>{getStatusBadge(med.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px',
            maxHeight: '90vh', overflow: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Yeni İlaç Takibi Oluştur</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#6B7280" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Hasta</label>
                  <select name="patientId" value={formData.patientId} onChange={handleInputChange} 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                    <option value="">Seçiniz</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>İlaç (Ürün)</label>
                  <select name="productId" value={formData.productId} onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                    <option value="">Seçiniz</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Doz Miktarı</label>
                  <input type="number" name="dosageAmount" value={formData.dosageAmount} onChange={handleInputChange}
                    placeholder="Ör: 1" step="0.5"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Birim</label>
                  <input type="text" name="dosageUnit" value={formData.dosageUnit} onChange={handleInputChange}
                    placeholder="mg, tablet, ml"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Başlangıç Tarihi</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Bitiş Tarihi</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Kullanım Sıklığı</label>
                  <select name="frequency" value={formData.frequency} onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                    <option value="ONCE_DAILY">Günde 1 Kez</option>
                    <option value="TWICE_DAILY">Günde 2 Kez</option>
                    <option value="THREE_TIMES_DAILY">Günde 3 Kez</option>
                    <option value="EVERY_8_HOURS">8 Saatte Bir</option>
                    <option value="EVERY_12_HOURS">12 Saatte Bir</option>
                    <option value="WEEKLY">Haftalık</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Uygulama Yolu</label>
                  <select name="administrationRoute" value={formData.administrationRoute} onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                    <option value="ORAL">Oral (Ağızdan)</option>
                    <option value="TOPICAL">Topikal (Deri üstü)</option>
                    <option value="PARENTERAL">Parenteral (İğne)</option>
                    <option value="INHALATION">İnhalasyon (Solunum)</option>
                  </select>
                </div>
              </div>

               <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Notlar / Talimatlar</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3"
                    placeholder="Tok karnına, sabahları vb."
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', fontFamily: 'inherit' }} />
                </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#F3F4F6', cursor: 'pointer', fontWeight: '600' }}>
                  İptal
                </button>
                <button type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#667eea', color: 'white', cursor: 'pointer', fontWeight: '600' }}>
                  Kaydet
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Medications;