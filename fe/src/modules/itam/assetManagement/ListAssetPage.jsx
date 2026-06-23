import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Space, Button, message, Flex, Modal } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { encodePath } from "@/shared/utils/routeCipher";
import { usePageHeader } from "@/layouts/MainLayout/MainLayout";

import AssetTable from "./components/AssetTable";
import AssetForm from "./components/AssetForm";
import AssetToolbar from "./components/AssetToolbar";
import AssetImportModal from "./components/AssetImportModal";
import AssetQrModal from "./components/AssetQrModal";
import AssetMultiQrModal from "./components/AssetMultiQrModal";
import AssetReplacementModal from "./components/AssetReplacementModal";

import useAsset from "./hooks/useAsset";
import useAssetExcel from "./hooks/useAssetExcel";
import useAssetActions from "./hooks/useAssetActions";
import useAssetPageState from "./hooks/useAssetPageState";

import assetService from "./services/assetService";
import {
  getAssetRouteActionLabel,
  getAssetRouteGroup,
  getAssetRouteGroupLabel,
  getScopedCategoryIds,
} from "./utils/routeCategoryScope";

export default function ListAssetPage() {
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
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [replaceAsset, setReplaceAsset] = useState(null);
  const routeGroup = getAssetRouteGroup(location.pathname);

  const handleReplace = useCallback((row) => {
    setReplaceAsset(row);
    setReplaceOpen(true);
  }, []);

  const buildFilters = useCallback(
    (override = {}) => {
      const scopedCategoryIds = getScopedCategoryIds(categories, routeGroup);
      return {
        ...filters,
        ...headerFilters,
        ...(scopedCategoryIds
          ? { category_id: scopedCategoryIds }
          : {}),
        exclude_status: "DISPOSE,DISPOSED",
        ...override,
      };
    },
    [filters, headerFilters, categories, routeGroup]
  );

  const openDetail = useCallback(
    (id) => navigate("/" + encodePath(`/itam/assets/${id}`)),
    [navigate]
  );

  const openQr = useCallback((row) => {
    setQrAsset(row);
    setQrOpen(true);
  }, []);

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
  }, []);

  const handleSelectRows = useCallback((keys, rows) => {
    setSelectedRowKeys(keys);
    setSelectedRows(rows);
  }, []);

  const openMultiPrint = useCallback(() => {
    if (!selectedRows.length) {
      message.warning("Silakan pilih aset terlebih dahulu untuk mencetak label.");
      return;
    }
    setMultiOpen(true);
  }, [selectedRows]);

  const closeMultiPrint = useCallback(() => {
    setMultiOpen(false);
  }, []);

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

  useEffect(() => {
    const routeGroupLabel = getAssetRouteGroupLabel(routeGroup);
    const routeActionLabel = getAssetRouteActionLabel(location.pathname);
    const breadcrumbParts = ["Asset Management"];
    if (routeGroupLabel) breadcrumbParts.push(routeGroupLabel);
    if (routeActionLabel) breadcrumbParts.push(routeActionLabel);

    if (setHeaderBreadcrumb) setHeaderBreadcrumb(breadcrumbParts.join(" > "));
    if (setHeaderTitle) setHeaderTitle("Manajemen Aset");
    if (setHeaderSubtitle) {
      setHeaderSubtitle("Kelola, pantau, dan lacak aset IT Anda dengan mudah.");
    }
  }, [location.pathname, routeGroup, setHeaderBreadcrumb, setHeaderTitle, setHeaderSubtitle]);

  useEffect(() => {
    if (categories.length > 0) {
      reload(1, pageSize, buildFilters());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, routeGroup]);

  return (
    <div className="workspace-page">
      <Card 
        className="workspace-card" 
        variant="borderless"
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
              <AssetToolbar
                onTemplate={downloadTemplate}
                onImport={importExcel}
                onExport={() => exportExcel(rows)}
                onPrintLabels={openMultiPrint}
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
          <AssetTable
            rows={rows}
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
            onReplace={handleReplace}
            headerFilters={headerFilters}
            onHeaderFilterChange={handleHeaderFilterChange}
            contextRouteGroup={routeGroup}
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

      <AssetReplacementModal
        open={replaceOpen}
        asset={replaceAsset}
        onCancel={() => setReplaceOpen(false)}
      />
    </div>
  );
}
