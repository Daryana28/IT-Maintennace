import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Flex, Space, message } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";

import { usePageHeader } from "@/layouts/MainLayout/MainLayout";
import AssetTable from "../components/AssetTable";
import useAssetExcel from "../hooks/useAssetExcel";
import useAssetPageState from "../hooks/useAssetPageState";
import assetService from "../services/assetService";
import {
 getScopedCategoryIds,
 assetBelongsToRouteGroup,
} from "../utils/routeCategoryScope";

const ROUTE_GROUP = "software-hardware";
const HISTORY_PAGE_SIZE = 1000;

function hasRenewalHistory(row = {}) {
 const lifecycleRenewed = Array.isArray(row?.lifecycles)
  && row.lifecycles.some(
   (item) => String(item?.action_name || "").toUpperCase() === "RENEWAL"
  );

 return lifecycleRenewed;
}

export default function SoftwareRenewalHistoryPage() {
 const { setHeaderBreadcrumb, setHeaderTitle, setHeaderSubtitle } = usePageHeader() || {};
 const {
  headerFilters,
  setHeaderFilter,
 } = useAssetPageState();
 const [rows, setRows] = useState([]);
 const [categories, setCategories] = useState([]);
 const [loading, setLoading] = useState(false);
 const [page, setPage] = useState(1);
 const [pageSize, setPageSize] = useState(20);
 const requestIdRef = useRef(0);

 const { exportExcel } = useAssetExcel();

 const buildFilters = useCallback((override = {}, nextCategories = categories) => {
  const scopedCategoryIds = getScopedCategoryIds(nextCategories, ROUTE_GROUP);

  return {
   ...headerFilters,
   ...(scopedCategoryIds
    ? { category_id: scopedCategoryIds }
    : {}),
   exclude_status: "DISPOSE,DISPOSED",
   sort_by: "asset_id",
   sort_order: "DESC",
   ...override,
  };
 }, [categories, headerFilters]);

 const loadRows = useCallback(async (
  override = {},
  nextCategories = categories
 ) => {
  const requestId = ++requestIdRef.current;
  setLoading(true);

  try {
   const result = await assetService.getAll({
    page: 1,
    pageSize: HISTORY_PAGE_SIZE,
    ...buildFilters(override, nextCategories),
   });

   if (requestId !== requestIdRef.current) return;

   setRows(Array.isArray(result?.data) ? result.data : []);
  } catch (error) {
   if (requestId === requestIdRef.current) {
    message.error(error?.response?.data?.message || error?.message || "Failed to load assets");
   }
  } finally {
   if (requestId === requestIdRef.current) {
    setLoading(false);
   }
  }
 }, [categories, buildFilters]);

 const loadInitial = useCallback(async () => {
  const requestId = ++requestIdRef.current;
  setLoading(true);

  try {
   const categoryData = await assetService.getCategories({ all: true });
   const nextCategories = Array.isArray(categoryData) ? categoryData : [];

   if (requestId !== requestIdRef.current) return;
   setCategories(nextCategories);

   const result = await assetService.getAll({
    page: 1,
    pageSize: HISTORY_PAGE_SIZE,
    ...buildFilters({}, nextCategories),
   });

   if (requestId !== requestIdRef.current) return;
   setRows(Array.isArray(result?.data) ? result.data : []);
  } catch (error) {
   if (requestId === requestIdRef.current) {
    message.error(error?.response?.data?.message || error?.message || "Failed to load assets");
   }
  } finally {
   if (requestId === requestIdRef.current) {
    setLoading(false);
   }
  }
 }, [buildFilters]);

 const scopedRows = useMemo(
  () =>
   (Array.isArray(rows) ? rows : []).filter((row) =>
    assetBelongsToRouteGroup(row, categories, ROUTE_GROUP)
   ),
  [rows, categories]
 );

 const historyRows = useMemo(
  () => scopedRows.filter(hasRenewalHistory),
  [scopedRows]
 );

 const pagedRows = useMemo(() => {
  const offset = (page - 1) * pageSize;
  return historyRows.slice(offset, offset + pageSize);
 }, [historyRows, page, pageSize]);

 const handleRefresh = useCallback(() => {
  void loadRows();
  setPage(1);
 }, [loadRows]);

 const handleHeaderFilterChange = useCallback((field, value) => {
  setHeaderFilter(field, value);
  setPage(1);
  void loadRows({ [field]: value });
 }, [setHeaderFilter, loadRows]);

 const handleTableChange = useCallback((pagination) => {
  setPage(pagination.current || 1);
  setPageSize(pagination.pageSize || 20);
 }, []);

 const handleDelete = useCallback(async (row) => {
  try {
   await assetService.remove(row.asset_id);
   message.success("History renewal berhasil dihapus.");
   await loadRows();
  } catch (error) {
   message.error(error?.response?.data?.message || error?.message || "Gagal menghapus history renewal.");
  }
 }, [loadRows]);

 useEffect(() => {
  setHeaderBreadcrumb?.("Asset Management > Software > History Renewal");
  setHeaderTitle?.("History Renewal");
  setHeaderSubtitle?.("Pantau riwayat dan jadwal renewal lisensi software.");
 }, [setHeaderBreadcrumb, setHeaderTitle, setHeaderSubtitle]);

 useEffect(() => {
  void loadInitial();
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 return (
  <div className="workspace-page">
   <Card
    className="workspace-card"
    variant="borderless"
    style={{
     borderRadius: "12px",
     boxShadow: "0 4px 24px rgba(0, 0, 0, 0.04)",
     overflow: "hidden",
    }}
    styles={{ body: { padding: "24px" } }}
   >
    <Flex
     className="workspace-card-toolbar"
     justify="space-between"
     align="center"
     wrap="wrap"
     gap="middle"
    >
     <div className="workspace-actions-left">
      <Button
       icon={<ReloadOutlined />}
       loading={loading}
       onClick={handleRefresh}
      >
       Refresh
      </Button>
     </div>

     <div className="workspace-actions-right">
      <Space wrap size="small">
       <Button
        icon={<DownloadOutlined />}
        onClick={() => exportExcel(historyRows, { categories, routeGroup: ROUTE_GROUP })}
       >
        Export Excel
       </Button>
      </Space>
     </div>
    </Flex>

    <div className="workspace-table-container">
     <AssetTable
      rows={pagedRows}
      categories={categories}
      loading={loading}
      page={page}
      pageSize={pageSize}
     total={historyRows.length}
      onChange={handleTableChange}
      onDelete={handleDelete}
      contextRouteGroup={ROUTE_GROUP}
      hidePlanColumns
      headerFilters={headerFilters}
      onHeaderFilterChange={handleHeaderFilterChange}
      deleteOnlyActions
     />
    </div>
   </Card>
  </div>
 );
}
