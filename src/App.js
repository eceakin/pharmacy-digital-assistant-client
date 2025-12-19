import React, { useState } from 'react';
import Sidebar from './components/common/Sidebar';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients'; // 1. YENİ: Dosyayı içeri aktardık

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div style={{ 
      display: 'flex', 
      background: '#F9FAFB', 
      minHeight: '100vh', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
    }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <div style={{ marginLeft: '250px', flex: 1 }}>
        
        {/* Sayfa Yönlendirmeleri */}
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'patients' && <Patients />} {/* 2. YENİ: Hastalar sayfasını buraya ekledik */}
        
        {/* Henüz yapılmayan sayfalar için yer tutucu */}
        {activePage !== 'dashboard' && activePage !== 'patients' && (
          <div style={{ padding: '32px' }}>
            <h1 style={{ color: '#111827' }}>
              {activePage === 'inventory' && 'Envanter Yönetimi'}
              {activePage === 'prescriptions' && 'Reçete Yönetimi'}
              {activePage === 'notifications' && 'Bildirimler'}
              {activePage === 'reports' && 'Raporlar'}
              {activePage === 'settings' && 'Ayarlar'}
            </h1>
            <p style={{ color: '#6B7280' }}>Bu sayfa henüz hazırlanmadı...</p>
          </div>
        )}

      </div>
    </div>
  );
}