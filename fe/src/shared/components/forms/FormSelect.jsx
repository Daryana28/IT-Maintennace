// fe\src\shared\components\forms\FormSelect.jsx
function mergeClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function FormSelect({
  label,
  id,
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  error,
  helpText,
  required = false,
  disabled = false,
  className = "",
  selectClassName = "",
  ...props
}) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={mergeClasses("form-field", className)}>
      {label ? (
        <label className="form-label" htmlFor={selectId}>
          {label}
          {required ? <span className="form-required">*</span> : null}
        </label>
      ) : null}

      <select
        id={selectId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${selectId}-error` : helpText ? `${selectId}-help` : undefined}
        className={mergeClasses("form-select", error && "form-input-error", selectClassName)}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>

      {helpText ? (
        <div id={`${selectId}-help`} className="form-help">
          {helpText}
        </div>
      ) : null}

      {error ? (
        <div id={`${selectId}-error`} className="form-error">
          {error}
        </div>
      ) : null}
    </div>
  );
}