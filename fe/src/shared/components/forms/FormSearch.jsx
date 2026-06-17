// fe\src\shared\components\forms\FormSearch.jsx
function mergeClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function FormSearch({
  id,
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  inputClassName = "",
  ...props
}) {
  const inputId = id || "search-input";

  return (
    <div className={mergeClasses("form-field form-search", className)}>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={mergeClasses("form-input", "form-search-input", inputClassName)}
        {...props}
      />
    </div>
  );
}