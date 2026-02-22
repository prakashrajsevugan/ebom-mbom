// Format BOM data into production line view
export function formatBomForProduction(bom) {
  if (!bom || !bom.items) return [];

  const items = Array.isArray(bom.items) ? bom.items : [];
  
  // Group items by workstation
  const grouped = {};
  
  items.forEach(item => {
    const workstationName = item.workstationName || 'General Assembly';
    
    if (!grouped[workstationName]) {
      grouped[workstationName] = [];
    }
    
    grouped[workstationName].push({
      level: item.level,
      parent: item.parentPartNumber || '-',
      partNo: item.partNumber,
      partName: item.partName,
      qty: item.quantity,
      workstationNo: item.workstationNo || '',
      workstationName: workstationName,
      operation: item.operation || '',
      time: item.operationTime || 0,
    });
  });

  // Convert to array of production lines
  const productionLines = Object.keys(grouped).map(lineName => ({
    lineName,
    items: grouped[lineName],
  }));

  return productionLines;
}

// Format as table text for export
export function formatAsTable(bom) {
  const lines = formatBomForProduction(bom);
  let output = '';

  lines.forEach(line => {
    output += `${line.lineName.toUpperCase()}\n`;
    output += 'Level\tParent\tPart No\tPart Name\tQty\tWorkstation No\tWorkstation Name\tOperation\tTime (min)\n';
    output += '─────\t──────\t────────\t─────────\t───\t──────────────\t────────────────\t─────────\t──────────\n';
    
    line.items.forEach(item => {
      output += `${item.level}\t${item.parent}\t${item.partNo}\t${item.partName}\t${item.qty}\t`;
      output += `${item.workstationNo}\t${item.workstationName}\t${item.operation}\t${item.time}\n`;
    });
    
    output += '\n';
  });

  return output;
}

// Format as CSV for export
export function formatAsCSV(bom) {
  const lines = formatBomForProduction(bom);
  let csv = 'Level,Parent,Part No,Part Name,Qty,Workstation No,Workstation Name,Operation,Time (min)\n';

  lines.forEach(line => {
    line.items.forEach(item => {
      csv += `${item.level},"${item.parent}","${item.partNo}","${item.partName}",`;
      csv += `${item.qty},"${item.workstationNo}","${item.workstationName}","${item.operation}",${item.time}\n`;
    });
  });

  return csv;
}

// Format as JSON structure
export function formatAsJSON(bom) {
  return {
    bomName: bom.name,
    type: bom.type,
    totalParts: bom.totalParts,
    totalStations: bom.totalStations,
    productionLines: formatBomForProduction(bom),
  };
}
