import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color, isLoading }) => (
  <div style={{
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
          {title}
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>
          {isLoading ? '...' : value}
        </p>
      </div>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: `${color}20`, // Hex rengine şeffaflık ekler
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={24} color={color} />
      </div>
    </div>
  </div>
);

export default StatsCard;