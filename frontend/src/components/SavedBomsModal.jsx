import { useState, useEffect } from 'react';
import { bomApi } from '../utils/api';
import ProductionLineView from './ProductionLineView';

export default function SavedBomsModal({ isOpen, onClose }) {
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBom, setSelectedBom] = useState(null);
  const [activeTab, setActiveTab] = useState('ebom');

  useEffect(() => {
    if (isOpen) {
      loadBoms();
    }
  }, [isOpen]);

  const loadBoms = async () => {
    setLoading(true);
    try {
      const response = await bomApi.getAll();
      setBoms(response.data || []);
    } catch (error) {
      console.error('Error loading BOMs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure you want to delete this BOM?')) return;
    
    try {
      await bomApi.delete(type, id);
      loadBoms();
    } catch (error) {
      console.error('Error deleting BOM:', error);
      alert('Failed to delete BOM');
    }
  };

  if (!isOpen) return null;

  if (selectedBom) {
    return (
      <ProductionLineView 
        bomType={selectedBom.type}
        bomId={selectedBom.id} 
        onClose={() => setSelectedBom(null)} 
      />
    );
  }

  const ebomList = boms.filter(bom => bom.type.toLowerCase() === 'ebom');
  const mbomList = boms.filter(bom => bom.type.toLowerCase() === 'mbom');
  const currentBoms = activeTab === 'ebom' ? ebomList : mbomList;

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div className="card" style={{ 
        width: '90%', 
        maxWidth: '800px', 
        maxHeight: '80vh', 
        overflow: 'auto',
        margin: '2rem',
      }}>
        <div className="card-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div className="card-title">Saved BOMs</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="card-content">
          {/* Tabs */}
          <div className="bom-tabs" style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            marginBottom: '1.5rem',
            borderBottom: '2px solid hsl(var(--border))'
          }}>
            <button
              className={`bom-tab ${activeTab === 'ebom' ? 'active' : ''}`}
              onClick={() => setActiveTab('ebom')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                fontSize: '0.9375rem',
                fontWeight: 600,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: activeTab === 'ebom' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                borderBottom: activeTab === 'ebom' ? '3px solid hsl(var(--primary))' : '3px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.2s',
              }}
            >
              📘 Engineering BOM ({ebomList.length})
            </button>
            <button
              className={`bom-tab ${activeTab === 'mbom' ? 'active' : ''}`}
              onClick={() => setActiveTab('mbom')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                fontSize: '0.9375rem',
                fontWeight: 600,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: activeTab === 'mbom' ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))',
                borderBottom: activeTab === 'mbom' ? '3px solid hsl(var(--accent))' : '3px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.2s',
              }}
            >
              🔧 Manufacturing BOM ({mbomList.length})
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : currentBoms.length === 0 ? (
            <p className="text-center" style={{ color: 'hsl(var(--muted-foreground))', padding: '2rem' }}>
              No saved {activeTab.toUpperCase()}s found. Convert and save a BOM to see it here.
            </p>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Items</th>
                    <th>Created Date</th>
                    <th>Created Time</th>
                    <th style={{ width: '180px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBoms.map((bom) => {
                    const { date, time } = formatDateTime(bom.createdAt);
                    return (
                      <tr key={bom.id}>
                        <td className="cell-medium">{bom.name}</td>
                        <td>
                          <span className={`badge ${bom.type.toLowerCase() === 'ebom' ? 'badge-primary' : 'badge-accent'}`}>
                            {bom.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="cell-center">{bom.totalParts || bom.items?.length || '-'}</td>
                        <td className="cell-sm cell-muted">{date}</td>
                        <td className="cell-sm cell-muted">{time}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => setSelectedBom({ id: bom.id, type: bom.type })}
                              title="View Production Lines"
                            >
                              📋 View
                            </button>
                            <button 
                              className="btn btn-ghost btn-sm" 
                              onClick={() => handleDelete(bom.type, bom.id)}
                              style={{ color: 'hsl(var(--destructive))' }}
                              title="Delete BOM"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
