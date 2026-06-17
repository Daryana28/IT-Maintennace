// fe\src\shared\components\layout\PageHeader.jsx
function mergeClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  children,
  className = "",
  titleClassName = "",
  subtitleClassName = "",
  actionsClassName = "",
}) {
  return (
    <div className={mergeClasses("page-header", className)}>
      <div className="min-w-0">
        {children ? (
          children
        ) : (
          <>
            {title ? (
              <h1 className={mergeClasses("page-title", titleClassName)}>{title}</h1>
            ) : null}
            {subtitle ? (
              <p className={mergeClasses("page-subtitle", subtitleClassName)}>{subtitle}</p>
            ) : null}
          </>
        )}
      </div>

      {actions ? (
        <div className={mergeClasses("page-actions", actionsClassName)}>{actions}</div>
      ) : null}
    </div>
  );
}