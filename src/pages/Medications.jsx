// src/pages/Medications.jsx
import React, { useState, useEffect } from 'react';
import { Pill, Calendar, User, AlertCircle, RefreshCw, Send, Clock, CheckCircle } from 'lucide-react';
import { medicationApi } from '../api/medicationApi';

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingNotifications, setCheckingNotifications] = useState(false);
  const [notificationResult, setNotificationResult] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    loadMedications();
  }, [filterStatus]);

  const loadMedications = async () => {
    setLoading(true);
    try {
      const data = filterStatus === 'ALL' 
        ? await medicationApi.getAllMedications()
        : await medicationApi.getMedicationsByStatus(filterStatus);
      
      console.log('Loaded medications:', data);
      setMedications(data);
    } catch (error) {
      console.error('Medication loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckNotifications = async () => {
    setCheckingNotifications(true);
    setNotificationResult(null);

    try {
      const result = await medicationApi.checkMedicationNotifications();
      setNotificationResult(result);
      
      // 5 saniye sonra mesajı kaldır
      setTimeout(() => {
        setNotificationResult(null);
      }, 5000);

      // Listeyi yenile
      loadMedications();
    } catch (error) {
      console.error('Notification check error:', error);
      setNotificationResult({
        success: false,
        message: 'Bildirim kontrolü başarısız oldu'
      });
    } finally {
      setCheckingNotifications(false);
    }
  };

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
        background: style.bg,
        color: style.color,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <Icon size={14} />
        {style.text}
      </span>
    );
  };

  const getFrequencyText = (frequency) => {
    const frequencies = {
      ONCE_DAILY: '☀️ Günde 1 kez',
      TWICE_DAILY: '🌓 Günde 2 kez',
      THREE_TIMES_DAILY: '☀️🌓🌙 Günde 3 kez',
      FOUR_TIMES_DAILY: '⏰ Günde 4 kez',
      EVERY_8_HOURS: '⏱️ Her 8 saatte',
      EVERY_12_HOURS: '⏱️ Her 12 saatte',
      AS_NEEDED: '💊 Gerektiğinde',
      WEEKLY: '📅 Haftada 1',
      MONTHLY: '📆 Ayda 1'
    };
    return frequencies[frequency] || frequency;
  };

  const getRemainingDaysColor = (daysRemaining) => {
    if (daysRemaining <= 3) return '#EF4444'; // Red - ACİL
    if (daysRemaining <= 7) return '#F59E0B'; // Orange - Dikkat
    return '#10B981'; // Green - Normal
  };

  const getDaysRemainingBadge = (endDate) => {
    if (!endDate) return null;
    
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span style={{
          background: '#FEE2E2',
          color: '#991B1B',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '700',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <AlertCircle size={14} />
          Dolmuş
        </span>
      );
    }

    const color = getRemainingDaysColor(diffDays);
    
    return (
      <span style={{
        background: `${color}20`,
        color: color,
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '700',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <Clock size={14} />
        {diffDays} gün kaldı
      </span>
    );
  };

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Pill size={32} color="#5B21B6" />
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
              İlaç Takipleri
            </h1>
          </div>
          <p style={{ color: '#6B7280', marginTop: '4px' }}>
            Hastaların düzenli kullandığı ilaçlar
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={loadMedications}
            style={{
              background: '#F3F4F6',
              color: '#374151',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <RefreshCw size={18} />
            Yenile
          </button>
          <button
            onClick={handleCheckNotifications}
            disabled={checkingNotifications}
            style={{
              background: checkingNotifications 
                ? '#9CA3AF' 
                : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: checkingNotifications ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 6px rgba(16, 185, 129, 0.25)'
            }}
          >
            {checkingNotifications ? (
              <>
                <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Kontrol Ediliyor...
              </>
            ) : (
              <>
                <Send size={18} />
                İlaç Bildirimlerini Kontrol Et
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification Result Alert */}
      {notificationResult && (
        <div style={{
          background: notificationResult.success ? '#ECFDF5' : '#FEF2F2',
          border: `2px solid ${notificationResult.success ? '#10B981' : '#EF4444'}`,
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {notificationResult.success ? (
            <CheckCircle size={24} color="#10B981" />
          ) : (
            <AlertCircle size={24} color="#EF4444" />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: '600', 
              color: notificationResult.success ? '#065F46' : '#991B1B',
              marginBottom: '4px'
            }}>
              {notificationResult.success ? '✅ Başarılı!' : '❌ Hata'}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: notificationResult.success ? '#047857' : '#B91C1C' 
            }}>
              {notificationResult.message}
            </div>
            {notificationResult.data && (
              <div style={{ 
                fontSize: '13px', 
                color: '#6B7280',
                marginTop: '6px'
              }}>
                📊 Kontrol edilen süre: {notificationResult.data.checkedDaysAhead} gün | 
                📧 Gönderilen bildirim: {notificationResult.data.notificationsSent}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{
        background: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px'
      }}>
        {['ALL', 'ACTIVE', 'DISCONTINUED', 'ON_HOLD', 'COMPLETED'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '8px 16px',
              border: filterStatus === status ? '2px solid #5B21B6' : '2px solid #E5E7EB',
              borderRadius: '8px',
              background: filterStatus === status ? '#5B21B620' : 'white',
              color: filterStatus === status ? '#5B21B6' : '#6B7280',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            {status === 'ALL' ? 'Tümü' : 
             status === 'ACTIVE' ? 'Aktif' :
             status === 'DISCONTINUED' ? 'Kesildi' :
             status === 'ON_HOLD' ? 'Askıda' : 'Tamamlandı'}
          </button>
        ))}
      </div>

      {/* Medications Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
            Yükleniyor...
          </div>
        ) : medications.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
            <Pill size={48} color="#D1D5DB" style={{ marginBottom: '16px' }} />
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              İlaç kaydı bulunamadı
            </div>
            <div style={{ fontSize: '14px' }}>
              {filterStatus !== 'ALL' ? 'Filtreyi değiştirerek tekrar deneyin' : 'Henüz ilaç kaydı eklenmemiş'}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#6B7280', 
                  textTransform: 'uppercase' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} />
                    Hasta
                  </div>
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#6B7280', 
                  textTransform: 'uppercase' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Pill size={14} />
                    İlaç Adı
                  </div>
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#6B7280', 
                  textTransform: 'uppercase' 
                }}>
                  Doz & Sıklık
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#6B7280', 
                  textTransform: 'uppercase' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    Başlangıç
                  </div>
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#6B7280', 
                  textTransform: 'uppercase' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    Bitiş
                  </div>
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#6B7280', 
                  textTransform: 'uppercase' 
                }}>
                  Kalan Süre
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#6B7280', 
                  textTransform: 'uppercase' 
                }}>
                  Durum
                </th>
              </tr>
            </thead>
            <tbody>
              {medications.map((med) => (
                <tr 
                  key={med.id}
                  style={{ borderBottom: '1px solid #F3F4F6' }}
                >
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>
                      {med.patientName || 'Hasta Bilgisi Yok'}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                      {med.medicationName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                      {med.productName || '-'}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    <div style={{ fontWeight: '600', color: '#5B21B6' }}>
                      {med.dosageAmount} {med.dosageUnit}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                      {getFrequencyText(med.frequency)}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#6B7280' }}>
                    {formatDate(med.startDate)}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#6B7280' }}>
                    {formatDate(med.endDate)}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {getDaysRemainingBadge(med.endDate)}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {getStatusBadge(med.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info Box */}
      <div style={{
        background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '24px',
        border: '2px solid #C7D2FE'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <AlertCircle size={20} color="#5B21B6" style={{ marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: '600', color: '#4C1D95', marginBottom: '8px' }}>
              💡 İlaç Bildirimleri Nasıl Çalışır?
            </div>
            <div style={{ fontSize: '14px', color: '#5B21B6', lineHeight: '1.6' }}>
              <strong>"İlaç Bildirimlerini Kontrol Et"</strong> butonuna bastığınızda sistem:
              <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
                <li>Bitiş tarihi yaklaşan (3 gün içinde) aktif ilaçları tarar</li>
                <li>Bu hastaların email adreslerine hatırlatma maili gönderir</li>
                <li>Gönderilen bildirimleri kayıt altına alır</li>
                <li>Sonuçları size rapor olarak sunar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Medications;