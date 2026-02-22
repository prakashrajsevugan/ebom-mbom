import { useState } from 'react';
import { Icons } from './Icons';
import TreeNode from './TreeNode';
import EBomTable from './EBomTable';
import MBomTable from './MBomTable';

export default function TabsContainer({ result, activeTab, setActiveTab, onExport }) {
  const [ebomViewMode, setEbomViewMode] = useState('tree');
  const [mbomViewMode, setMbomViewMode] = useState('tree');

  const hasResult = !!result;

  return (
    <div className="tabs-container">
      {/* Tab Header Row */}
      <div className="tabs-header">
        <div className="tabs-list">
          <button 
            className={`tab-trigger ${activeTab === 'input' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('input')}
          >
            <Icons.ClipboardPaste />
            Input
          </button>
          <button 
            className={`tab-trigger ${!hasResult ? 'tab-disabled' : ''} ${activeTab === 'ebom' ? 'tab-active' : ''}`}
            onClick={() => hasResult && setActiveTab('ebom')}
            disabled={!hasResult}
          >
            <Icons.FileSpreadsheet />
            eBOM
          </button>
          <button 
            className={`tab-trigger ${!hasResult ? 'tab-disabled' : ''} ${activeTab === 'mbom' ? 'tab-active' : ''}`}
            onClick={() => hasResult && setActiveTab('mbom')}
            disabled={!hasResult}
          >
            <Icons.Factory />
            mBOM
          </button>
        </div>

        <div>
          {hasResult && (
            <button className="btn btn-outline btn-sm" onClick={onExport}>
              <Icons.Download />
              Export
            </button>
          )}
        </div>
      </div>

      {/* eBOM Tab Content */}
      {activeTab === 'ebom' && hasResult && (
        <div className="tab-content tab-active animate-fade-in">
          <div className="card">
            <div className="card-header card-header-row">
              <div>
                <div className="card-title card-title-lg">
                  <Icons.FileSpreadsheet />
                  Engineering Bill of Materials (eBOM)
                </div>
                <p className="card-description">
                  Original design structure. {result.ebom.length} items parsed.
                </p>
              </div>
              <div className="view-toggle">
                <button 
                  className={`btn ${ebomViewMode === 'tree' ? 'active' : ''}`}
                  onClick={() => setEbomViewMode('tree')}
                >
                  <Icons.TreePine />
                  Tree
                </button>
                <button 
                  className={`btn ${ebomViewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setEbomViewMode('table')}
                >
                  <Icons.Table />
                  Table
                </button>
              </div>
            </div>
            <div className="card-content">
              {ebomViewMode === 'tree' ? (
                result.ebomTree ? (
                  <div className="tree-container">
                    <TreeNode node={result.ebomTree} isMbom={false} />
                  </div>
                ) : (
                  <div className="tree-empty">No data available</div>
                )
              ) : (
                <EBomTable data={result.ebom} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* mBOM Tab Content */}
      {activeTab === 'mbom' && hasResult && (
        <div className="tab-content tab-active animate-fade-in">
          <div className="card">
            <div className="card-header card-header-row">
              <div>
                <div className="card-title card-title-lg">
                  <Icons.Factory />
                  Manufacturing Bill of Materials (mBOM)
                </div>
                <p className="card-description">
                  Generated from eBOM with stations, processes, and make/buy decisions. {result.mbom.length} items.
                </p>
              </div>
              <div className="view-toggle">
                <button 
                  className={`btn ${mbomViewMode === 'tree' ? 'active' : ''}`}
                  onClick={() => setMbomViewMode('tree')}
                >
                  <Icons.TreePine />
                  Tree
                </button>
                <button 
                  className={`btn ${mbomViewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setMbomViewMode('table')}
                >
                  <Icons.Table />
                  Table
                </button>
              </div>
            </div>
            <div className="card-content">
              {mbomViewMode === 'tree' ? (
                result.mbomTree ? (
                  <div className="tree-container">
                    <TreeNode node={result.mbomTree} isMbom={true} />
                  </div>
                ) : (
                  <div className="tree-empty">No data available</div>
                )
              ) : (
                <MBomTable data={result.mbom} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
