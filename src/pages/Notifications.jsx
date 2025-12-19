
import React, { useState, useEffect } from 'react';
import { Bell, Filter, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { notificationApi } from '../api/notificationApi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ total: 0, successful: 0, failed: 0 });
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [filterStatus, filterType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allNotifications, countsData] = await Promise.all([
        notificationApi.getAll(),
        notificationApi.getCounts()
      ]);
      
      setNotifications(allNotifications);
      setCounts(countsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = async () => {
    if (filterStatus === 'ALL' && filterType === 'ALL') {
      const allData = await notificationApi.getAll();
      setNotifications(allData);
      return;
    }

    let filtered = await notificationApi.getAll();

    if (filterStatus !== 'ALL') {
      const statusData = await notificationApi.getByStatus(filterStatus);
      filtered = statusData;
    }

    if (filterType !== 'ALL') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    setNotifications(filtered);
  };

  const handleRetry = async (id) => {
    const success = await notificationApi.retry(id);
    if (success) {
      alert('Bildirim tekrar gönderildi');
      loadData();
    } else {
      alert('Bildirim gönderilemedi');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      SENT: { bg: '#10B98120', color: '#10B981', text: 'Gönderildi', icon: CheckCircle },
      DELIVERED: { bg: '#10B98120', color: '#10B981', text: 'İletildi', icon: CheckCircle },
      FAILED: { bg: '#EF444420', color: '#EF4444', text: 'Başarısız', icon: XCircle },
      PENDING: { bg: '#F59E0B20', color: '#F59E0B', text: 'Beklemede', icon: Clock },
      SCHEDULED: { bg: '#6B728020', color: '#6B7280', text: 'Planlandı', icon: Clock }
    };

    const { bg, color, text, icon: Icon } = config[status] || config.PENDING;

    return (
      <span style={{
        background: bg,
        color: color,
        padding: '6px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <Icon size={14} />
        {text}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const types = {
      MEDICATION_REMINDER: { text: 'İlaç Hatırlatması', icon: '💊' },
      MEDICATION_REFILL: { text: 'İlaç Yenileme', icon: '🔄' },
      MEDICATION_EXPIRY: { text: 'İlaç Bitim Hatırlatması', icon: '⏰' },
      PRESCRIPTION_EXPIRY: { text: 'Reçete Yenileme', icon: '📋' },
      PRESCRIPTION_RENEWAL: { text: 'Reçete Hatırlatması', icon: '📋' },
      STOCK_LOW: { text: 'Düşük Stok Uyarısı', icon: '📦' },
      STOCK_EXPIRY: { text: 'Stok SKT Uyarısı', icon: '⚠️' },
      GENERAL: { text: 'Genel Bilgilendirme', icon: 'ℹ️' }
    };

    const config = types[type] || types.GENERAL;

    return (
      <span style={{ fontSize: '14px', color: '#374151' }}>
        {config.icon} {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
          Bildirimler
        </h1>
        <button
          onClick={loadData}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 6px rgba(102, 126, 234, 0.25)'
          }}
        >
          <RefreshCw size={20} />
          Yenile
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '24px', 
        marginBottom: '32px' 
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Bell size={24} color="#667eea" />
            <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
              Toplam
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>
            {loading ? '...' : counts.total}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <CheckCircle size={24} color="#10B981" />
            <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
              Başarılı
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#10B981' }}>
            {loading ? '...' : counts.successful}
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <XCircle size={24} color="#EF4444" />
            <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
              Başarısız
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#EF4444' }}>
            {loading ? '...' : counts.failed}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center'
      }}>
        <Filter size={20} color="#6B7280" />
        
        <div style={{ flex: 1 }}>
          <label style={{ 
            display: 'block', 
            fontSize: '12px', 
            color: '#6B7280', 
            marginBottom: '4px',
            fontWeight: '600'
          }}>
            Durum
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">Tümü</option>
            <option value="SENT">Gönderildi</option>
            <option value="DELIVERED">İletildi</option>
            <option value="FAILED">Başarısız</option>
            <option value="PENDING">Beklemede</option>
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ 
            display: 'block', 
            fontSize: '12px', 
            color: '#6B7280', 
            marginBottom: '4px',
            fontWeight: '600'
          }}>
            Bildirim Tipi
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">Tümü</option>
            <option value="MEDICATION_REMINDER">İlaç Hatırlatması</option>
            <option value="MEDICATION_EXPIRY">İlaç Bitim Hatırlatması</option>
            <option value="PRESCRIPTION_EXPIRY">Reçete Yenileme</option>
            <option value="STOCK_LOW">Düşük Stok</option>
          </select>
        </div>
      </div>

      {/* Notifications Table */}
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
        ) : notifications.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
            Bildirim bulunamadı
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
                  Hasta Adı
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#6B7280', 
                  textTransform: 'uppercase' 
                }}>
                  Bildirim Tipi
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#6B7280', 
                  textTransform: 'uppercase' 
                }}>
                  Kanal
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#6B7280', 
                  textTransform: 'uppercase' 
                }}>
                  Tarih
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
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#6B7280', 
                  textTransform: 'uppercase' 
                }}>
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr 
                  key={notification.id}
                  style={{ borderBottom: '1px solid #E5E7EB' }}
                >
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    <div style={{ fontWeight: '600', color: '#111827' }}>
                      {notification.patientName || 'Sistem'}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    {getTypeBadge(notification.type)}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    {notification.channel === 'EMAIL' ? '📧 E-posta' : 
                     notification.channel === 'SMS' ? '📱 SMS' : '💻 Sistem'}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    {formatDate(notification.sentAt || notification.createdAt)}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    {getStatusBadge(notification.status)}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    {notification.status === 'FAILED' && (
                      <button
                        onClick={() => handleRetry(notification.id)}
                        style={{
                          background: '#667eea20',
                          color: '#667eea',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <RefreshCw size={14} />
                        Tekrar Gönder
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Notifications;