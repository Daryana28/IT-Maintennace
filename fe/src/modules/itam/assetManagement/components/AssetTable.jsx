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
 DeleteOutlined,
 QrcodeOutlined,
} from "@ant-design/icons";
import { getAssetTypeProfile } from "../utils/assetTypeProfiles";

const TAB_STATUS_OPTIONS = [
 { value: "ACTIVE", label: "ACTIVE" },
 { value: "NON ACTIVE", label: "NON ACTIVE" },
];

function normalizeStatusGroup(status) {
 const normalizedStatus = String(status || "").trim().toUpperCase();
 return normalizedStatus === "ACTIVE" ? "ACTIVE" : "NON ACTIVE";
}

function statusColor(status) {
 switch (normalizeStatusGroup(status)) {
  case "ACTIVE":
   return "green";
  case "NON ACTIVE":
   return "red";
  default:
   return "blue";
 }
}

function parseAssetDate(value) {
 if (!value) return null;

 const normalized = String(value).trim();
 const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
 if (match) {
  return {
   year: Number(match[1]),
   month: Number(match[2]),
   day: Number(match[3]),
   value: normalized,
  };
 }

 const parsed = new Date(normalized);
 if (Number.isNaN(parsed.getTime())) return null;

 return {
  year: parsed.getFullYear(),
  month: parsed.getMonth() + 1,
  day: parsed.getDate(),
  value: normalized,
 };
}

function buildTimelineMarkers(record, year, month) {
 const purchase = parseAssetDate(record.purchase_date);
 const depreciation = parseAssetDate(record.depreciation_date);
 const markers = [];

 if (purchase && purchase.year === year && purchase.month === month) {
  markers.push({
   type: "replace",
   date: purchase.value,
   label: "Replace",
  });
 }

 if (depreciation && depreciation.year === year && depreciation.month === month) {
  markers.push({
   type: "planning",
   date: depreciation.value,
   label: "Planning",
  });
 }

 return markers;
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
       const markers = buildTimelineMarkers(record, year, i + 1);
       if (!markers.length) return "";

       const tooltipContent = (
        <div>
         <div><strong>No Asset:</strong> {record.asset_code || "-"}</div>
         <div><strong>Hostname:</strong> {record.hostname || "-"}</div>
         <div><strong>Nama Aset:</strong> {record.asset_name || "-"}</div>
         <div><strong>Tgl Pembelian:</strong> {record.purchase_date || "-"}</div>
         <div><strong>Tgl Depresiasi:</strong> {record.depreciation_date || "-"}</div>
         <div><strong>Status Grafik:</strong> {markers.map((marker) => marker.label).join(", ")}</div>
        </div>
       );

       return (
        <Tooltip title={tooltipContent} placement="top">
         <button
          type="button"
          className="asset-plan-marker-cell"
          onClick={() =>
            onDepreciationClick &&
            onDepreciationClick(record, markers, {
              year,
              month: i + 1,
            })
          }
         >
          {markers.map((marker, markerIndex) => (
           <span
            key={`${record.asset_id || record.asset_code || "asset"}-${year}-${i + 1}-${marker.type}-${markerIndex}`}
            className={`asset-plan-marker asset-plan-marker--${marker.type}`}
            aria-label={`${marker.label} ${marker.date}`}
            title={`${marker.label}: ${marker.date}`}
           />
          ))}
         </button>
        </Tooltip>
       );
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
 hideStatusColumn,
 contextRouteGroup = "",
 statusOptions,
 showTimelineLegend = false,
 workbookTabKey = "",
}) {
 const hasRows = Array.isArray(rows) && rows.length > 0;
 const tableData = hasRows ? rows : [];
 const actionButtonCount = viewOnlyActions ? 1 : 2;
 const actionColumnWidth = viewOnlyActions
  ? 72
  : Math.max(132, actionButtonCount * 34 + 20);

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
     [r.purchase_date, r.depreciation_date].forEach((rawDate) => {
      const parsed = parseAssetDate(rawDate);
      if (!parsed) return;
      if (parsed.year < min) min = parsed.year;
      if (parsed.year > max) max = parsed.year;
     });
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
 const resolvedStatusOptions = TAB_STATUS_OPTIONS;
 const isSoftwareRoute = contextRouteGroup === "software-hardware";
 const normalizedWorkbookTabKey = String(workbookTabKey || "").trim().toLowerCase();
 const isCctvWorkbookTab = normalizedWorkbookTabKey === "cctv";
 const isGatheringWorkbookTab = normalizedWorkbookTabKey === "gathering";

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

 const renderHeaderStatic = (label) => (
  <div className="asset-table-header" style={headerWrapStyle}>
   <span className="asset-table-header__label">{label}</span>
  </div>
 );

 const gatheringLabels = {
  assetCode: "NO.ASSET",
  purchaseDate: "Pembelian",
  depreciationDate: "Depresiasi (5+1 Tahun)",
  status: "Status",
 };

 const numberColumn = {
   title: "NO",
   key: "no",
   width: 60,
   fixed: hasRows ? "left" : undefined,
    align: "center",
   render: (_, __, index) =>
     __?.__isEmpty ? "" : (page - 1) * pageSize + index + 1,
   };

 const licenseColumn = {
  title: renderHeaderInput("LICENSE NO", headerFilters.serial_number || "", (val) => onHeaderFilterChange?.("serial_number", val)),
  key: "serial_number",
  width: 145,
  fixed: hasRows ? "left" : undefined,
  render: (_, record) => {
   if (record?.__isEmpty) return "";
   return record.serial_number || record.asset_code || "-";
  },
 };

 const descriptionColumn = {
  title: renderHeaderInput("DESCRIPTION", headerFilters.asset_name || "", (val) => onHeaderFilterChange?.("asset_name", val)),
  dataIndex: "asset_name",
  key: "asset_name",
  width: 230,
 };

 const functionColumn = {
  title: renderHeaderInput("FUNCTION", headerFilters.division || "", (val) => onHeaderFilterChange?.("division", val)),
  dataIndex: "division",
  key: "division",
  width: 180,
 };

 const qtyColumn = {
  title: renderHeaderStatic("QTY"),
  key: "qty",
  width: 90,
  align: "center",
  render: (_, record) => {
   if (record?.__isEmpty) return "";
   return record.qty || "-";
  },
 };

 const vendorColumn = {
  title: renderHeaderInput("VENDOR", headerFilters.owner_name || "", (val) => onHeaderFilterChange?.("owner_name", val)),
  dataIndex: "owner_name",
  key: "owner_name",
  width: 160,
 };

 const lastRenewColumn = {
  title: renderHeaderStatic("LAST RENEW"),
  key: "last_renew",
  dataIndex: "last_renew",
  width: 130,
  render: (value, record) => {
   if (record?.__isEmpty) return "";
   return value || "-";
  },
 };

 const nextRenewalColumn = {
  title: renderHeaderInput("Next Renewal (MM/YYYY)", headerFilters.depreciation_date || "", (val) => onHeaderFilterChange?.("depreciation_date", val)),
  dataIndex: "depreciation_date",
  key: "depreciation_date",
  width: 165,
 };

 const assetCodeColumn = {
  title: renderHeaderInput(
   isCctvWorkbookTab || isGatheringWorkbookTab ? "NO.ASSET" : "NO ASSET",
   headerFilters.asset_code || "",
   (val) => onHeaderFilterChange?.("asset_code", val)
  ),
  dataIndex: "asset_code",
  key: "asset_code",
  width: 145,
  fixed: hasRows ? "left" : undefined,
 };

 const assetNameColumn = {
  title: renderHeaderInput(labels.assetName, headerFilters.asset_name || "", (val) => onHeaderFilterChange?.("asset_name", val)),
  dataIndex: "asset_name",
  key: "asset_name",
  width: 180,
  fixed: hasRows ? "left" : undefined,
 };

 const typeColumn = {
  title: renderHeaderInput("TYPE", headerFilters.type || "", (val) => onHeaderFilterChange?.("type", val)),
  key: "type",
  width: 150,
  render: (_, record) => {
   if (record?.__isEmpty) return "";
   if (isSoftwareRoute) {
    return record.type || record.TYPE || record.category?.category_name || "-";
   }

   return record.type || record.TYPE || record.asset_name || record.category?.category_name || "-";
  },
 };

 const divisionColumn = {
  title: renderHeaderInput("DIVISI", headerFilters.division || "", (val) => onHeaderFilterChange?.("division", val)),
  dataIndex: "division",
  key: "division",
  width: 110,
 };

 const departmentColumn = {
  title: renderHeaderInput("DEPT", headerFilters.department || "", (val) => onHeaderFilterChange?.("department", val)),
  dataIndex: "department",
  key: "department",
  width: 110,
 };

 const ownerColumn = {
  title: renderHeaderInput("NAMA", headerFilters.owner_name || "", (val) => onHeaderFilterChange?.("owner_name", val)),
  dataIndex: "owner_name",
  key: "owner_name",
  width: 165,
 };

 const nikColumn = {
  title: renderHeaderInput("NIK", headerFilters.nik || "", (val) => onHeaderFilterChange?.("nik", val)),
  dataIndex: "nik",
  key: "nik",
  width: 95,
 };

 const purchaseColumn = {
  title: renderHeaderInput(
   isGatheringWorkbookTab ? gatheringLabels.purchaseDate : "PEMBELIAN",
   headerFilters.purchase_date || "",
   (val) => onHeaderFilterChange?.("purchase_date", val)
  ),
  dataIndex: "purchase_date",
  key: "purchase_date",
  width: 120,
 };

 const depreciationColumn = {
  title: renderHeaderInput(
   isGatheringWorkbookTab ? gatheringLabels.depreciationDate : "DEPRESIASI (5+1 TH)",
   headerFilters.depreciation_date || "",
   (val) => onHeaderFilterChange?.("depreciation_date", val)
  ),
  dataIndex: "depreciation_date",
  key: "depreciation_date",
  width: 150,
 };

 const hostnameColumn = {
  title: renderHeaderInput("HOSTNAME", headerFilters.hostname || "", (val) => onHeaderFilterChange?.("hostname", val)),
  dataIndex: "hostname",
  key: "hostname",
  width: 140,
 };

 const ipMainColumn = !hideIpAndStatus && ({
    title: renderHeaderInput(labels.ipMain, headerFilters.ip_main || "", (val) => onHeaderFilterChange?.("ip_main", val)),
    dataIndex: "ip_main",
    key: "ip_main",
    width: 150,
   });

 const ipBackupColumn = !hideIpAndStatus && ({
    title: renderHeaderInput(labels.ipBackup, headerFilters.ip_backup || "", (val) => onHeaderFilterChange?.("ip_backup", val)),
    dataIndex: "ip_backup",
    key: "ip_backup",
    width: 150,
   });

 const statusColumn = !hideIpAndStatus && !hideStatusColumn && ({
    title: renderHeaderSelect(
      isGatheringWorkbookTab ? gatheringLabels.status : "STATUS",
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
      {normalizeStatusGroup(value)}
      </Tag>
     )
    ),
   });

 const baseColumns = isCctvWorkbookTab
  ? [
     numberColumn,
     hostnameColumn,
     assetCodeColumn,
     typeColumn,
     divisionColumn,
     departmentColumn,
     ownerColumn,
     nikColumn,
     purchaseColumn,
     depreciationColumn,
     ipMainColumn,
     ipBackupColumn,
     statusColumn,
    ]
  : isSoftwareRoute
  ? [
     numberColumn,
     licenseColumn,
     descriptionColumn,
     functionColumn,
     qtyColumn,
     departmentColumn,
     typeColumn,
     vendorColumn,
     purchaseColumn,
     lastRenewColumn,
     nextRenewalColumn,
     statusColumn,
    ]
  : isGatheringWorkbookTab
  ? [
     numberColumn,
     assetCodeColumn,
     typeColumn,
     divisionColumn,
     departmentColumn,
     ownerColumn,
     nikColumn,
     purchaseColumn,
     depreciationColumn,
     hostnameColumn,
     ipMainColumn,
     ipBackupColumn,
     statusColumn,
    ]
  : [
     numberColumn,
     assetCodeColumn,
     typeColumn,
     divisionColumn,
     departmentColumn,
     ownerColumn,
     nikColumn,
     purchaseColumn,
     depreciationColumn,
     hostnameColumn,
     ipMainColumn,
     ipBackupColumn,
     statusColumn,
    ];

 const columns = [
   ...baseColumns,
   ...(hidePlanColumns ? [] : PLAN_COLUMNS),
   !hideActionColumn && ({
   title: "ACTION",
    key: "action",
    width: actionColumnWidth,
    className: "asset-table-action-column",
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
  <>
   {showTimelineLegend && !hidePlanColumns && (
   <div className="asset-plan-legend" aria-label="Timeline legend">
     <span className="asset-plan-legend__item">
      <span className="asset-plan-marker asset-plan-marker--planning" />
      <span>: Planing</span>
     </span>
     <span className="asset-plan-legend__item">
      <span className="asset-plan-marker asset-plan-marker--replace" />
      <span>: Replace</span>
     </span>
    </div>
   )}
   <Table
    className={`asset-data-table${hasRows ? "" : " asset-data-table--empty"}${isGatheringWorkbookTab ? " asset-data-table--gathering" : ""}`}
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
  </>
 );
}

export default memo(AssetTable);
