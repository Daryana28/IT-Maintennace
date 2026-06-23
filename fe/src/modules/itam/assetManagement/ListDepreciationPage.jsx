import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Space, Button, message, Flex, Divider, Modal } from "antd";
import { PlusOutlined, ReloadOutlined, DownloadOutlined, UploadOutlined, PrinterOutlined, FileExcelOutlined } from "@ant-design/icons";
import { encodePath } from "@/shared/utils/routeCipher";
import { usePageHeader } from "@/layouts/MainLayout/MainLayout";

import AssetFilter from "./components/AssetFilter";
import AssetCategoryTabs from "./components/AssetCategoryTabs";
import AssetTable from "./components/AssetTable";
import AssetForm from "./components/AssetForm";
import AssetToolbar from "./components/AssetToolbar";
import AssetImportModal from "./components/AssetImportModal";
import AssetQrModal from "./components/AssetQrModal";
import AssetMultiQrModal from "./components/AssetMultiQrModal";

import useAsset from "./hooks/useAsset";
import useAssetExcel from "./hooks/useAssetExcel";
import useAssetActions from "./hooks/useAssetActions";
import useAssetCategoryTabs from "./hooks/useAssetCategoryTabs";
import useAssetPageState from "./hooks/useAssetPageState";

import assetService from "./services/assetService";
import {
  getAssetRouteActionLabel,
  getAssetRouteGroup,
  getAssetRouteGroupLabel,
  getScopedRootCategoryId,
  getScopedCategoryIds,
} from "./utils/routeCategoryScope";
import { getAssetTypeProfile } from "./utils/assetTypeProfiles";

const EXTRA_DEPRECIATION_STATUS_OPTIONS = [
  { value: "RETIRED", label: "RETIRED" },
  { value: "DISPOSE", label: "DISPOSE" },
  { value: "DISPOSED", label: "DISPOSED" },
];

function getDescendantCategoryIds(parentId, categoriesList) {
  if (!parentId) return [];
  let ids = [parentId];
  const children = categoriesList.filter((c) => String(c.parent_id) === String(parentId));
  children.forEach((child) => {
    ids = ids.concat(getDescendantCategoryIds(child.category_id, categoriesList));
  });
  return ids;
}

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

  const {
    lv1,
    lv2,
    lv3,
    lv4,
    setLv1,
    setLv2,
    setLv3,
    setLv4,
    selectedCategory,
  } = useAssetCategoryTabs();

  const { exportExcel, downloadTemplate, readExcel } = useAssetExcel();

  const [qrOpen, setQrOpen] = useState(false);
  const [qrAsset, setQrAsset] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [multiOpen, setMultiOpen] = useState(false);
  const routeGroup = getAssetRouteGroup(location.pathname);
  const scopedRootCategoryId = getScopedRootCategoryId(categories, routeGroup);
  const depreciationStatusOptions = [
    ...new Map(
      [
        ...getAssetTypeProfile(routeGroup).statusOptions,
        ...EXTRA_DEPRECIATION_STATUS_OPTIONS,
      ].map((option) => [option.value, option])
    ).values(),
  ];

  const buildFilters = useCallback(
    (override = {}) => {
      const scopedCategoryIds = getScopedCategoryIds(categories, routeGroup);
      const scopedIdList = scopedCategoryIds
        ? scopedCategoryIds.split(",").filter(Boolean)
        : [];

      let finalCategoryIds = scopedCategoryIds;

      if (selectedCategory && categories?.length) {
        const selectedCategoryIds = getDescendantCategoryIds(
          selectedCategory,
          categories
        ).map(String);

        const scopedSelection = selectedCategoryIds.filter((id) =>
          scopedIdList.includes(id)
        );

        if (scopedSelection.length > 0) {
          finalCategoryIds = scopedSelection.join(",");
        }
      }

      return {
        ...filters,
        ...headerFilters,
        has_depreciation_date: "1",
        sort_by: "depreciation_date",
        sort_order: "ASC",
        category_id: finalCategoryIds,
        ...override,
      };
    },
    [filters, headerFilters, selectedCategory, categories, routeGroup]
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

  useEffect(() => {
    if (categories.length === 0) {
      return;
    }

    reload(1, pageSize, buildFilters());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, selectedCategory, routeGroup]);

  useEffect(() => {
    setLv1("");
    setLv2("");
    setLv3("");
    setLv4("");
  }, [routeGroup, setLv1, setLv2, setLv3, setLv4]);

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
      <div className="asset-category-card" style={{ marginBottom: '16px' }}>
        <AssetCategoryTabs
          categories={categories}
          lv1={lv1}
          lv2={lv2}
          lv3={lv3}
          lv4={lv4}
          setLv1={setLv1}
          setLv2={setLv2}
          setLv3={setLv3}
          setLv4={setLv4}
          scopeRootId={scopedRootCategoryId}
        />
      </div>

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
            <AssetFilter
              keyword={headerFilters.asset_name}
              status={headerFilters.status}
              statusOptions={depreciationStatusOptions}
              onKeywordChange={(value) => handleHeaderFilterChange("asset_name", value)}
              onStatusChange={(value) => handleHeaderFilterChange("status", value)}
            />
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
            hidePlanColumns={true}
            viewOnlyActions={true}
            headerFilters={headerFilters}
            onHeaderFilterChange={handleHeaderFilterChange}
            contextRouteGroup={routeGroup}
            statusOptions={depreciationStatusOptions}
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
