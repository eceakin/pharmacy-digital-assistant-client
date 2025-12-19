import React, { useState, useEffect } from 'react';
import { Users, Package, FileText, Bell } from 'lucide-react';
import { api } from '../api/axiosConfig'; // 1. adımda oluşturduğumuz api
import StatsCard from '../components/common/StatsCard'; // 2. adımda oluşturduğumuz componentler
import AlertBox from '../components/common/AlertBox';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePrescriptions: 0,
    lowStock: 0,
    sentNotifications: 0,
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    
    // İstatistikleri çek
    const [patients, prescriptions, lowStockItems, notifications] = await Promise.all([
      api.get('/patients/count'),
      api.get('/prescriptions/count'),
      api.get('/stocks/alerts/low'),
      api.get('/notifications/count'),
    ]);

    setStats({
      totalPatients: patients || 0,
      activePrescriptions: prescriptions || 0,
      lowStock: lowStockItems ? lowStockItems.length : 0, // Dizi uzunluğunu alıyoruz
      sentNotifications: notifications || 0,
    });

    // Uyarıları çek
    const [lowStock, expiringStock] = await Promise.all([
      api.get('/stocks/alerts/low'),
      api.get('/stocks/alerts/expiring?days=30'),
    ]);

    const allAlerts = [
      ...(lowStock || []).map(item => ({
        productName: item.productName,
        type: 'LOW_STOCK',
        quantity: item.quantity,
      })),
      ...(expiringStock || []).slice(0, 3).map(item => ({
        productName: item.productName,
        type: 'EXPIRING',
        expiryDate: new Date(item.expiryDate).toLocaleDateString('tr-TR'),
      })),
    ];

    setAlerts(allAlerts.slice(0, 5));
    setLoading(false);
  };

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ margin: '0 0 32px 0', fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
        Dashboard
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <StatsCard title="Toplam Hasta" value={stats.totalPatients} icon={Users} color="#5B21B6" isLoading={loading} />
        <StatsCard title="Aktif Reçeteler" value={stats.activePrescriptions} icon={FileText} color="#10B981" isLoading={loading} />
        <StatsCard title="Düşük Stok" value={stats.lowStock} icon={Package} color="#F59E0B" isLoading={loading} />
        <StatsCard title="Gönderilen Bildirimler" value={stats.sentNotifications} icon={Bell} color="#6D28D9" isLoading={loading} />
      </div>

      <div>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600', color: '#111827' }}>
          Acil Uyarılar
        </h2>
        <AlertBox alerts={alerts} isLoading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;