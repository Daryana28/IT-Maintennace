// fe\src\shared\components\feedback\LoadingState.jsx
export default function LoadingState({
  title = "Loading...",
  subtitle = "Please wait while we prepare your data.",
  className = "",
}) {
  return (
    <div className={`feedback-loading ${className}`.trim()}>
      <div className="feedback-loading-spinner" aria-hidden="true" />
      <h3 className="feedback-loading-title">{title}</h3>
      <p className="feedback-loading-subtitle">{subtitle}</p>
    </div>
  );
}