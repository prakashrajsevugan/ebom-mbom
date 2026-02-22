import { Icons } from './Icons';

export default function SummarySection({ summary }) {
  if (!summary) return null;

  const stats = [
    { label: 'Total Parts', value: summary.totalParts, Icon: Icons.Package, color: 'color-primary', bg: 'bg-primary-10' },
    { label: 'Unique Parts', value: summary.uniqueParts, Icon: Icons.Hash, color: 'color-station-1', bg: 'bg-station-1-10' },
    { label: 'Workstations', value: summary.totalStations, Icon: Icons.Factory, color: 'color-station-2', bg: 'bg-station-2-10' },
    { label: 'Total Time', value: `${summary.totalTime}m`, Icon: Icons.Clock, color: 'color-success', bg: 'bg-success-10' },
  ];

  return (
    <div id="summary-section" className="animate-fade-in">
      <div className="summary-grid">
        {stats.map((s, i) => (
          <div 
            key={s.label}
            className="stat-card animate-scale-in" 
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="stat-card-content">
              <div className="stat-flex">
                <div className={`stat-icon-wrap ${s.bg} ${s.color}`}>
                  <s.Icon />
                </div>
                <div>
                  <p className="stat-value">{s.value}</p>
                  <p className="stat-label">{s.label}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
