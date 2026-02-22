import { useState } from 'react';
import { Icons } from './Icons';

export default function TreeNode({ node, isMbom }) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  // Icon selection
  let NodeIcon = Icons.Box;
  let iconClass = 'icon-station-1';
  if (node.level === 0) {
    NodeIcon = Icons.Package;
    iconClass = 'icon-primary';
  } else if (node.partNumber && (node.partNumber.includes('SYS-') || node.partNumber.includes('SUB-'))) {
    NodeIcon = Icons.Cog;
    iconClass = 'icon-station-2';
  } else if (node.partNumber && node.partNumber.includes('STD-')) {
    NodeIcon = Icons.Wrench;
    iconClass = 'icon-muted';
  }

  // Level color
  const levelClasses = { 0: 'level-0', 1: 'level-1', 2: 'level-2', 3: 'level-3' };
  const levelCls = levelClasses[node.level] || 'level-default';

  return (
    <div className="tree-node">
      <div 
        className={`tree-node-row${node.level === 0 ? ' root-node' : ''}`}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className="tree-toggle">
          {hasChildren && (isOpen ? <Icons.ChevronDown /> : <Icons.ChevronRight />)}
        </div>
        <span className={`level-indicator ${levelCls}`}>L{node.level}</span>
        <span className={`tree-node-icon ${iconClass}`}>
          <NodeIcon />
        </span>
        <div className="tree-part-info">
          <div className="tree-part-header">
            <span className="tree-part-number">{node.partNumber}</span>
            {isMbom && node.workstationNo && (
              <span className="badge badge-outline badge-station">{node.workstationNo}</span>
            )}
          </div>
          <div className="tree-part-name">
            {node.partName}
            {node.partDescription && node.partDescription !== node.partName && (
              <span className="tree-part-desc"> — {node.partDescription}</span>
            )}
          </div>
        </div>
        <div className="tree-qty">
          <span className="tree-qty-value">×{node.quantity}</span>
          {node.uom && <span className="tree-qty-uom">{node.uom}</span>}
        </div>
        {isMbom && node.operation && (
          <span className="badge badge-secondary tree-process-badge">{node.operation}</span>
        )}
        {isMbom && node.operationTime && (
          <span className="badge badge-outline tree-time-badge">{node.operationTime}m</span>
        )}
      </div>
      {hasChildren && isOpen && (
        <div className="tree-children">
          {node.children.map((child, index) => (
            <TreeNode key={`${child.id}-${index}`} node={child} isMbom={isMbom} />
          ))}
        </div>
      )}
    </div>
  );
}
