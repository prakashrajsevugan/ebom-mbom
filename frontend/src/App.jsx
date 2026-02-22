import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SummarySection from './components/SummarySection';
import InputTab from './components/InputTab';
import TabsContainer from './components/TabsContainer';
import SavedBomsModal from './components/SavedBomsModal';
import { SAMPLE_EBOM } from './utils/sampleData';
import { convertToMBom } from './utils/bomConverter';
import { bomApi } from './utils/api';
import './styles/App.css';

function App() {
  const [ebomInput, setEbomInput] = useState('');
  const [result, setResult] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [savedBoms, setSavedBoms] = useState([]);
  const [showSavedModal, setShowSavedModal] = useState(false);

  const handleLoadSample = () => {
    setEbomInput(SAMPLE_EBOM);
    setResult(null);
  };

  const handleClear = () => {
    setEbomInput('');
    setResult(null);
    setActiveTab('input');
  };

  const handleConvert = () => {
    if (!ebomInput.trim()) return;
    setIsConverting(true);

    setTimeout(() => {
      const conversionResult = convertToMBom(ebomInput);
      setResult(conversionResult);
      setIsConverting(false);
      setActiveTab('mbom');
      
      // Auto-save to database after conversion
      handleSaveToDatabase(conversionResult);
    }, 500);
  };

  const handleSaveToDatabase = async (bomResult = result) => {
    if (!bomResult) return;

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const baseNameEbom = `EBOM_${timestamp}_${Date.now()}`;
      const baseNameMbom = `MBOM_${timestamp}_${Date.now()}`;
      
      // Save EBOM to database
      await bomApi.save(
        baseNameEbom,
        'ebom',
        bomResult,  // Pass the full result object
        {
          totalParts: bomResult.summary.totalParts,
          uniqueParts: bomResult.summary.uniqueParts,
        }
      );
      console.log('✅ EBOM saved to database successfully');

      // Save MBOM to database
      await bomApi.save(
        baseNameMbom,
        'mbom',
        bomResult,  // Pass the full result object
        bomResult.summary
      );
      console.log('✅ MBOM saved to database successfully');
      
      // Show success message to user
      alert('EBOM and MBOM saved to database successfully!');
    } catch (error) {
      console.error('❌ Failed to save BOM to database:', error);
      alert('Failed to save BOM to database. Check console for details.');
    }
  };

  const handleExport = () => {
    if (!result) return;
    
    let exportText = '=== Engineering Bill of Materials (eBOM) ===\n\n';
    exportText += 'Level\tPart Number\tPart Name\tQty\tCategory\n';
    result.ebom.forEach(row => {
      exportText += `${row.level}\t${row.partNumber}\t${row.partName}\t${row.quantity}\t${row.partCategory || ''}\n`;
    });
    exportText += '\n\n=== Manufacturing Bill of Materials (mBOM) ===\n\n';
    exportText += 'Level\tStation\tPart Number\tPart Name\tQty\tType\tMake/Buy\tProcess\n';
    result.mbom.forEach(row => {
      exportText += `${row.level}\t${row.station || '-'}\t${row.partNumber}\t${row.partName}\t${row.quantity}\t${row.itemType}\t${row.makeBuy}\t${row.process}\n`;
    });
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bom-export.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen blueprint-grid">
      <Header />
      
      <main className="main-content">
        <div className="converter-container">
          {/* Page Title */}
          <div className="page-title-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h1 className="page-title" style={{ margin: 0 }}>eBOM → mBOM Converter</h1>
              <button 
                className="btn-saved-boms"
                onClick={() => setShowSavedModal(true)}
              >
                <span className="btn-saved-boms-icon">📁</span>
                <span>View Saved BOMs</span>
              </button>
            </div>
            <p className="page-subtitle">
              Transform your Engineering Bill of Materials into a Manufacturing Bill of Materials.
              View as interactive tree or detailed table format.
            </p>
          </div>

          {/* Summary */}
          <SummarySection summary={result?.summary} />

          {/* Tabs */}
          {activeTab === 'input' ? (
            <InputTab 
              ebomInput={ebomInput}
              setEbomInput={setEbomInput}
              onLoadSample={handleLoadSample}
              onClear={handleClear}
              onConvert={handleConvert}
              isConverting={isConverting}
            />
          ) : null}

          <TabsContainer 
            result={result}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onExport={handleExport}
          />

          {/* Legend */}
          <div className="card card-dashed">
            <div className="card-content">
              <div className="legend-grid">
                <div>
                  <div className="legend-title">
                    <span className="legend-circle" style={{ backgroundColor: 'hsl(var(--primary))' }}>L0</span>
                    Level Indicators
                  </div>
                  <p className="legend-text">
                    L0 = Final Product, L1 = Systems, L2 = Sub-assemblies, L3 = Components
                  </p>
                </div>
                <div>
                  <div className="legend-title">
                    <span className="legend-circle" style={{ backgroundColor: 'hsl(var(--station-2))' }}>Stn</span>
                    Station Numbers
                  </div>
                  <p className="legend-text">
                    Auto-assigned by system: 10 (Frame), 20 (Wheels), 30 (Drivetrain), etc.
                  </p>
                </div>
                <div>
                  <div className="legend-title">
                    <span className="legend-circle" style={{ backgroundColor: 'hsl(var(--success))' }}>M</span>
                    Make vs Buy
                  </div>
                  <p className="legend-text">
                    Make = In-house production. Buy = Purchased components.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Saved BOMs Modal */}
      <SavedBomsModal 
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
      />
    </div>
  );
}

export default App;
