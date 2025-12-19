import React from 'react';
import { AlertTriangle } from 'lucide-react';

const AlertBox = ({ alerts, isLoading }) => {
  if (isLoading) {
    return (
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <p style={{ color: '#6B7280' }}>Uyarılar yükleniyor...</p>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <p style={{ color: '#10B981', fontWeight: '500' }}>✓ Acil uyarı bulunmamaktadır</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {alerts.map((alert, index) => (
        <div key={index} style={{
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}>
          <AlertTriangle size={24} color="#F59E0B" />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: '600', color: '#92400E', fontSize: '15px' }}>
              {alert.productName}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#78350F' }}>
              {alert.type === 'LOW_STOCK' 
                ? `Düşük Stok - Mevcut: ${alert.quantity} adet`
                : `SKT Yaklaşıyor - ${alert.expiryDate}`
              }
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertBox;