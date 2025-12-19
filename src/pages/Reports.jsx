// src/pages/Reports.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  BarChart3, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Package, 
  Users 
} from 'lucide-react';
import { reportApi } from '../api/reportApi';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [topPatients, setTopPatients] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // 1. Tüm verileri paralel çekelim
      const [notifications, lowStocks, expiring] = await Promise.all([
        reportApi.getAllNotifications(),
        reportApi.getLowStockItems(),
        reportApi.getExpiringItems(90) // 3 aylık periyot
      ]);

      // 2. En çok bildirim alan hastaları hesapla
      const patientCounts = {};
      notifications.forEach(notif => {
        // Backend'den gelen 'patientName' alanını kullanıyoruz
        const name = notif.patientName || 'Bilinmeyen Hasta';
        patientCounts[name] = (patientCounts[name] || 0) + 1;
      });

      // Objeyi diziye çevir, sırala ve ilk 5'i al
      const rankedPatients = Object.entries(patientCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopPatients(rankedPatients);
      setLowStockItems(lowStocks);
      setExpiringItems(expiring);

    } catch (error) {
      console.error("Rapor verileri yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // Renk Paleti
  const COLORS = ['#5B21B6', '#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD'];

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>
        Veriler analiz ediliyor ve raporlar hazırlanıyor...
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
          Raporlar ve Analizler
        </h1>
        <p style={{ color: '#6B7280', marginTop: '8px' }}>
          Eczane operasyonlarınızın detaylı performans analizi
        </p>
      </div>

      {/* Grid Layout - 3 Ana Bölüm */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* BÖLÜM 1: En Çok İletişim Kurulan Hastalar (Grafik + Liste) */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: '#F3F4F6', padding: '10px', borderRadius: '8px' }}>
              <Users size={24} color="#5B21B6" />
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
              En Çok Bildirim Alan Hastalar
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Grafik Alanı */}
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPatients} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#5B21B6" name="Bildirim Sayısı" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Liste Alanı */}
            <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6B7280', textTransform: 'uppercase' }}>
                Sıralama
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topPatients.length === 0 ? (
                  <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Veri bulunamadı.</p>
                ) : (
                  topPatients.map((patient, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ 
                          width: '24px', height: '24px', 
                          background: index < 3 ? '#5B21B6' : '#E5E7EB', 
                          color: index < 3 ? 'white' : '#6B7280',
                          borderRadius: '50%', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </span>
                        <span style={{ fontWeight: '500', color: '#374151', fontSize: '14px' }}>{patient.name}</span>
                      </div>
                      <span style={{ fontWeight: 'bold', color: '#111827' }}>{patient.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* BÖLÜM 2: Düşük Stoklu İlaçlar */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: '#FFF7ED', padding: '10px', borderRadius: '8px' }}>
                <Package size={24} color="#F59E0B" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                  Düşük Stok Uyarıları
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Minimum seviyenin altındaki ürünler
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6B7280' }}>ÜRÜN</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', color: '#6B7280' }}>MEVCUT</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', color: '#6B7280' }}>MİN.</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.length === 0 ? (
                    <tr><td colSpan="3" style={{ padding: '16px', textAlign: 'center', color: '#9CA3AF' }}>Düşük stoklu ürün yok.</td></tr>
                  ) : (
                    lowStockItems.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                          {item.productName}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <span style={{ 
                            background: '#FFF7ED', color: '#C2410C', 
                            padding: '4px 12px', borderRadius: '12px', 
                            fontSize: '12px', fontWeight: 'bold' 
                          }}>
                            {item.quantity}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#6B7280' }}>
                          {item.minimumStockLevel}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* BÖLÜM 3: Miadı Yaklaşan İlaçlar */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: '#FEF2F2', padding: '10px', borderRadius: '8px' }}>
                <Calendar size={24} color="#EF4444" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                  SKT Yaklaşanlar
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Önümüzdeki 3 ay içinde süresi dolacaklar
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {expiringItems.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '16px' }}>Riskli ürün bulunmamaktadır.</div>
              ) : (
                expiringItems.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px', border: '1px solid #FEE2E2', borderRadius: '8px',
                    background: '#FEF2F2'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#991B1B', fontSize: '14px' }}>{item.productName}</div>
                      <div style={{ fontSize: '12px', color: '#B91C1C' }}>Parti: {item.batchNumber}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', color: '#DC2626', fontSize: '14px' }}>
                        {formatDate(item.expiryDate)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#EF4444', fontWeight: '500' }}>
                        {item.daysUntilExpiry} gün kaldı
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Reports;