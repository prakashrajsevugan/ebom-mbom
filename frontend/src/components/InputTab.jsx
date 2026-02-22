import { Icons } from './Icons';
import { useRef } from 'react';
import * as XLSX from 'xlsx';

export default function InputTab({ 
  ebomInput, 
  setEbomInput, 
  onLoadSample, 
  onClear, 
  onConvert,
  isConverting 
}) {
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv') || file.type.includes('csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || 
                    file.type.includes('spreadsheet') || 
                    file.type.includes('excel');

    // Check if it's a supported file format
    if (!isCSV && !isExcel) {
      alert('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    const reader = new FileReader();
    
    if (isCSV) {
      // Handle CSV files
      reader.onload = (e) => {
        const text = e.target.result;
        setEbomInput(text);
      };
      reader.onerror = () => {
        alert('Error reading CSV file');
      };
      reader.readAsText(file);
    } else if (isExcel) {
      // Handle Excel files
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to CSV format
          const csvText = XLSX.utils.sheet_to_csv(worksheet);
          setEbomInput(csvText);
        } catch (error) {
          alert('Error parsing Excel file: ' + error.message);
        }
      };
      reader.onerror = () => {
        alert('Error reading Excel file');
      };
      reader.readAsArrayBuffer(file);
    }

    // Reset file input so the same file can be uploaded again
    event.target.value = '';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title" style={{ color: 'hsl(var(--foreground))' }}>
          <Icons.FileSpreadsheet />
          Input eBOM Data
        </div>
        <p className="card-description">
          Paste your eBOM data, or upload a CSV/Excel file. Format: S.No, Level, Parent Part No, Part No, Part Name, Part Description, Qty, UoM
        </p>
      </div>
      <div className="card-content">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        
        <textarea 
          id="ebom-textarea" 
          className="textarea" 
          value={ebomInput}
          onChange={(e) => setEbomInput(e.target.value)}
          placeholder="S.No,Level,Parent Part No,Part No,Part Name,Part Description,Qty,UoM
1,0,—,ASM-001,Product,Final Product,1,Nos
2,1,ASM-001,SYS-001,System,Sub-System,1,Nos
3,2,SYS-001,PRT-001,Part,Component,1,Nos
..."
        />

        <div className="buttons-row">
          <button className="btn btn-outline btn-sm" onClick={handleUploadClick}>
            <Icons.Upload />
            Upload File
          </button>
          
          <button className="btn btn-outline btn-sm" onClick={onLoadSample}>
            <Icons.Sparkles />
            Load Sample
          </button>

          <button 
            className="btn btn-ghost btn-sm" 
            onClick={onClear} 
            disabled={!ebomInput}
          >
            <Icons.RotateCcw />
            Clear
          </button>

          <button 
            className="btn btn-primary btn-min-w" 
            onClick={onConvert} 
            disabled={!ebomInput.trim() || isConverting}
          >
            {isConverting ? (
              <span className="animate-pulse-subtle">Converting...</span>
            ) : (
              <>
                Generate mBOM
                <Icons.ArrowRight />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
