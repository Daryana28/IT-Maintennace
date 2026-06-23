// fe/src/modules/itam/assets/components/AssetTable.jsx
import { memo, useMemo } from "react";
import {
 Button,
 Empty,
 Popconfirm,
 Space,
 Table,
 Tag,
 Tooltip,
 Input,
 Select,
} from "antd";

import {
 EditOutlined,
 DeleteOutlined,
 QrcodeOutlined,
 EyeOutlined,
 SwapOutlined,
} from "@ant-design/icons";
import { getAssetTypeProfile } from "../utils/assetTypeProfiles";

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
 onReplace,
 hidePlanColumns,
 viewOnlyActions,
 headerFilters = {},
 onHeaderFilterChange,
 hideActionColumn,
 hideIpAndStatus,
 contextRouteGroup = "",
 statusOptions,
}) {
 const hasRows = Array.isArray(rows) && rows.length > 0;
 const tableData = hasRows ? rows : [];

 const rowSelection = useMemo(
  () => (hasRows
   ? {
      selectedRowKeys,
      onChange: onSelectRows,
      columnWidth: 46,
     }
   : undefined),
  [hasRows, selectedRowKeys, onSelectRows]
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

 const typeProfile = useMemo(
  () => getAssetTypeProfile(contextRouteGroup),
  [contextRouteGroup]
 );
 const labels = typeProfile.tableLabels;
 const resolvedStatusOptions = statusOptions || typeProfile.statusOptions;

 const headerWrapStyle = {
  minWidth: 0,
 };

 const renderHeaderInput = (label, value, onChange, placeholder = "Search...") => (
  <div className="asset-table-header" style={headerWrapStyle}>
   <span className="asset-table-header__label">{label}</span>
   <Input
    className="asset-table-header__control"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    size="small"
   />
  </div>
 );

 const renderHeaderSelect = (label, value, onChange, options = []) => (
  <div className="asset-table-header" style={headerWrapStyle}>
   <span className="asset-table-header__label">{label}</span>
   <Select
    className="asset-table-header__control"
    value={value || undefined}
    onChange={(v) => onChange(v || "")}
    placeholder="Filter"
    size="small"
    allowClear
   >
    {options.map((opt) => (
     <Select.Option key={opt.value} value={opt.value}>
      {opt.label}
     </Select.Option>
    ))}
   </Select>
  </div>
 );

 const columns = [
   {
   title: "NO",
   key: "no",
   width: 60,
    fixed: hasRows ? "left" : undefined,
    align: "center",
    render: (_, __, index) =>
     __?.__isEmpty ? "" : (page - 1) * pageSize + index + 1,
   },
   {
   title: renderHeaderInput("NO ASSET", headerFilters.asset_code || "", (val) => onHeaderFilterChange?.("asset_code", val)),
   dataIndex: "asset_code",
   key: "asset_code",
    width: 145,
    fixed: hasRows ? "left" : undefined,
   },
   {
    title: renderHeaderInput(labels.assetName, headerFilters.asset_name || "", (val) => onHeaderFilterChange?.("asset_name", val)),
    dataIndex: "asset_name",
    key: "asset_name",
    width: 180,
    fixed: hasRows ? "left" : undefined,
   },
   {
    title: renderHeaderInput(labels.type, headerFilters.type || "", (val) => onHeaderFilterChange?.("type", val)),
    key: "type",
    width: 150,
    render: (_, record) => (record?.__isEmpty ? "" : record.category?.category_name || "-"),
   },
   {
    title: renderHeaderInput("DIVISI", headerFilters.division || "", (val) => onHeaderFilterChange?.("division", val)),
    dataIndex: "division",
    key: "division",
    width: 110,
   },
   {
    title: renderHeaderInput("DEPT", headerFilters.department || "", (val) => onHeaderFilterChange?.("department", val)),
    dataIndex: "department",
    key: "department",
    width: 110,
   },
   {
    title: renderHeaderInput(labels.ownerName, headerFilters.owner_name || "", (val) => onHeaderFilterChange?.("owner_name", val)),
    dataIndex: "owner_name",
    key: "owner_name",
    width: 165,
   },
   {
    title: renderHeaderInput("NIK", headerFilters.nik || "", (val) => onHeaderFilterChange?.("nik", val)),
    dataIndex: "nik",
    key: "nik",
    width: 95,
   },
   {
    title: renderHeaderInput(labels.purchaseDate, headerFilters.purchase_date || "", (val) => onHeaderFilterChange?.("purchase_date", val)),
    dataIndex: "purchase_date",
    key: "purchase_date",
    width: 120,
   },
   {
    title: renderHeaderInput(labels.depreciationDate, headerFilters.depreciation_date || "", (val) => onHeaderFilterChange?.("depreciation_date", val)),
    dataIndex: "depreciation_date",
    key: "depreciation_date",
    width: 150,
   },
   {
    title: renderHeaderInput(labels.hostname, headerFilters.hostname || "", (val) => onHeaderFilterChange?.("hostname", val)),
    dataIndex: "hostname",
    key: "hostname",
    width: 140,
   },
   !hideIpAndStatus && ({
    title: renderHeaderInput(labels.ipMain, headerFilters.ip_main || "", (val) => onHeaderFilterChange?.("ip_main", val)),
    dataIndex: "ip_main",
    key: "ip_main",
    width: 150,
   }),
   !hideIpAndStatus && ({
    title: renderHeaderInput(labels.ipBackup, headerFilters.ip_backup || "", (val) => onHeaderFilterChange?.("ip_backup", val)),
    dataIndex: "ip_backup",
    key: "ip_backup",
    width: 150,
   }),
   !hideIpAndStatus && ({
    title: renderHeaderSelect(
      "STATUS",
      headerFilters.status || "",
      (val) => onHeaderFilterChange?.("status", val),
      resolvedStatusOptions
    ),
    dataIndex: "status",
    key: "status",
    width: 140,
    align: "center",
    render: (value, record) => (
     record?.__isEmpty || !value ? null : (
      <Tag color={statusColor(value)}>
      {value}
      </Tag>
     )
    ),
   }),
   ...(hidePlanColumns ? [] : PLAN_COLUMNS),
   !hideActionColumn && ({
    title: "ACTION",
    key: "action",
    width: viewOnlyActions ? 72 : 180,
    fixed: hasRows ? "right" : undefined,
    align: "center",
    render: (_, row) => (
     row?.__isEmpty ? null : (
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
        icon={<SwapOutlined />}
        title="Replacement"
        onClick={() => onReplace && onReplace(row)}
       />
      )}

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
     )
    ),
  }),
  ].filter(Boolean);

 const tableScrollX = useMemo(
  () =>
   columns.reduce(
    (totalWidth, column) =>
     totalWidth + Number(column?.width || 120),
    selectedRowKeys !== undefined ? 46 : 0
   ),
  [columns, selectedRowKeys]
 );

 const emptyState = (
  <Empty
   image={(
    <svg
     width="120"
     height="80"
     viewBox="0 0 120 80"
     fill="none"
     xmlns="http://www.w3.org/2000/svg"
    >
     <rect x="18" y="18" width="84" height="48" rx="10" fill="#F8FAFC" stroke="#C9D7E8" strokeWidth="2" />
     <rect x="28" y="28" width="64" height="8" rx="4" fill="#DCE8F5" />
     <rect x="28" y="42" width="34" height="6" rx="3" fill="#E7EEF7" />
     <rect x="28" y="52" width="48" height="6" rx="3" fill="#E7EEF7" />
     <circle cx="88" cy="54" r="12" fill="#EEF5FF" stroke="#9EC5FE" strokeWidth="2" />
     <path d="M84 54H92" stroke="#4C8DFF" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
   )}
   description="No data"
  />
 );

 return (
  <Table
   className={`asset-data-table${hasRows ? "" : " asset-data-table--empty"}`}
   rowKey="asset_id"
   bordered
   size="small"
   loading={loading}
   columns={columns}
   dataSource={tableData}
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
   locale={{
    emptyText: emptyState,
   }}
   scroll={{
    x: tableScrollX,
    y: 650,
   }}
   sticky={hasRows}
  />
 );
}

export default memo(AssetTable);
