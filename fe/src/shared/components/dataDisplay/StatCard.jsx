// fe\src\shared\components\dataDisplay\StatCard.jsx
function mergeClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = "",
  valueClassName = "",
}) {
  return (
    <div className={mergeClasses("stat-card", className)}>
      <div className="stat-card-head">
        <div className="stat-card-title">{title}</div>
        {icon ? <div className="stat-card-icon">{icon}</div> : null}
      </div>

      <div className={mergeClasses("stat-card-value", valueClassName)}>{value}</div>

      {subtitle ? <div className="stat-card-subtitle">{subtitle}</div> : null}

      {trend ? <div className="stat-card-trend">{trend}</div> : null}
    </div>
  );
}