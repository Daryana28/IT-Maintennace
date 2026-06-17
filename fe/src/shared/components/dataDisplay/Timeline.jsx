// fe\src\shared\components\dataDisplay\Timeline.jsx
function mergeClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Timeline({
  items = [],
  className = "",
  itemClassName = "",
}) {
  return (
    <div className={mergeClasses("timeline", className)}>
      {items.map((item, index) => (
        <div key={item.key || index} className={mergeClasses("timeline-item", itemClassName)}>
          <div className="timeline-marker" aria-hidden="true" />
          <div className="timeline-content">
            {item.title ? <div className="timeline-title">{item.title}</div> : null}
            {item.subtitle ? <div className="timeline-subtitle">{item.subtitle}</div> : null}
            {item.description ? (
              <div className="timeline-description">{item.description}</div>
            ) : null}
            {item.meta ? <div className="timeline-meta">{item.meta}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}