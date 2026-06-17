// fe\src\shared\components\forms\FormDatePicker.jsx
function mergeClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function FormDatePicker({
  label,
  id,
  value,
  onChange,
  error,
  helpText,
  required = false,
  disabled = false,
  className = "",
  inputClassName = "",
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={mergeClasses("form-field", className)}>
      {label ? (
        <label className="form-label" htmlFor={inputId}>
          {label}
          {required ? <span className="form-required">*</span> : null}
        </label>
      ) : null}

      <input
        id={inputId}
        type="date"
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
        className={mergeClasses("form-input", error && "form-input-error", inputClassName)}
        {...props}
      />

      {helpText ? (
        <div id={`${inputId}-help`} className="form-help">
          {helpText}
        </div>
      ) : null}

      {error ? (
        <div id={`${inputId}-error`} className="form-error">
          {error}
        </div>
      ) : null}
    </div>
  );
}