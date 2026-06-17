// fe/src/modules/itam/assets/components/AssetTable.jsx
import { memo, useMemo } from "react";
import {
 Button,
 Popconfirm,
 Space,
 Table,
 Tag,
 Tooltip,
} from "antd";

import {
 EditOutlined,
 DeleteOutlined,
 QrcodeOutlined,
 EyeOutlined,
} from "@ant-design/icons";

function statusColor(status) {
 switch (status) {
  case "ACTIVE":
   return "green";
  case "REPAIR":
   return "orange";
  case "INACTIVE":
   return "red";
  default:
   return "blue";
 }
}

function createPlanColumns(onDepreciationClick, startYear, endYear) {
 const cols = [];

 for (let year = startYear; year <= endYear; year += 1) {
  const maxMonth = year === endYear ? 12 : 12; // Adjust if needed, for now use 12 for all

  cols.push({
   title: String(year),
   children: Array.from(
    { length: maxMonth },
    (_, i) => ({
     title: String(i + 1),
     key: `${year}-${i + 1}`,
     width: 75,
     align: "center",
     render: (_, record) => {
       if (!record.depreciation_date) return "";
       const d = new Date(record.depreciation_date);
       if (d.getFullYear() === year && d.getMonth() + 1 === (i + 1)) {
         const tooltipContent = (
           <div>
             <div><strong>No Asset:</strong> {record.asset_code}</div>
             <div><strong>Hostname:</strong> {record.hostname}</div>
             <div><strong>Nama Aset:</strong> {record.asset_name}</div>
             <div><strong>Tgl Pembelian:</strong> {record.purchase_date || '-'}</div>
             <div><strong>Tgl Disposal:</strong> {record.depreciation_date}</div>
           </div>
         );

         return (
           <Tooltip title={tooltipContent} placement="top">
             <div 
               style={{
                 background: '#fffbe6',
                 color: '#d46b08',
                 border: '1px solid #ffe58f',
                 borderRadius: '4px',
                 padding: '2px 4px',
                 fontSize: '10px',
                 lineHeight: 1.2,
                 textAlign: 'center',
                 whiteSpace: 'nowrap',
                 cursor: 'pointer'
               }}
               onClick={() => onDepreciationClick && onDepreciationClick(record)}
             >
               <strong>Depresiasi</strong><br />
               {record.depreciation_date}
             </div>
           </Tooltip>
         );
       }
       return "";
     },
    })
   ),
  });
 }

 return cols;
}

function AssetTable({
 rows,
 categories = [],
 loading,
 page,
 pageSize,
 total,
 selectedRowKeys = [],
 onSelectRows,
 onChange,
 onQr,
 onEdit,
 onDelete,
 onViewDetail,
 onDepreciationClick,
 hidePlanColumns,
 viewOnlyActions,
}) {
 const rowSelection = useMemo(
  () => ({
   selectedRowKeys,
   onChange: onSelectRows,
  }),
  [selectedRowKeys, onSelectRows]
 );

 const { startYear, endYear } = useMemo(() => {
   if (!rows || rows.length === 0) {
     const currentYear = new Date().getFullYear();
     return { startYear: currentYear, endYear: currentYear + 5 };
   }
   
   let min = Infinity;
   let max = -Infinity;
   
   rows.forEach(r => {
     if (r.depreciation_date) {
       const y = new Date(r.depreciation_date).getFullYear();
       if (y < min) min = y;
       if (y > max) max = y;
     }
   });
   
   if (min === Infinity) {
     const currentYear = new Date().getFullYear();
     return { startYear: currentYear, endYear: currentYear + 5 };
   }
   
   return { startYear: min, endYear: Math.max(min + 5, max) };
 }, [rows]);

 const PLAN_COLUMNS = useMemo(() => createPlanColumns(onDepreciationClick, startYear, endYear), [onDepreciationClick, startYear, endYear]);

 const columns = useMemo(
  () => [
   {
    title: "NO",
    key: "no",
    width: 60,
    fixed: "left",
    align: "center",
    render: (_, __, index) =>
     (page - 1) * pageSize + index + 1,
   },
   {
    title: "NO ASSET",
    dataIndex: "asset_code",
    key: "asset_code",
    width: 120,
    fixed: "left",
   },
   {
    title: "NAMA ASSET",
    dataIndex: "asset_name",
    key: "asset_name",
    width: 140,
    fixed: "left",
   },
   {
    title: "TYPE",
    key: "type",
    width: 120,
    render: (_, record) => record.category?.category_name || "-",
   },
   {
    title: "DIVISI",
    dataIndex: "division",
    key: "division",
    width: 100,
   },
   {
    title: "DEPT",
    dataIndex: "department",
    key: "department",
    width: 100,
   },
   {
    title: "NAMA",
    dataIndex: "owner_name",
    key: "owner_name",
    width: 130,
   },
   {
    title: "NIK",
    dataIndex: "nik",
    key: "nik",
    width: 80,
   },
   {
    title: "PEMBELIAN",
    dataIndex: "purchase_date",
    key: "purchase_date",
    width: 100,
   },
   {
    title: "DEPRESIASI (5+1 Th)",
    dataIndex: "depreciation_date",
    key: "depreciation_date",
    width: 130,
   },
   {
    title: "HOSTNAME",
    dataIndex: "hostname",
    key: "hostname",
    width: 110,
   },
   {
    title: "IP ADDRESS MAIN",
    dataIndex: "ip_main",
    key: "ip_main",
    width: 130,
   },
   {
    title: "IP ADDRESS BACKUP",
    dataIndex: "ip_backup",
    key: "ip_backup",
    width: 130,
   },
   {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 100,
    align: "center",
    render: (value) => (
     <Tag color={statusColor(value)}>
      {value}
     </Tag>
    ),
   },
   ...(hidePlanColumns ? [] : PLAN_COLUMNS),
   {
    title: "Action",
    key: "action",
    width: viewOnlyActions ? 60 : 160,
    fixed: "right",
    align: "center",
    render: (_, row) => (
     <Space>
      {!viewOnlyActions && (
       <Button
        size="small"
        icon={<QrcodeOutlined />}
        onClick={() => onQr(row)}
       />
      )}

      <Button
       size="small"
       icon={<EyeOutlined />}
       onClick={() =>
        onViewDetail(row.asset_id)
       }
      />

      {!viewOnlyActions && (
       <Button
        size="small"
        icon={<EditOutlined />}
        onClick={() => onEdit(row)}
       />
      )}

      {!viewOnlyActions && (
       <Popconfirm
        title="Delete asset?"
        onConfirm={() => onDelete(row)}
       >
        <Button
         danger
         size="small"
         icon={<DeleteOutlined />}
        />
       </Popconfirm>
      )}
     </Space>
    ),
   },
  ],
  [
   page,
   pageSize,
   onQr,
   onEdit,
   onDelete,
   onViewDetail,
   PLAN_COLUMNS,
   hidePlanColumns,
   viewOnlyActions,
   categories,
  ]
 );

 return (
  <Table
   rowKey="asset_id"
   bordered
   size="small"
   loading={loading}
   columns={columns}
   dataSource={rows}
   rowSelection={rowSelection}
   onChange={onChange}
   pagination={{
    current: page,
    pageSize,
    total,
    showSizeChanger: true,
    showTotal: (v) =>
     `Total ${v} data`,
   }}
   scroll={{
    x: "max-content",
    y: 650,
   }}
   sticky
  />
 );
}

export default memo(AssetTable);