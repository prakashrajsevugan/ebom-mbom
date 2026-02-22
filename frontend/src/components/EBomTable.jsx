export default function EBomTable({ data }) {
  if (!data || data.length === 0) {
    return <div className="tree-empty">No eBOM data available</div>;
  }

  const ebomLevelColors = { 0: 'ebom-level-0', 1: 'ebom-level-1', 2: 'ebom-level-2', 3: 'ebom-level-3' };

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '5rem' }}>Level</th>
            <th className="font-mono">Parent P/N</th>
            <th className="font-mono">Part Number</th>
            <th>Part Name</th>
            <th className="text-center" style={{ width: '5rem' }}>Qty</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const cls = ebomLevelColors[row.level] || 'ebom-level-3';
            const indent = row.level > 0 ? <span className="cell-indent-marker">└</span> : null;
            return (
              <tr 
                key={`${row.partNumber}-${index}`} 
                className="animate-slide-up" 
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <td><span className={`level-indicator ${cls}`}>{row.level}</span></td>
                <td className="cell-mono cell-muted">{row.parentPartNumber}</td>
                <td className="cell-mono cell-medium">{row.partNumber}</td>
                <td className="cell-medium" style={{ paddingLeft: `${row.level * 12}px` }}>
                  {indent}{row.partName}
                </td>
                <td className="cell-center">{row.quantity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
