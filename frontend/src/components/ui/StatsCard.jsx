import './ui.css';

function StatsCard({ title, value, color = '#4f46e5', icon }) {
  return (
    <div className="stats-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stat-label">{title}</div>
      <div className="stat-value">{value}</div>
      {icon && <div className="stat-icon">{icon}</div>}
    </div>
  );
}

export default StatsCard;
