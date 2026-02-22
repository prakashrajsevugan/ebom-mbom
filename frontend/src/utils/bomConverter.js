// ─── PARSER ─────────────────────────────────────────────────
export function parseEBom(input) {
  const lines = input.trim().split('\n');
  const rows = [];
  const startIndex = lines[0] && lines[0].toLowerCase().includes('level') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map(p => p.trim());
    
    // Expected format: S.No, Level, Parent Part No, Part No, Part Name, Part Description, Qty, UoM
    
    let sNo, level, parentPartNumber, partNumber, partName, partDescription, quantity, uom;
    
    // Check if first column is a number (S.No format)
    if (!isNaN(parseInt(parts[0], 10)) && parts.length >= 8) {
      sNo = parseInt(parts[0], 10);
      level = parseInt(parts[1], 10);
      parentPartNumber = (parts[2] === '—' || parts[2] === '-') ? '-' : parts[2];
      partNumber = parts[3];
      partName = parts[4];
      partDescription = parts[5];
      quantity = parseInt(parts[6], 10) || 1;
      uom = parts[7] || 'Nos';
    } else if (parts.length >= 5) {
      // Fallback: assume no S.No column
      level = parseInt(parts[0], 10);
      parentPartNumber = (parts[1] === '—' || parts[1] === '-') ? '-' : parts[1];
      partNumber = parts[2];
      partName = parts[3];
      partDescription = parts[4];
      quantity = parseInt(parts[5], 10) || 1;
      uom = parts[6] || 'Nos';
    }

    if (!isNaN(level) && partNumber && partName) {
      rows.push({ level, parentPartNumber, partNumber, partName, partDescription, quantity, uom });
    }
  }
  return rows;
}

// ─── TREE BUILDERS ──────────────────────────────────────────
export function buildEbomTree(rows) {
  if (rows.length === 0) return null;
  
  // Create nodes with unique IDs
  const nodes = rows.map((row, index) => ({
    id: `${row.partNumber}-${index}`,
    partNumber: row.partNumber,
    partName: row.partName,
    quantity: row.quantity,
    level: row.level,
    parentPartNumber: row.parentPartNumber,
    partDescription: row.partDescription,
    uom: row.uom,
    children: [],
  }));
  
  let root = null;
  
  // Build parent-child relationships
  nodes.forEach((node, index) => {
    if (rows[index].level === 0) {
      root = node;
    } else {
      // Find the parent node - the most recent node with matching part number at a lower level
      for (let i = index - 1; i >= 0; i--) {
        if (rows[i].partNumber === rows[index].parentPartNumber && rows[i].level < rows[index].level) {
          nodes[i].children.push(node);
          break;
        }
      }
    }
  });
  
  return root;
}

export function buildMbomTree(rows) {
  if (rows.length === 0) return null;
  
  // Create nodes with unique IDs
  const nodes = rows.map((row, index) => ({
    id: `${row.partNumber}-${index}`,
    partNumber: row.partNumber,
    partName: row.partName,
    quantity: row.quantity,
    level: row.level,
    parentPartNumber: row.parentPartNumber,
    workstationNo: row.workstationNo,
    workstationName: row.workstationName,
    operation: row.operation,
    operationTime: row.operationTime,
    children: [],
  }));
  
  let root = null;
  
  // Build parent-child relationships
  nodes.forEach((node, index) => {
    if (rows[index].level === 0) {
      root = node;
    } else {
      // Find the parent node - the most recent node with matching part number at a lower level
      for (let i = index - 1; i >= 0; i--) {
        if (rows[i].partNumber === rows[index].parentPartNumber && rows[i].level < rows[index].level) {
          nodes[i].children.push(node);
          break;
        }
      }
    }
  });
  
  return root;
}

// ─── MBOM GENERATION HELPERS ────────────────────────────────
function getWorkstationInfo(row, ebom) {
  if (row.level === 0) {
    return { workstationNo: 'WS-00', workstationName: 'Final Assembly' };
  }
  
  // Get the level 1 parent (system) to determine workstation
  let current = row;
  while (current.level > 1) {
    const parent = ebom.find(r => r.partNumber === current.parentPartNumber);
    if (!parent) break;
    current = parent;
  }
  
  // Assign workstation based on system type
  const systemName = current.partName.toLowerCase();
  const partName = row.partName.toLowerCase();
  
  if (systemName.includes('frame')) {
    if (partName.includes('frame') && !partName.includes('sub')) {
      return { workstationNo: 'WS-01', workstationName: 'Frame Fabrication' };
    } else if (partName.includes('fork')) {
      return { workstationNo: 'WS-02', workstationName: 'Fork Assembly' };
    } else {
      return { workstationNo: 'WS-03', workstationName: 'Frame Assembly' };
    }
  } else if (systemName.includes('wheel')) {
    if (partName.includes('rim')) {
      return { workstationNo: 'WS-04', workstationName: 'Rim Preparation' };
    } else if (partName.includes('spoke') || systemName.includes('lacing')) {
      return { workstationNo: 'WS-05', workstationName: 'Wheel Lacing' };
    } else if (partName.includes('tire') || partName.includes('tyre')) {
      return { workstationNo: 'WS-06', workstationName: 'Tire Mounting' };
    } else {
      return { workstationNo: 'WS-05', workstationName: 'Wheel Assembly' };
    }
  } else if (systemName.includes('drive')) {
    if (partName.includes('crank')) {
      return { workstationNo: 'WS-07', workstationName: 'Drivetrain Assembly' };
    } else if (partName.includes('chain')) {
      return { workstationNo: 'WS-08', workstationName: 'Chain Installation' };
    } else {
      return { workstationNo: 'WS-07', workstationName: 'Drivetrain Assembly' };
    }
  } else if (systemName.includes('brake')) {
    return { workstationNo: 'WS-09', workstationName: 'Brake Assembly' };
  } else if (systemName.includes('control') || systemName.includes('seat')) {
    return { workstationNo: 'WS-10', workstationName: 'Controls & Accessories' };
  }
  
  // Default workstation
  const level1Items = ebom.filter(r => r.level === 1);
  const index = level1Items.findIndex(r => r.partNumber === current.partNumber);
  const wsNum = (index + 1).toString().padStart(2, '0');
  return { 
    workstationNo: `WS-${wsNum}`, 
    workstationName: current.partName || 'Assembly'
  };
}

function getOperation(row) {
  const name = row.partName.toLowerCase();
  const partNo = row.partNumber.toLowerCase();
  
  if (row.level === 0) return 'Final Assembly & QC';
  
  if (partNo.includes('prt-') && name.includes('frame')) return 'Weld & Heat Treat';
  if (partNo.includes('prt-') && name.includes('fork')) return 'Machining';
  if (name.includes('bearing') || name.includes('bracket')) return 'Press Fit';
  if (name.includes('wheel') && !name.includes('spoke')) return 'Wheel Assembly';
  if (name.includes('spoke')) return 'Spoke Lacing';
  if (name.includes('rim')) return 'Rim Inspection';
  if (name.includes('hub')) return 'Hub Installation';
  if (name.includes('tire') || name.includes('tyre')) return 'Tire Mounting';
  if (name.includes('tube')) return 'Tube Installation';
  if (name.includes('crank')) return 'Crankset Installation';
  if (name.includes('chain')) return 'Chain Sizing & Install';
  if (name.includes('derailleur')) return 'Derailleur Adjustment';
  if (name.includes('cassette')) return 'Cassette Mounting';
  if (name.includes('brake')) return 'Brake Installation';
  if (name.includes('rotor')) return 'Rotor Mounting';
  if (name.includes('handle') || name.includes('bar')) return 'Handlebar Installation';
  if (name.includes('grip') || name.includes('tape')) return 'Grip Installation';
  if (name.includes('seat') || name.includes('saddle')) return 'Seat Installation';
  if (partNo.includes('std-')) return 'Install & Fasten';
  
  return 'Assembly';
}

function calculateTime(row) {
  const operation = getOperation(row);
  
  const operationTime = {
    'Final Assembly & QC': 30,
    'Weld & Heat Treat': 45,
    'Machining': 40,
    'Press Fit': 15,
    'Wheel Assembly': 20,
    'Spoke Lacing': 60,
    'Rim Inspection': 10,
    'Hub Installation': 15,
    'Tire Mounting': 20,
    'Tube Installation': 10,
    'Crankset Installation': 20,
    'Chain Sizing & Install': 25,
    'Derailleur Adjustment': 30,
    'Cassette Mounting': 15,
    'Brake Installation': 25,
    'Rotor Mounting': 10,
    'Handlebar Installation': 15,
    'Grip Installation': 10,
    'Seat Installation': 10,
    'Install & Fasten': 5,
    'Assembly': 10,
  };

  const baseTime = operationTime[operation] || 10;
  
  // Adjust for quantity - slight increase for multiple items
  return Math.round(baseTime * (row.quantity >= 2 ? 1.2 : 1));
}

function generateMBom(ebom) {
  const mbom = [];
  const level0 = ebom.find(r => r.level === 0);
  
  if (level0) {
    const wsInfo = { workstationNo: 'WS-00', workstationName: 'Final Assembly' };
    const operation = 'Final Assembly & QC';
    const time = 30; // Final assembly takes longer
    
    mbom.push({
      level: 0, 
      parentPartNumber: '-',
      partNumber: level0.partNumber, 
      partName: level0.partName,
      quantity: level0.quantity, 
      workstationNo: wsInfo.workstationNo,
      workstationName: wsInfo.workstationName,
      operation: operation,
      operationTime: time,
    });
  }
  
  ebom.filter(r => r.level > 0).forEach(row => {
    const wsInfo = getWorkstationInfo(row, ebom);
    const operation = getOperation(row);
    const time = calculateTime(row);
    
    mbom.push({
      level: row.level,
      parentPartNumber: row.parentPartNumber,
      partNumber: row.partNumber,
      partName: row.partName,
      quantity: row.quantity,
      workstationNo: wsInfo.workstationNo,
      workstationName: wsInfo.workstationName,
      operation: operation,
      operationTime: time,
    });
  });
  
  return mbom;
}

export function convertToMBom(ebomInput) {
  const ebom = parseEBom(ebomInput);
  const mbom = generateMBom(ebom);
  const ebomTree = buildEbomTree(ebom);
  const mbomTree = buildMbomTree(mbom);
  const uniqueWorkstations = new Set(mbom.filter(r => r.workstationNo).map(r => r.workstationNo));
  const uniqueParts = new Set(ebom.map(r => r.partNumber));
  const totalTime = mbom.reduce((sum, r) => sum + (r.operationTime || 0), 0);
  
  return {
    ebom, mbom, ebomTree, mbomTree,
    summary: {
      totalParts: ebom.reduce((sum, r) => sum + r.quantity, 0),
      totalStations: uniqueWorkstations.size,
      uniqueParts: uniqueParts.size,
      totalTime: totalTime,
    },
  };
}
