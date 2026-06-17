// fe\src\shared\components\feedback\ErrorState.jsx
export default function ErrorState({
  title = "Something went wrong",
  subtitle = "Please try again.",
  action,
  className = "",
}) {
  return (
    <div className={`feedback-error ${className}`.trim()}>
      <h3 className="feedback-error-title">{title}</h3>
      <p className="feedback-error-subtitle">{subtitle}</p>
      {action ? <div className="feedback-error-action">{action}</div> : null}
    </div>
  );
}