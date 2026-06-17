// fe\src\shared\components\dataDisplay\InfoCard.jsx
function mergeClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function InfoCard({
  title,
  subtitle,
  actions,
  children,
  className = "",
  bodyClassName = "",
}) {
  return (
    <section className={mergeClasses("info-card", className)}>
      {title || subtitle || actions ? (
        <div className="info-card-head">
          <div className="min-w-0">
            {title ? <h3 className="info-card-title">{title}</h3> : null}
            {subtitle ? <p className="info-card-subtitle">{subtitle}</p> : null}
          </div>

          {actions ? <div className="info-card-actions">{actions}</div> : null}
        </div>
      ) : null}

      <div className={mergeClasses("info-card-body", bodyClassName)}>{children}</div>
    </section>
  );
}