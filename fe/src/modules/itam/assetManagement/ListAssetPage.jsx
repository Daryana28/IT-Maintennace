import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Space, Button, message, Flex, Modal, Tabs, Form, Select } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { encodePath } from "@/shared/utils/routeCipher";
import { usePageHeader } from "@/layouts/MainLayout/MainLayout";
import dayjs from "dayjs";

import AssetTable from "./components/AssetTable";
import AssetForm from "./components/AssetForm";
import AssetToolbar from "./components/AssetToolbar";
import AssetImportModal from "./components/AssetImportModal";
import AssetQrModal from "./components/AssetQrModal";
import AssetMultiQrModal from "./components/AssetMultiQrModal";
import AssetReplacementModal from "./components/AssetReplacementModal";
import RenewalModal from "./components/RenewalModal";

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
  resolveImportCategory,
} from "./utils/assetWorkbookTabs";

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
    loadCategories,
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
  const [replaceDate, setReplaceDate] = useState("");
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [timelineSaving, setTimelineSaving] = useState(false);
  const [timelineContext, setTimelineContext] = useState(null);
  const [activeWorkbookTab, setActiveWorkbookTab] = useState("");
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewAsset, setRenewAsset] = useState(null);
  const [renewSaving, setRenewSaving] = useState(false);
  const [timelineForm] = Form.useForm();
  const routeGroup = getAssetRouteGroup(location.pathname);
  const isSoftwareRoute = routeGroup === "software-hardware";
  const workbookTabs = getAssetWorkbookTabs(routeGroup);
  const safeRows = useMemo(
    () => (Array.isArray(rows) ? rows.filter(Boolean) : []),
    [rows]
  );

  const routeScopedRows = useMemo(
    () =>
      safeRows.filter((row) =>
        assetBelongsToRouteGroup(row, categories, routeGroup)
      ),
    [safeRows, categories, routeGroup]
  );

  const displayedRows = workbookTabs.length > 0 && activeWorkbookTab
    ? safeRows
    : routeScopedRows;
  const activeTabDefaultCategoryId = activeWorkbookTab
    ? (
      getWorkbookTabCategoryIds(categories, routeGroup, activeWorkbookTab)[0] ||
      displayedRows.find((row) => row.category_id || row.category?.category_id)?.category_id ||
      displayedRows.find((row) => row.category_id || row.category?.category_id)?.category?.category_id ||
      null
    )
    : null;

  const handleReplace = useCallback((row) => {
    setReplaceAsset(row);
    setReplaceDate(row?.depreciation_date || dayjs().format("YYYY-MM-DD"));
    setReplaceOpen(true);
  }, []);

  const handleRenew = useCallback((row) => {
    setRenewAsset(row);
    setRenewOpen(true);
  }, []);

  const closeRenewModal = useCallback(() => {
    setRenewOpen(false);
    setRenewAsset(null);
  }, []);


  const closeTimelineModal = useCallback(() => {
    setTimelineModalOpen(false);
    setTimelineContext(null);
    timelineForm.resetFields();
  }, [timelineForm]);

  const buildFilters = useCallback(
    (override = {}) => {
      const scopedCategoryIds = getScopedCategoryIds(categories, routeGroup);
      const activeTabCategoryIds = activeWorkbookTab
        ? getWorkbookTabCategoryIds(categories, routeGroup, activeWorkbookTab)
        : [];
      const resolvedCategoryId = activeTabCategoryIds.length > 0
        ? activeTabCategoryIds.join(",")
        : scopedCategoryIds;

      return {
        ...filters,
        ...headerFilters,
        ...(resolvedCategoryId
          ? { category_id: resolvedCategoryId }
          : {}),
        ...(activeWorkbookTab
          ? { workbook_tab: activeWorkbookTab }
          : {}),
        exclude_status: "DISPOSE,DISPOSED",
        sort_by: "purchase_date",
        sort_order: "ASC",
        ...override,
      };
    },
    [filters, headerFilters, categories, routeGroup, activeWorkbookTab]
  );

  const submitRenewal = useCallback(async (payload) => {
    if (!renewAsset?.asset_id) return;

    setRenewSaving(true);
    try {
      await assetService.renew(renewAsset.asset_id, payload);
      message.success("Renewal license berhasil disimpan.");
      closeRenewModal();
      await reload(1, pageSize, buildFilters());
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || "Gagal menyimpan renewal license.");
    } finally {
      setRenewSaving(false);
    }
  }, [renewAsset, closeRenewModal, reload, pageSize, buildFilters]);

  const openDetail = useCallback(
    (id) => navigate("/" + encodePath(`/itam/assets/${id}`)),
    [navigate]
  );

  const openQr = useCallback((row) => {
    setQrAsset(row);
    setQrOpen(true);
  }, []);

  const handleDepreciationClick = useCallback((record, markers = [], cell = {}) => {
    const defaultStatus = markers.some((marker) => marker.type === "replace")
      ? "replace"
      : "planning";

    setTimelineContext({
      record,
      markers,
      year: cell.year,
      month: cell.month,
    });

    timelineForm.setFieldsValue({
      target_status: defaultStatus,
    });

    setTimelineModalOpen(true);
  }, [timelineForm]);

  const handleTimelineSubmit = useCallback(async () => {
    if (!timelineContext?.record?.asset_id) return;

    const { target_status: targetStatus } = await timelineForm.validateFields();
    const targetDate = dayjs(`${timelineContext.year}-${String(timelineContext.month).padStart(2, "0")}-01`);

    if (targetStatus === "replace") {
      setReplaceAsset(timelineContext.record);
      setReplaceDate(targetDate.format("YYYY-MM-DD"));
      setReplaceOpen(true);
      setTimelineModalOpen(false);
      return;
    }

    const payload = {};
    if (targetStatus === "planning") {
      payload.depreciation_date = targetDate.format("YYYY-MM-DD");
      payload.status = "ACTIVE";
    }

    setTimelineSaving(true);
    try {
      await assetService.update(timelineContext.record.asset_id, {
        ...timelineContext.record,
        ...payload,
      });
      message.success("Timeline asset berhasil diperbarui.");
      closeTimelineModal();
      await reload(1, pageSize, buildFilters());
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || "Gagal memperbarui timeline asset.");
    } finally {
      setTimelineSaving(false);
    }
  }, [buildFilters, closeTimelineModal, pageSize, reload, timelineContext, timelineForm]);

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
    loadCategories,
    setPreviewRows,
    setPreviewOpen,
    previewRows,
  });

  const importExcel = useCallback(async (file) => {
    try {
      const rows = await readExcel(file);
      const activeTabCategoryIds = activeWorkbookTab
        ? getWorkbookTabCategoryIds(categories, routeGroup, activeWorkbookTab)
        : [];
      const activeTabFallbackCategory = activeTabCategoryIds.length
        ? categories.find((item) => String(item.category_id) === String(activeTabCategoryIds[0]))
        : null;

      const normalizedRows = rows.map((row) => {
        const resolvedCategory = resolveImportCategory(categories, row, routeGroup);
        const finalCategoryId =
          row.category_id ||
          resolvedCategory.category_id ||
          activeTabFallbackCategory?.category_id ||
          null;
        const finalCategoryName =
          resolvedCategory.category_name ||
          activeTabFallbackCategory?.category_name ||
          row.category_name ||
          "";
        const fallbackImportType =
          row.TYPE ||
          row.type ||
          finalCategoryName ||
          row.type_code ||
          row["TYPE CODE"] ||
          row.__sheet_name ||
          "";

        return {
          ...row,
          category_id: finalCategoryId,
          category_name: finalCategoryName,
          TYPE: fallbackImportType,
          type: fallbackImportType,
        };
      });

      setPreviewRows(normalizedRows);
      setPreviewOpen(true);
    } catch {
      message.error("Gagal membaca file Excel.");
    }
    return false; // Prevent auto upload
  }, [readExcel, setPreviewRows, setPreviewOpen, categories, routeGroup, activeWorkbookTab]);

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
    void (async () => {
      await loadCategories();
      await reload(page, pageSize, buildFilters());
    })();
  }, [loadCategories, reload, page, pageSize, buildFilters]);

  const handleDeleteAllActiveTab = useCallback(async () => {
    const mappedTabCategoryIds = activeWorkbookTab
      ? getWorkbookTabCategoryIds(categories, routeGroup, activeWorkbookTab)
      : [];
    const visibleTabCategoryIds = displayedRows
      .map((row) => row.category_id || row.category?.category_id)
      .filter(Boolean)
      .map((id) => String(id));
    const activeTabCategoryIds = Array.from(
      new Set(
        (mappedTabCategoryIds.length ? mappedTabCategoryIds : visibleTabCategoryIds)
      )
    );

    if (!activeTabCategoryIds.length) {
      message.warning("Kategori untuk tab aktif tidak ditemukan.");
      return;
    }

    try {
      await assetService.bulkDeleteByCategories(activeTabCategoryIds);
      message.success("Semua data pada tab aktif berhasil dihapus.");
      await loadCategories();
      await reload(1, pageSize, buildFilters());
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Gagal menghapus data tab aktif.";
      message.error(errorMessage);
    }
  }, [activeWorkbookTab, categories, routeGroup, displayedRows, loadCategories, reload, pageSize, buildFilters]);

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
                onTemplate={() => downloadTemplate({ routeGroup, activeTabKey: activeWorkbookTab })}
                onImport={importExcel}
                onExport={() => exportExcel(rows, { categories, routeGroup })}
                onPrintLabels={openMultiPrint}
                showPrintLabels={false}
                onDeleteAll={handleDeleteAllActiveTab}
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
            onReplace={handleReplace}
            onRenew={handleRenew}
            headerFilters={headerFilters}
            onHeaderFilterChange={handleHeaderFilterChange}
            contextRouteGroup={routeGroup}
            showTimelineLegend={!isSoftwareRoute}
            hidePlanColumns={isSoftwareRoute}
            workbookTabKey={activeWorkbookTab}
          />
        </div>
      </Card>

      <AssetForm
        open={open}
        initialValues={editing}
        categories={categories}
        routeGroup={routeGroup}
        workbookTabKey={activeWorkbookTab}
        defaultCategoryId={activeTabDefaultCategoryId}
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

      <RenewalModal
        open={renewOpen}
        asset={renewAsset}
        loading={renewSaving}
        onCancel={closeRenewModal}
        onSubmit={submitRenewal}
      />

      <AssetReplacementModal
        open={replaceOpen}
        asset={replaceAsset}
        replacementDate={replaceDate}
        onCancel={() => {
          setReplaceOpen(false);
          setReplaceAsset(null);
          setReplaceDate("");
        }}
        onSuccess={async () => {
          setReplaceOpen(false);
          setReplaceAsset(null);
          setReplaceDate("");
          await reload(1, pageSize, buildFilters());
        }}
      />

      <Modal
        title="Ubah Status Timeline Asset"
        open={timelineModalOpen}
        onCancel={closeTimelineModal}
        onOk={handleTimelineSubmit}
        okText="Simpan"
        cancelText="Batal"
        confirmLoading={timelineSaving}
        destroyOnHidden
      >
        <Form form={timelineForm} layout="vertical">
          <Form.Item label="No Asset">
            <div>{timelineContext?.record?.asset_code || "-"}</div>
          </Form.Item>
          <Form.Item label="Marker Saat Ini">
            <div>{timelineContext?.markers?.map((marker) => marker.label).join(", ") || "-"}</div>
          </Form.Item>
          <Form.Item label="Periode">
            <div>
              {timelineContext?.month || "-"} / {timelineContext?.year || "-"}
            </div>
          </Form.Item>
          <Form.Item
            label="Status Timeline"
            name="target_status"
            rules={[{ required: true, message: "Pilih status timeline." }]}
          >
            <Select
              options={[
                { value: "planning", label: "Planning" },
                { value: "replace", label: "Replace" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
