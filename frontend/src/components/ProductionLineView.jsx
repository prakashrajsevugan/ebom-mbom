import { useState, useEffect } from 'react';
import { bomApi } from '../utils/api';

export default function ProductionLineView({ bomType, bomId, onClose }) {
  const [productionData, setProductionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductionData();
  }, [bomId, bomType]);

  const loadProductionData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bom/${bomType}/${bomId}/formatted?format=json`);
      const result = await response.json();
      if (result.success) {
        setProductionData(result.data);
      }
    } catch (error) {
      console.error('Error loading production data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    window.open(`http://localhost:5000/api/bom/${bomType}/${bomId}/formatted?format=csv`, '_blank');
  };

  const downloadTable = () => {
    window.open(`http://localhost:5000/api/bom/${bomType}/${bomId}/formatted?format=table`, '_blank');
  };

  if (loading) return <div className="card"><div className="card-content">Loading...</div></div>;
  if (!productionData) return null;

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
      padding: '2rem',
    }}>
      <div className="card" style={{ 
        width: '95%', 
        maxWidth: '1400px', 
        maxHeight: '90vh', 
        overflow: 'auto',
        margin: 0,
      }}>
        <div className="card-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: 'hsl(var(--card))',
          zIndex: 10,
          borderBottom: '1px solid hsl(var(--border))',
        }}>
          <div>
            <div className="card-title">Production Line View - {productionData.bomName}</div>
            <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
              {productionData.totalParts} parts • {productionData.totalStations} stations
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={downloadCSV}>
              Download CSV
            </button>
            <button className="btn btn-secondary btn-sm" onClick={downloadTable}>
              Download TXT
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
          </div>
        </div>
        
        <div className="card-content" style={{ padding: '1.5rem' }}>
          {productionData.productionLines.map((line, idx) => (
            <div key={idx} style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                color: 'hsl(var(--primary))',
                borderBottom: '2px solid hsl(var(--primary))',
                paddingBottom: '0.5rem',
              }}>
                {line.lineName.toUpperCase()}
              </h3>
              
              <div className="data-table-wrapper" style={{ marginBottom: '1rem' }}>
                <table className="data-table" style={{ fontSize: '0.875rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>Level</th>
                      <th style={{ width: '100px' }}>Parent</th>
                      <th style={{ width: '120px' }}>Part No</th>
                      <th>Part Name</th>
                      <th style={{ width: '60px' }}>Qty</th>
                      <th style={{ width: '100px' }}>Workstation No</th>
                      <th style={{ width: '150px' }}>Workstation Name</th>
                      <th style={{ width: '120px' }}>Operation</th>
                      <th style={{ width: '80px' }}>Time (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {line.items.map((item, itemIdx) => (
                      <tr key={itemIdx}>
                        <td className="cell-center">{item.level}</td>
                        <td className="cell-sm">{item.parent || '-'}</td>
                        <td className="cell-medium">{item.partNo}</td>
                        <td>{item.partName}</td>
                        <td className="cell-center">{item.qty}</td>
                        <td className="cell-sm">{item.workstationNo || '-'}</td>
                        <td className="cell-sm">{item.workstationName}</td>
                        <td className="cell-sm">{item.operation}</td>
                        <td className="cell-center">{item.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
