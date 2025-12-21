import React, { useState } from 'react';
import Sidebar from './components/common/Sidebar';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients'; // 1. YENİ: Dosyayı içeri aktardık
import Inventory from './pages/Inventory';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Prescriptions from './pages/Prescriptions';

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
        {activePage === 'inventory' && <Inventory />}
        {activePage === 'notifications' && <Notifications />}
        {activePage === 'reports' && <Reports />}
        {activePage === 'prescriptions' && <Prescriptions />}
        {/* Henüz yapılmayan sayfalar için yer tutucu */}
        {activePage !== 'dashboard' && activePage !== 'patients' 
        && activePage !== 'inventory' && 
        activePage !== 'notifications' &&
        activePage !== 'reports' &&
        activePage !== 'prescriptions' &&
        (
          <div style={{ padding: '32px' }}>
            <h1 style={{ color: '#111827' }}>
              {activePage === 'settings' && 'Ayarlar'}
            </h1>
            <p style={{ color: '#6B7280' }}>Bu sayfa henüz hazırlanmadı...</p>
          </div>
        )}


      </div>
    </div>
  );
}