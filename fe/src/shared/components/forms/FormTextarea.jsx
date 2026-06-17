// fe\src\shared\components\forms\FormTextarea.jsx
function mergeClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function FormTextarea({
  label,
  id,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  error,
  helpText,
  required = false,
  disabled = false,
  className = "",
  textareaClassName = "",
  ...props
}) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={mergeClasses("form-field", className)}>
      {label ? (
        <label className="form-label" htmlFor={textareaId}>
          {label}
          {required ? <span className="form-required">*</span> : null}
        </label>
      ) : null}

      <textarea
        id={textareaId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${textareaId}-error` : helpText ? `${textareaId}-help` : undefined}
        className={mergeClasses("form-textarea", error && "form-input-error", textareaClassName)}
        {...props}
      />

      {helpText ? (
        <div id={`${textareaId}-help`} className="form-help">
          {helpText}
        </div>
      ) : null}

      {error ? (
        <div id={`${textareaId}-error`} className="form-error">
          {error}
        </div>
      ) : null}
    </div>
  );
}