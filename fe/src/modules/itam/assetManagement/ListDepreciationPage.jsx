import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Space, Button, message, Flex, Divider, Modal, Tabs, Input } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { encodePath } from "@/shared/utils/routeCipher";
import { usePageHeader } from "@/layouts/MainLayout/MainLayout";

import AssetTable from "./components/AssetTable";
import AssetForm from "./components/AssetForm";
import AssetToolbar from "./components/AssetToolbar";
import AssetImportModal from "./components/AssetImportModal";
import AssetQrModal from "./components/AssetQrModal";
import AssetMultiQrModal from "./components/AssetMultiQrModal";

import useAsset from "./hooks/useAsset";
import useAssetExcel from "./hooks/useAssetExcel";
import useAssetActions from "./hooks/useAssetActions";
import useAssetPageState from "./hooks/useAssetPageState";

import assetService from "./services/assetService";
import {
  getAssetRouteActionLabel,
  getAssetRouteGroup,
  getAssetRouteGroupLabel,
  assetBelongsToRouteGroup,
  getScopedCategoryIds,
} from "./utils/routeCategoryScope";
import {
  getAssetWorkbookTabs,
  getWorkbookTabCategoryIds,
} from "./utils/assetWorkbookTabs";

export default function ListDepreciationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setHeaderBreadcrumb, setHeaderTitle, setHeaderSubtitle } = usePageHeader() || {};

  const {
    rows = [],
    categories = [],
    loading,
    page,
    pageSize,
    total,
    filters,
    reload,
    saveAsset,
    removeAsset,
  } = useAsset();

  const {
    open,
    setOpen,
    editing,
    setEditing,
    previewOpen,
    setPreviewOpen,
    previewRows,
    setPreviewRows,
    headerFilters,
    setHeaderFilter,
  } = useAssetPageState();

  const { exportExcel, downloadTemplate, readExcel } = useAssetExcel();

  const [qrOpen, setQrOpen] = useState(false);
  const [qrAsset, setQrAsset] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [multiOpen, setMultiOpen] = useState(false);
  const routeGroup = getAssetRouteGroup(location.pathname);
  const workbookTabs = getAssetWorkbookTabs(routeGroup);
  const [activeWorkbookTab, setActiveWorkbookTab] = useState("");
  const routeScopedRows = useMemo(
    () => rows.filter((row) => assetBelongsToRouteGroup(row, categories, routeGroup)),
    [rows, categories, routeGroup]
  );
  const displayedRows = workbookTabs.length > 0 && activeWorkbookTab
    ? rows
    : routeScopedRows;

  const buildFilters = useCallback(
    (override = {}) => {
      const scopedCategoryIds = getScopedCategoryIds(categories, routeGroup);
      const activeTabCategoryIds = activeWorkbookTab
        ? getWorkbookTabCategoryIds(categories, routeGroup, activeWorkbookTab)
        : [];

      let finalCategoryIds = activeTabCategoryIds.length > 0
        ? activeTabCategoryIds.join(",")
        : scopedCategoryIds;

      return {
        ...filters,
        ...headerFilters,
        has_depreciation_date: "1",
        depreciation_history: "1",
        sort_by: "depreciation_date",
        sort_order: "ASC",
        category_id: finalCategoryIds,
        ...(activeWorkbookTab
          ? { workbook_tab: activeWorkbookTab }
          : {}),
        ...override,
      };
    },
    [filters, headerFilters, categories, routeGroup, activeWorkbookTab]
  );

  const openDetail = useCallback(
    (id) => navigate("/" + encodePath(`/itam/assets/${id}`)),
    [navigate]
  );

  const openQr = useCallback((row) => {
    setQrAsset(row);
    setQrOpen(true);
  }, [setQrAsset, setQrOpen]);

  const handleDepreciationClick = useCallback((record) => {
    Modal.info({
      title: "Informasi Depresiasi",
      content: (
        <div style={{ marginTop: 16 }}>
          <p style={{ margin: '4px 0' }}><strong>No Asset:</strong> {record.asset_code}</p>
          <p style={{ margin: '4px 0' }}><strong>Hostname:</strong> {record.hostname}</p>
          <p style={{ margin: '4px 0' }}><strong>Nama Aset:</strong> {record.asset_name}</p>
          <p style={{ margin: '4px 0' }}><strong>Tgl Pembelian:</strong> {record.purchase_date || '-'}</p>
          <p style={{ margin: '4px 0' }}><strong>Tgl Disposal:</strong> {record.depreciation_date}</p>
        </div>
      ),
      okText: "Tutup",
      maskClosable: true,
    });
  }, []);

  const closeQr = useCallback(() => {
    setQrAsset(null);
    setQrOpen(false);
  }, [setQrAsset, setQrOpen]);

  const handleSelectRows = useCallback((keys, rows) => {
    setSelectedRowKeys(keys);
    setSelectedRows(rows);
  }, [setSelectedRowKeys, setSelectedRows]);

  const openMultiPrint = useCallback(() => {
    if (!selectedRows.length) {
      message.warning("Silakan pilih aset terlebih dahulu untuk mencetak label.");
      return;
    }
    setMultiOpen(true);
  }, [selectedRows, setMultiOpen]);

  const closeMultiPrint = useCallback(() => {
    setMultiOpen(false);
  }, [setMultiOpen]);

  const {
    openCreate,
    openEdit,
    closeModal,
    onDelete,
    onSubmit,
    confirmImport,
    isImporting,
  } = useAssetActions({
    editing,
    setEditing,
    setOpen,
    saveAsset,
    removeAsset,
    reload,
    setPreviewRows,
    setPreviewOpen,
    previewRows,
  });

  const importExcel = useCallback(async (file) => {
    try {
      const rows = await readExcel(file);
      setPreviewRows(rows);
      setPreviewOpen(true);
    } catch {
      message.error("Gagal membaca file Excel.");
    }
    return false; // Prevent auto upload
  }, [readExcel, setPreviewRows, setPreviewOpen]);

  const handleHeaderFilterChange = useCallback((field, value) => {
    setHeaderFilter(field, value);
    reload(1, pageSize, buildFilters({ [field]: value }));
  }, [reload, pageSize, buildFilters, setHeaderFilter]);

  const handleTableChange = useCallback((pagination) => {
    reload(
      pagination.current,
      pagination.pageSize,
      buildFilters()
    );
  }, [reload, buildFilters]);

  const handleRefresh = useCallback(() => {
    reload(page, pageSize, buildFilters());
  }, [reload, page, pageSize, buildFilters]);

  const handleDeleteAllVisibleRows = useCallback(async () => {
    const assetIds = displayedRows
      .map((row) => row?.asset_id)
      .filter(Boolean);

    if (!assetIds.length) {
      message.warning("Tidak ada data depresiasi pada tab aktif untuk dihapus.");
      return;
    }

    try {
      await assetService.bulkDeleteByAssetIds(assetIds);
      message.success("Semua data pada list depresiasi tab aktif berhasil dihapus.");
      await reload(1, pageSize, buildFilters());
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Gagal menghapus data list depresiasi.";
      message.error(errorMessage);
    }
  }, [displayedRows, reload, pageSize, buildFilters]);

  useEffect(() => {
    if (categories.length === 0) {
      return;
    }

    reload(1, pageSize, buildFilters());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, routeGroup, activeWorkbookTab]);

  useEffect(() => {
    if (!workbookTabs.length) {
      setActiveWorkbookTab("");
      return;
    }

    setActiveWorkbookTab((currentTab) => {
      if (workbookTabs.some((tab) => tab.key === currentTab)) {
        return currentTab;
      }

      return workbookTabs[0].key;
    });
  }, [workbookTabs]);

  useEffect(() => {
    const routeGroupLabel = getAssetRouteGroupLabel(routeGroup);
    const routeActionLabel = getAssetRouteActionLabel(location.pathname);
    const breadcrumbParts = ["Asset Management"];
    if (routeGroupLabel) breadcrumbParts.push(routeGroupLabel);
    if (routeActionLabel) breadcrumbParts.push(routeActionLabel);

    if (setHeaderBreadcrumb) setHeaderBreadcrumb(breadcrumbParts.join(" > "));
    if (setHeaderTitle) setHeaderTitle("List Depresiasi");
    if (setHeaderSubtitle) {
      setHeaderSubtitle("Pantau aset yang sudah masuk masa penggantian atau disposal berdasarkan jadwal depresiasi.");
    }
  }, [location.pathname, routeGroup, setHeaderBreadcrumb, setHeaderTitle, setHeaderSubtitle]);

  return (
    <div className="workspace-page">
      <Card 
        className="workspace-card" 
        bordered={false}
        style={{ 
          borderRadius: '12px', 
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}
        styles={{ body: { padding: '24px' } }}
      >
        <Flex 
          className="workspace-card-toolbar"
          justify="space-between" 
          align="center" 
          wrap="wrap" 
          gap="middle"
        >
          <div className="workspace-filter-area" style={{ flex: '1 1 300px' }}>
            <div className="asset-filter-bar">
              <Input
                allowClear
                value={headerFilters.asset_name || ""}
                placeholder="Search asset"
                onChange={(e) => handleHeaderFilterChange("asset_name", e.target.value)}
                style={{ maxWidth: 280 }}
              />
            </div>
          </div>

          <div className="workspace-actions-area" style={{ flex: '0 0 auto' }}>
            <Space wrap size="small">
              <Button
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={handleRefresh}
              >
                Refresh
              </Button>
              <Divider type="vertical" style={{ height: '24px', margin: '0 8px' }} />
              <AssetToolbar
                onTemplate={downloadTemplate}
                onImport={importExcel}
                onExport={() => exportExcel(rows)}
                onPrintLabels={openMultiPrint}
                showPrintLabels={false}
                onDeleteAll={handleDeleteAllVisibleRows}
                deleteAllLabel={workbookTabs.find((tab) => tab.key === activeWorkbookTab)?.label || "tab aktif"}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                Add Asset
              </Button>
            </Space>
          </div>
        </Flex>

        <div className="workspace-table-container">
          {workbookTabs.length > 0 && (
            <Tabs
              className="asset-workbook-tabs"
              activeKey={activeWorkbookTab}
              onChange={setActiveWorkbookTab}
              items={workbookTabs.map((tab) => ({
                key: tab.key,
                label: tab.label,
              }))}
              style={{ marginBottom: 16 }}
            />
          )}
          <AssetTable
            rows={displayedRows}
            categories={categories}
            loading={loading}
            page={page}
            pageSize={pageSize}
            total={total}
            selectedRowKeys={selectedRowKeys}
            onSelectRows={handleSelectRows}
            onChange={handleTableChange}
            onQr={openQr}
            onEdit={openEdit}
            onDelete={onDelete}
            onViewDetail={openDetail}
            onDepreciationClick={handleDepreciationClick}
            hidePlanColumns={true}
            viewOnlyActions={true}
            headerFilters={headerFilters}
            onHeaderFilterChange={handleHeaderFilterChange}
            contextRouteGroup={routeGroup}
            hideStatusColumn={true}
            workbookTabKey={activeWorkbookTab}
          />
        </div>
      </Card>

      <AssetForm
        open={open}
        initialValues={editing}
        categories={categories}
        routeGroup={routeGroup}
        onCancel={closeModal}
        onSubmit={onSubmit}
      />

      <AssetImportModal
        open={previewOpen}
        rows={previewRows}
        onCancel={() => setPreviewOpen(false)}
        onOk={() => confirmImport(assetService)}
        confirmLoading={isImporting}
      />

      <AssetQrModal open={qrOpen} asset={qrAsset} onCancel={closeQr} />

      <AssetMultiQrModal
        open={multiOpen}
        rows={selectedRows}
        onCancel={closeMultiPrint}
      />
    </div>
  );
}
