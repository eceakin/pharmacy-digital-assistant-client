import React, { useState, useEffect } from 'react';
import { Package, Edit2, Trash2, Plus, Minus, X, AlertTriangle } from 'lucide-react';
import { inventoryApi } from '../api/inventoryApi';

const Inventory = () => {
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantityAction, setQuantityAction] = useState(null); // 'add' or 'deduct'
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    expiring: 0,
  });

  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    batchNumber: '',
    expiryDate: '',
    quantity: '',
    minimumStockLevel: '',
    storageLocation: '',
    notes: '',
  });

  // Quantity adjustment state
  const [quantityData, setQuantityData] = useState({
    quantity: '',
    reason: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadInventoryData();
    loadProducts();
  }, []);

  useEffect(() => {
    if (filterStatus === 'ALL') {
      loadInventoryData();
    } else {
      filterByStatus(filterStatus);
    }
  }, [filterStatus]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const [stocksData, totalCount, lowStockData, expiringData] = await Promise.all([
        inventoryApi.getStocksSummary(),
        inventoryApi.getTotalStockCount(),
        inventoryApi.getLowStocks(),
        inventoryApi.getExpiringStocks(90),
      ]);

      setStocks(stocksData);
      setStats({
        total: totalCount,
        lowStock: lowStockData.length,
        expiring: expiringData.length,
      });
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const productsData = await inventoryApi.getAllProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const filterByStatus = async (status) => {
    try {
      setLoading(true);
      const data = await inventoryApi.getStocksByStatus(status);
      setStocks(data);
    } catch (error) {
      console.error('Error filtering stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleQuantityInputChange = (e) => {
    const { name, value } = e.target;
    setQuantityData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productId) {
      newErrors.productId = 'Ürün seçilmelidir';
    }
    if (!formData.batchNumber.trim()) {
      newErrors.batchNumber = 'Parti numarası zorunludur';
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Son kullanma tarihi zorunludur';
    }
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Geçerli bir miktar giriniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const result = selectedStock
      ? await inventoryApi.updateStock(selectedStock.id, formData)
      : await inventoryApi.createStock(formData);

    if (result.success) {
      setShowModal(false);
      setSelectedStock(null);
      resetForm();
      loadInventoryData();
    } else {
      alert(result.message || 'Bir hata oluştu');
    }
  };

  const handleQuantitySubmit = async () => {
    if (!quantityData.quantity || quantityData.quantity <= 0) {
      alert('Geçerli bir miktar giriniz');
      return;
    }

    const result = quantityAction === 'add'
      ? await inventoryApi.addQuantity(selectedStock.id, quantityData.quantity, quantityData.reason)
      : await inventoryApi.deductQuantity(selectedStock.id, quantityData.quantity, quantityData.reason);

    if (result.success) {
      setShowQuantityModal(false);
      setSelectedStock(null);
      setQuantityData({ quantity: '', reason: '' });
      loadInventoryData();
    } else {
      alert('İşlem başarısız oldu');
    }
  };

  const handleEdit = (stock) => {
    setSelectedStock(stock);
    setFormData({
      productId: stock.productId,
      batchNumber: stock.batchNumber,
      expiryDate: stock.expiryDate ? stock.expiryDate.split('T')[0] : '', // Tarih formatını input için düzenle
      quantity: stock.quantity,
      minimumStockLevel: stock.minimumStockLevel || '',
      storageLocation: stock.storageLocation || '',
      notes: stock.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu stok kaydını silmek istediğinizden emin misiniz?')) {
      return;
    }

    const success = await inventoryApi.deleteStock(id);
    if (success) {
      loadInventoryData();
    } else {
      alert('Stok silinemedi');
    }
  };

  const openQuantityModal = (stock, action) => {
    setSelectedStock(stock);
    setQuantityAction(action);
    setQuantityData({ quantity: '', reason: '' });
    setShowQuantityModal(true);
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      batchNumber: '',
      expiryDate: '',
      quantity: '',
      minimumStockLevel: '',
      storageLocation: '',
      notes: '',
    });
    setErrors({});
  };

  const openAddModal = () => {
    setSelectedStock(null);
    resetForm();
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  const getStatusBadge = (stock) => {
    let status = 'Normal';
    let color = '#10B981'; // Green

    if (stock.status === 'EXPIRED' || stock.isExpired) {
      status = 'Süresi Dolmuş';
      color = '#EF4444'; // Red
    } else if (stock.status === 'NEAR_EXPIRY' || stock.isNearExpiry) {
      status = 'SKT Yakın';
      color = '#EF4444'; // Red
    } else if (stock.status === 'LOW_STOCK' || stock.isBelowMinimum) {
      status = 'Düşük';
      color = '#F59E0B'; // Orange
    } else if (stock.status === 'OUT_OF_STOCK' || stock.quantity === 0) {
      status = 'Tükendi';
      color = '#EF4444'; // Red
    }

    return (
      <span style={{
        background: color + '20',
        color: color,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
      }}>
        {status}
      </span>
    );
  };

  const getDaysUntilExpiryBadge = (daysUntilExpiry) => {
    if (daysUntilExpiry === null || daysUntilExpiry === undefined) return null;
    
    let color = '#6B7280'; // Gray
    if (daysUntilExpiry <= 0) {
      color = '#EF4444'; // Red - expired
    } else if (daysUntilExpiry <= 30) {
      color = '#EF4444'; // Red - critical
    } else if (daysUntilExpiry <= 90) {
      color = '#F59E0B'; // Orange - warning
    }

    return (
      <span style={{
        fontSize: '12px',
        color: color,
        fontWeight: '500',
      }}>
        ({daysUntilExpiry <= 0 ? 'Dolmuş' : `${daysUntilExpiry} gün`})
      </span>
    );
  };

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
      }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
          Envanter Yönetimi
        </h1>
        <button
          onClick={openAddModal}
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
            boxShadow: '0 4px 6px rgba(102, 126, 234, 0.25)',
          }}
        >
          <Package size={20} />
          Yeni Stok Ekle
        </button>
      </div>

      {/* Stats Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginBottom: '32px',
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
            Toplam Stok Kalemi
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>
            {loading ? '...' : stats.total}
          </p>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
            Düşük Stoklu
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#F59E0B' }}>
            {loading ? '...' : stats.lowStock}
          </p>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
            SKT Yaklaşan
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#EF4444' }}>
            {loading ? '...' : stats.expiring}
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{
        background: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px',
      }}>
        <button
          onClick={() => setFilterStatus('ALL')}
          style={{
            padding: '8px 16px',
            border: filterStatus === 'ALL' ? '2px solid #667eea' : '2px solid #E5E7EB',
            borderRadius: '8px',
            background: filterStatus === 'ALL' ? '#667eea20' : 'white',
            color: filterStatus === 'ALL' ? '#667eea' : '#6B7280',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Tümü
        </button>
        <button
          onClick={() => setFilterStatus('AVAILABLE')}
          style={{
            padding: '8px 16px',
            border: filterStatus === 'AVAILABLE' ? '2px solid #10B981' : '2px solid #E5E7EB',
            borderRadius: '8px',
            background: filterStatus === 'AVAILABLE' ? '#10B98120' : 'white',
            color: filterStatus === 'AVAILABLE' ? '#10B981' : '#6B7280',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Normal
        </button>
        <button
          onClick={() => setFilterStatus('LOW_STOCK')}
          style={{
            padding: '8px 16px',
            border: filterStatus === 'LOW_STOCK' ? '2px solid #F59E0B' : '2px solid #E5E7EB',
            borderRadius: '8px',
            background: filterStatus === 'LOW_STOCK' ? '#F59E0B20' : 'white',
            color: filterStatus === 'LOW_STOCK' ? '#F59E0B' : '#6B7280',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Düşük Stok
        </button>
        <button
          onClick={() => setFilterStatus('NEAR_EXPIRY')}
          style={{
            padding: '8px 16px',
            border: filterStatus === 'NEAR_EXPIRY' ? '2px solid #EF4444' : '2px solid #E5E7EB',
            borderRadius: '8px',
            background: filterStatus === 'NEAR_EXPIRY' ? '#EF444420' : 'white',
            color: filterStatus === 'NEAR_EXPIRY' ? '#EF4444' : '#6B7280',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          SKT Yaklaşan
        </button>
      </div>

      {/* Inventory Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
            Yükleniyor...
          </div>
        ) : stocks.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
            Stok kaydı bulunmamaktadır
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>
                  İlaç Adı
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>
                  Parti No
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>
                  Miktar
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>
                  Min. Seviye
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>
                  SKT
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>
                  Durum
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr key={stock.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    <div style={{ fontWeight: '600', color: '#111827' }}>
                      {stock.productName}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    {stock.batchNumber}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    <div style={{ fontWeight: '600' }}>{stock.quantity}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#6B7280' }}>
                    {stock.minimumStockLevel || '-'}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    <div>{formatDate(stock.expiryDate)}</div>
                    <div>{getDaysUntilExpiryBadge(stock.daysUntilExpiry)}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    {getStatusBadge(stock)}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => openQuantityModal(stock, 'add')}
                        style={{
                          background: '#10B98120',
                          color: '#10B981',
                          border: 'none',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                        }}
                        title="Stok Ekle"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => openQuantityModal(stock, 'deduct')}
                        style={{
                          background: '#F59E0B20',
                          color: '#F59E0B',
                          border: 'none',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                        }}
                        title="Stok Çıkış"
                      >
                        <Minus size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(stock)}
                        style={{
                          background: '#667eea20',
                          color: '#667eea',
                          border: 'none',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                        }}
                        title="Düzenle"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(stock.id)}
                        style={{
                          background: '#EF444420',
                          color: '#EF4444',
                          border: 'none',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                        }}
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Stock Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                {selectedStock ? 'Stok Düzenle' : 'Yeni Stok Ekle'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedStock(null);
                  resetForm();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#6B7280',
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Ürün <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleInputChange}
                    disabled={!!selectedStock}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `2px solid ${errors.productId ? '#EF4444' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  >
                    <option value="">Ürün Seçiniz</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  {errors.productId && <div style={{ marginTop: '4px', fontSize: '12px', color: '#EF4444' }}>{errors.productId}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Parti Numarası <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `2px solid ${errors.batchNumber ? '#EF4444' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  {errors.batchNumber && <div style={{ marginTop: '4px', fontSize: '12px', color: '#EF4444' }}>{errors.batchNumber}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Son Kullanma Tarihi <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `2px solid ${errors.expiryDate ? '#EF4444' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  {errors.expiryDate && <div style={{ marginTop: '4px', fontSize: '12px', color: '#EF4444' }}>{errors.expiryDate}</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Miktar <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="0"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${errors.quantity ? '#EF4444' : '#E5E7EB'}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                    {errors.quantity && <div style={{ marginTop: '4px', fontSize: '12px', color: '#EF4444' }}>{errors.quantity}</div>}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Minimum Seviye
                    </label>
                    <input
                      type="number"
                      name="minimumStockLevel"
                      value={formData.minimumStockLevel}
                      onChange={handleInputChange}
                      min="0"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Depo Konumu
                  </label>
                  <input
                    type="text"
                    name="storageLocation"
                    value={formData.storageLocation}
                    onChange={handleInputChange}
                    placeholder="Ör: Raf A-12"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Notlar
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Ek bilgiler..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid #E5E7EB'
              }}>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedStock(null);
                    resetForm();
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#F3F4F6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  İptal
                </button>
                <button
                  onClick={handleSubmit}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {selectedStock ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quantity Adjustment Modal */}
      {showQuantityModal && selectedStock && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                {quantityAction === 'add' ? 'Stok Ekle' : 'Stok Çıkış'}
              </h2>
              <button
                onClick={() => {
                  setShowQuantityModal(false);
                  setSelectedStock(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#6B7280',
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#374151' }}>
                  <strong>{selectedStock.productName}</strong> için miktar güncelleniyor.
                  <br />
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>
                    Mevcut Stok: {selectedStock.quantity}
                  </span>
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    {quantityAction === 'add' ? 'Eklenecek Miktar' : 'Çıkarılacak Miktar'} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={quantityData.quantity}
                    onChange={handleQuantityInputChange}
                    min="1"
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    İşlem Nedeni
                  </label>
                  <input
                    type="text"
                    name="reason"
                    value={quantityData.reason}
                    onChange={handleQuantityInputChange}
                    placeholder={quantityAction === 'add' ? 'Ör: Yeni parti girişi' : 'Ör: Satış, zayi, kullanım'}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowQuantityModal(false);
                    setSelectedStock(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#F3F4F6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  İptal
                </button>
                <button
                  onClick={handleQuantitySubmit}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: quantityAction === 'add' ? '#10B981' : '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {quantityAction === 'add' ? 'Ekle' : 'Çıkar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;