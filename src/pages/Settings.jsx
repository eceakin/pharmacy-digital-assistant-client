import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RefreshCw, 
  Bell, 
  AlertCircle,
  CheckCircle,
  Loader,
  Send
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Sadece bildirim ayarlarını tutuyoruz
  const [formData, setFormData] = useState({
    medicationExpiryWarningDays: 3,
    prescriptionExpiryWarningDays: 7,
    stockExpiryWarningDays: 90,
    notificationTime: '09:00',
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      const data = await response.json();
      
      if (data.data) {
        setFormData({
          medicationExpiryWarningDays: data.data.medicationExpiryWarningDays || 3,
          prescriptionExpiryWarningDays: data.data.prescriptionExpiryWarningDays || 7,
          stockExpiryWarningDays: data.data.stockExpiryWarningDays || 90,
          notificationTime: data.data.notificationTime || '09:00',
          emailNotificationsEnabled: data.data.emailNotificationsEnabled ?? true,
          smsNotificationsEnabled: data.data.smsNotificationsEnabled ?? false
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
      // Backend tarafında pharmacy alanları entity'de olabilir ama null gönderirsek 
      // backend (eğer @DynamicUpdate yoksa veya null check varsa) sorun çıkarmaz.
      // Mevcut entity yapısını bozmamak için sadece bu alanları gönderiyoruz.
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showMessage('success', 'Ayarlar başarıyla kaydedildi! ✅');
        loadSettings();
      } else {
        showMessage('error', data.message || 'Ayarlar kaydedilemedi');
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
      const response = await fetch(`${API_BASE_URL}/settings/reset`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
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
      const response = await fetch(`${API_BASE_URL}/demo/check-all`);
      const data = await response.json();
      
      if (response.ok && data.data) {
        const total = data.data.totalNotifications || 0;
        if (total > 0) {
          showMessage('success', `✅ ${total} bildirim gönderildi!`);
        } else {
          showMessage('info', 'ℹ️ Gönderilecek bildirim bulunamadı');
        }
      } else {
        showMessage('error', data.message || 'Test başarısız oldu');
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
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}> {/* maxWidth ekledik */}
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
          ⚙️ Sistem Ayarları
        </h1>
        <p style={{ color: '#6B7280', marginTop: '8px' }}>
          Bildirim sürelerini ve gönderim tercihlerini yönetin
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
          gap: '12px',
          animation: 'slideIn 0.3s ease-out'
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

      {/* Main Settings Panel */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #F3F4F6', paddingBottom: '16px' }}>
          <div style={{ background: '#EEF2FF', padding: '10px', borderRadius: '8px' }}>
            <Bell size={24} color="#667eea" />
          </div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
            Otomatik Bildirim Yapılandırması
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Sol Kolon: Gün Ayarları */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Medication Expiry */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                💊 İlaç Bitim Uyarısı (Gün)
              </label>
              <input
                type="number"
                name="medicationExpiryWarningDays"
                value={formData.medicationExpiryWarningDays}
                onChange={handleInputChange}
                min="1" max="30"
                style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
              />
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280' }}>İlaç bitmeden kaç gün önce uyarılsın</p>
            </div>

            {/* Prescription Expiry */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                📋 Reçete Bitiş Uyarısı (Gün)
              </label>
              <input
                type="number"
                name="prescriptionExpiryWarningDays"
                value={formData.prescriptionExpiryWarningDays}
                onChange={handleInputChange}
                min="1" max="30"
                style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
              />
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280' }}>Reçete süresi dolmadan kaç gün önce</p>
            </div>

            {/* Stock Expiry */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                📦 Stok SKT Uyarısı (Gün)
              </label>
              <input
                type="number"
                name="stockExpiryWarningDays"
                value={formData.stockExpiryWarningDays}
                onChange={handleInputChange}
                min="30" max="365"
                style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
              />
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280' }}>SKT dolmadan kaç gün önce</p>
            </div>

          </div>

          {/* Sağ Kolon: Zaman ve Kanallar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Notification Time */}
            <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '8px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                🕐 Bildirim Gönderim Saati
              </label>
              <input
                type="time"
                name="notificationTime"
                value={formData.notificationTime}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
              />
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280' }}>Otomatik mailler her gün bu saatte gönderilir</p>
            </div>

            {/* Channels */}
            <div>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Aktif Bildirim Kanalları
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '8px', border: formData.emailNotificationsEnabled ? '2px solid #667eea' : '2px solid #E5E7EB', background: formData.emailNotificationsEnabled ? '#EEF2FF' : 'white', transition: 'all 0.2s' }}>
                  <input
                    type="checkbox"
                    name="emailNotificationsEnabled"
                    checked={formData.emailNotificationsEnabled}
                    onChange={handleInputChange}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>📧 E-posta Bildirimleri</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '8px', border: formData.smsNotificationsEnabled ? '2px solid #667eea' : '2px solid #E5E7EB', background: formData.smsNotificationsEnabled ? '#EEF2FF' : 'white', transition: 'all 0.2s' }}>
                  <input
                    type="checkbox"
                    name="smsNotificationsEnabled"
                    checked={formData.smsNotificationsEnabled}
                    onChange={handleInputChange}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>📱 SMS Bildirimleri</span>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* Test Section */}
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>Sistemi Test Et</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
                Mevcut ayarlara göre bekleyen bildirimleri anında tetikler ve sonuçları gösterir.
              </p>
            </div>
            <button
              onClick={handleTestNotifications}
              disabled={testing}
              style={{
                padding: '10px 20px',
                background: testing ? '#9CA3AF' : '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: testing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
              }}
            >
              {testing ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
              {testing ? 'Test Ediliyor...' : 'Şimdi Test Et'}
            </button>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
        <button
          onClick={handleReset}
          disabled={saving}
          style={{
            padding: '14px 28px',
            background: 'white',
            color: '#374151',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <RefreshCw size={18} />
          Varsayılana Dön
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
            boxShadow: '0 4px 6px rgba(102, 126, 234, 0.25)',
            transition: 'all 0.2s'
          }}
        >
          {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Settings;