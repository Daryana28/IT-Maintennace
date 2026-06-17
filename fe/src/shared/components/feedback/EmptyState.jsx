// fe\src\shared\components\feedback\EmptyState.jsx
export default function EmptyState({
  title = "No data available",
  subtitle = "There is nothing to display at the moment.",
  action,
  className = "",
}) {
  return (
    <div className={`feedback-empty ${className}`.trim()}>
      <h3 className="feedback-empty-title">{title}</h3>
      <p className="feedback-empty-subtitle">{subtitle}</p>
      {action ? <div className="feedback-empty-action">{action}</div> : null}
    </div>
  );
}