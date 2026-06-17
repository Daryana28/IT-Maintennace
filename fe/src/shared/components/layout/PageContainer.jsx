// fe\src\shared\components\layout\PageContainer.jsx
function mergeClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PageContainer({ children, className = "" }) {
  return <div className={mergeClasses("page-container", className)}>{children}</div>;
}