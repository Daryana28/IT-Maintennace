// fe\src\shared\components\feedback\ResultState.jsx
export default function ResultState({
  title = "Done",
  subtitle = "Your changes have been saved successfully.",
  action,
  className = "",
}) {
  return (
    <div className={`feedback-result ${className}`.trim()}>
      <h3 className="feedback-result-title">{title}</h3>
      <p className="feedback-result-subtitle">{subtitle}</p>
      {action ? <div className="feedback-result-action">{action}</div> : null}
    </div>
  );
}