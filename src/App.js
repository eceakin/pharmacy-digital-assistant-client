import React, { useState } from 'react';
import Sidebar from './components/common/Sidebar';
import Dashboard from './pages/Dashboard.jsx';
// Diğer sayfalar hazırlandıkça buraya import edilecek
// import Patients from './pages/Patients'; vb.

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
        {activePage === 'dashboard' && <Dashboard />}
        
        {/* Diğer sayfalar için placeholder (yer tutucu) */}
        {activePage !== 'dashboard' && (
          <div style={{ padding: '32px' }}>
            <h1 style={{ color: '#111827' }}>
              {activePage === 'patients' && 'Hasta Yönetimi'}
              {activePage === 'inventory' && 'Envanter Yönetimi'}
              {activePage === 'prescriptions' && 'Reçete Yönetimi'}
              {activePage === 'notifications' && 'Bildirimler'}
              {activePage === 'reports' && 'Raporlar'}
              {activePage === 'settings' && 'Ayarlar'}
            </h1>
            <p style={{ color: '#6B7280' }}>Bu sayfa yakında geliştirilecek...</p>
          </div>
        )}
      </div>
    </div>
  );
}