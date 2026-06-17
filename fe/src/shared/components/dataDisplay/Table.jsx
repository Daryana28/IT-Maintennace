// fe\src\shared\components\dataDisplay\Table.jsx
import { Table as AntTable } from "antd";

function mergeClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Table({
  className = "",
  tableClassName = "",
  ...props
}) {
  return (
    <div className={mergeClasses("data-table-wrapper", className)}>
      <AntTable
        className={mergeClasses("data-table", tableClassName)}
        pagination={{
          showSizeChanger: false,
          ...props.pagination,
        }}
        {...props}
      />
    </div>
  );
}