export default function MBomTable({ data }) {
  if (!data || data.length === 0) {
    return <div className="tree-empty">No mBOM data available</div>;
  }

  const mbomLevelColors = { 0: 'level-0', 1: 'level-1', 2: 'level-2', 3: 'level-3' };

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th className="w-16">Level</th>
            <th className="font-mono">Part Number</th>
            <th>Part Name</th>
            <th className="text-center w-16">Qty</th>
            <th>Workstation</th>
            <th>Operation</th>
            <th className="w-20">Time (min)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const cls = mbomLevelColors[row.level] || 'level-3';
            const indent = row.level > 0 ? <span className="cell-indent-marker">└</span> : null;
            
            return (
              <tr 
                key={`${row.partNumber}-${index}`}
                className="animate-slide-up" 
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <td><span className={`level-indicator ${cls}`}>{row.level}</span></td>
                <td className="cell-mono cell-sm cell-medium">{row.partNumber}</td>
                <td className="cell-medium" style={{ paddingLeft: `${row.level * 12}px` }}>
                  {indent}{row.partName}
                </td>
                <td className="cell-center">{row.quantity}</td>
                <td>
                  {row.workstationNo && (
                    <span className="badge badge-outline badge-accent-30">{row.workstationNo}</span>
                  )}
                  {row.workstationName && (
                    <span className="cell-sm cell-muted" style={{ marginLeft: '0.5rem' }}>
                      {row.workstationName}
                    </span>
                  )}
                </td>
                <td className="cell-sm">{row.operation || ''}</td>
                <td className="cell-center">
                  {row.operationTime ? (
                    <span className="badge badge-secondary">{row.operationTime}</span>
                  ) : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
