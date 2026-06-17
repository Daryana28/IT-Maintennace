// fe\src\shared\components\layout\PageSection.jsx
import PageHeader from "./PageHeader";

function mergeClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PageSection({
  title,
  subtitle,
  actions,
  children,
  className = "",
  bodyClassName = "",
  headerClassName = "",
}) {
  return (
    <section className={mergeClasses("page-section", className)}>
      {title || subtitle || actions ? (
        <PageHeader
          title={title}
          subtitle={subtitle}
          actions={actions}
          className={headerClassName}
        />
      ) : null}

      <div className={mergeClasses("page-body", bodyClassName)}>{children}</div>
    </section>
  );
}