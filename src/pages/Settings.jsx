// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Bell, 
  Clock,
  AlertCircle,
  CheckCircle,
  Loader,
  Send
} from 'lucide-react';
import { settingsApi } from '../api/settingsApi';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    medicationExpiryWarningDays: 3,
    prescriptionExpiryWarningDays: 7,
    stockExpiryWarningDays: 90,
    notificationTime: '09:00',
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    pharmacyName: '',
    pharmacyPhone: '',
    pharmacyEmail: '',
    pharmacyAddress: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const settings = await settingsApi.getSettings();
      if (settings) {
        setFormData({
          medicationExpiryWarningDays: settings.medicationExpiryWarningDays || 3,
          prescriptionExpiryWarningDays: settings.prescriptionExpiryWarningDays || 7,
          stockExpiryWarningDays: settings.stockExpiryWarningDays || 90,
          notificationTime: settings.notificationTime || '09:00',
          emailNotificationsEnabled: settings.emailNotificationsEnabled ?? true,
          smsNotificationsEnabled: settings.smsNotificationsEnabled ?? false,
          pharmacyName: settings.pharmacyName || '',
          pharmacyPhone: settings.pharmacyPhone || '',
          pharmacyEmail: settings.pharmacyEmail || '',
          pharmacyAddress: settings.pharmacyAddress || ''
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('error', 'Ayarlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await settingsApi.updateSettings(formData);
      if (result.success) {
        showMessage('success', 'Ayarlar başarıyla kaydedildi! ✅');
        loadSettings(); // Refresh to get updated data
      } else {
        showMessage('error', result.message || 'Ayarlar kaydedilemedi');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'Ayarlar kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Tüm ayarlar varsayılan değerlere sıfırlanacak. Emin misiniz?')) {
      return;
    }

    setSaving(true);
    try {
      const result = await settingsApi.resetSettings();
      if (result.success) {
        showMessage('success', 'Ayarlar varsayılana sıfırlandı');
        loadSettings();
      } else {
        showMessage('error', 'Ayarlar sıfırlanamadı');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      showMessage('error', 'Ayarlar sıfırlanamadı');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotifications = async () => {
    setTesting(true);
    try {
      const result = await settingsApi.testNotifications();
      if (result.success && result.data) {
        const total = result.data.totalNotifications || 0;
        if (total > 0) {
          showMessage('success', `✅ ${total} bildirim gönderildi!`);
        } else {
          showMessage('info', 'ℹ️ Gönderilecek bildirim bulunamadı');
        }
      } else {
        showMessage('error', result.message || 'Test başarısız oldu');
      }
    } catch (error) {
      console.error('Error testing notifications:', error);
      showMessage('error', 'Bildirim testi başarısız oldu');
    } finally {
      setTesting(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '32px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader size={48} color="#667eea" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', color: '#6B7280' }}>Ayarlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <SettingsIcon size={32} color="#5B21B6" />
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
            Sistem Ayarları
          </h1>
        </div>
        <p style={{ color: '#6B7280', marginTop: '8px' }}>
          Bildirim ayarlarını ve eczane bilgilerini yönetin
        </p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div style={{
          background: message.type === 'success' ? '#ECFDF5' : 
                     message.type === 'error' ? '#FEF2F2' : '#EFF6FF',
          border: `2px solid ${message.type === 'success' ? '#10B981' : 
                              message.type === 'error' ? '#EF4444' : '#3B82F6'}`,
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {message.type === 'success' ? <CheckCircle size={20} color="#10B981" /> :
           message.type === 'error' ? <AlertCircle size={20} color="#EF4444" /> :
           <AlertCircle size={20} color="#3B82F6" />}
          <span style={{ 
            color: message.type === 'success' ? '#065F46' : 
                   message.type === 'error' ? '#991B1B' : '#1E40AF',
            fontWeight: '500'
          }}>
            {message.text}
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Left Column: Notification Settings */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: '#F3F4F6', padding: '10px', borderRadius: '8px' }}>
              <Bell size={24} color="#5B21B6" />
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
              Bildirim Ayarları
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Medication Expiry Warning */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151' 
              }}>
                💊 İlaç Bitim Uyarısı (Gün)
              </label>
              <input
                type="number"
                name="medicationExpiryWarningDays"
                value={formData.medicationExpiryWarningDays}
                onChange={handleInputChange}
                min="1"
                max="30"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <p style={{ 
                margin: '6px 0 0 0', 
                fontSize: '12px', 
                color: '#6B7280' 
              }}>
                İlaç bitmeden kaç gün önce hatırlatma yapılsın
              </p>
            </div>

            {/* Prescription Expiry Warning */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151' 
              }}>
                📋 Reçete Bitiş Uyarısı (Gün)
              </label>
              <input
                type="number"
                name="prescriptionExpiryWarningDays"
                value={formData.prescriptionExpiryWarningDays}
                onChange={handleInputChange}
                min="1"
                max="30"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <p style={{ 
                margin: '6px 0 0 0', 
                fontSize: '12px', 
                color: '#6B7280' 
              }}>
                Reçete süres dolmadan kaç gün önce hatırlatma yapılsın
              </p>
            </div>

            {/* Stock Expiry Warning */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151' 
              }}>
                📦 Stok SKT Uyarısı (Gün)
              </label>
              <input
                type="number"
                name="stockExpiryWarningDays"
                value={formData.stockExpiryWarningDays}
                onChange={handleInputChange}
                min="30"
                max="365"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <p style={{ 
                margin: '6px 0 0 0', 
                fontSize: '12px', 
                color: '#6B7280' 
              }}>
                Stok SKT'si dolmadan kaç gün önce uyarı verilsin
              </p>
            </div>

            {/* Notification Time */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151' 
              }}>
                🕐 Bildirim Saati
              </label>
              <input
                type="time"
                name="notificationTime"
                value={formData.notificationTime}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <p style={{ 
                margin: '6px 0 0 0', 
                fontSize: '12px', 
                color: '#6B7280' 
              }}>
                Otomatik bildirimler günde bir kez bu saatte gönderilir
              </p>
            </div>

            {/* Notification Channels */}
            <div style={{ 
              borderTop: '1px solid #E5E7EB', 
              paddingTop: '20px',
              marginTop: '8px'
            }}>
              <h3 style={{ 
                margin: '0 0 16px 0', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#6B7280',
                textTransform: 'uppercase'
              }}>
                Bildirim Kanalları
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  background: formData.emailNotificationsEnabled ? '#F3F4F6' : 'transparent'
                }}>
                  <input
                    type="checkbox"
                    name="emailNotificationsEnabled"
                    checked={formData.emailNotificationsEnabled}
                    onChange={handleInputChange}
                    style={{ 
                      width: '18px', 
                      height: '18px', 
                      cursor: 'pointer' 
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                    📧 E-posta Bildirimleri
                  </span>
                </label>

                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  background: formData.smsNotificationsEnabled ? '#F3F4F6' : 'transparent'
                }}>
                  <input
                    type="checkbox"
                    name="smsNotificationsEnabled"
                    checked={formData.smsNotificationsEnabled}
                    onChange={handleInputChange}
                    style={{ 
                      width: '18px', 
                      height: '18px', 
                      cursor: 'pointer' 
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                    📱 SMS Bildirimleri
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pharmacy Info */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: '#F3F4F6', padding: '10px', borderRadius: '8px' }}>
              <SettingsIcon size={24} color="#5B21B6" />
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
              Eczane Bilgileri
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151' 
              }}>
                Eczane Adı
              </label>
              <input
                type="text"
                name="pharmacyName"
                value={formData.pharmacyName}
                onChange={handleInputChange}
                placeholder="Örnek Eczanesi"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151' 
              }}>
                Telefon
              </label>
              <input
                type="tel"
                name="pharmacyPhone"
                value={formData.pharmacyPhone}
                onChange={handleInputChange}
                placeholder="+90 555 123 4567"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151' 
              }}>
                E-posta
              </label>
              <input
                type="email"
                name="pharmacyEmail"
                value={formData.pharmacyEmail}
                onChange={handleInputChange}
                placeholder="info@eczane.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151' 
              }}>
                Adres
              </label>
              <textarea
                name="pharmacyAddress"
                value={formData.pharmacyAddress}
                onChange={handleInputChange}
                rows="4"
                placeholder="Eczane adresi..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Test Notifications Button */}
            <div style={{ 
              borderTop: '1px solid #E5E7EB', 
              paddingTop: '20px',
              marginTop: '8px'
            }}>
              <button
                onClick={handleTestNotifications}
                disabled={testing}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: testing ? '#9CA3AF' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: testing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 6px rgba(16, 185, 129, 0.25)'
                }}
              >
                {testing ? (
                  <>
                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Test Ediliyor...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Bildirimleri Şimdi Test Et
                  </>
                )}
              </button>
              <p style={{ 
                margin: '8px 0 0 0', 
                fontSize: '12px', 
                color: '#6B7280',
                textAlign: 'center'
              }}>
                Mevcut ayarlara göre bildirimleri manuel olarak tetikler
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        marginTop: '32px',
        display: 'flex',
        gap: '16px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={handleReset}
          disabled={saving}
          style={{
            padding: '14px 28px',
            background: '#F3F4F6',
            color: '#374151',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <RefreshCw size={18} />
          Varsayılana Sıfırla
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '14px 32px',
            background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 6px rgba(102, 126, 234, 0.25)'
          }}
        >
          {saving ? (
            <>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save size={18} />
              Ayarları Kaydet
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Add keyframe animation for spinner
const style = document.createElement('style');
style.innerHTML = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default Settings;