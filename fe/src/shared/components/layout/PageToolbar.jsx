// fe\src\shared\components\layout\PageToolbar.jsx
function mergeClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PageToolbar({ children, className = "" }) {
  return <div className={mergeClasses("page-toolbar", className)}>{children}</div>;
}