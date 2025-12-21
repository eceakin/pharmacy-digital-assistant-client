import React from 'react';
import { Home, Users, Package, FileText, Bell, BarChart3, Settings, Pill } from 'lucide-react'; // ✅ Pill eklendi

const Sidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'patients', label: 'Hastalar', icon: Users },
    { id: 'medications', label: 'İlaç Takipleri', icon: Pill }, // ✅ YENİ MENÜ
    { id: 'inventory', label: 'Envanter', icon: Package },
    { id: 'prescriptions', label: 'Reçeteler', icon: FileText },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'reports', label: 'Raporlar', icon: BarChart3 },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  return (
    <div style={{
      width: '250px',
      background: 'linear-gradient(180deg, #5B21B6 0%, #6D28D9 100%)',
      height: '100vh',
      color: 'white',
      padding: '24px 0',
      position: 'fixed',
      left: 0,
      top: 0,
    }}>
      <div style={{ padding: '0 24px', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={24} />
          Eczane Asistan
        </h2>
      </div>
      
      <nav>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                width: '100%',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: 'none',
                borderLeft: isActive ? '4px solid white' : '4px solid transparent',
                color: 'white',
                cursor: 'pointer',
                fontSize: '15px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;