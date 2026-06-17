import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export default function ListDepreciationPage() {
  const navigate = useNavigate();
  const { setHeaderTitle, setHeaderSubtitle } = usePageHeader() || {};

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
    keyword,
    setKeyword,
    status,
    setStatus,
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

  const getDescendantCategoryIds = useCallback((parentId, categoriesList) => {
    if (!parentId) return [];
    let ids = [parentId];
    const children = categoriesList.filter((c) => String(c.parent_id) === String(parentId));
    children.forEach((child) => {
      ids = ids.concat(getDescendantCategoryIds(child.category_id, categoriesList));
    });
    return ids;
  }, []);

  const buildFilters = useCallback(
    (override = {}) => {
      let categoryIds = selectedCategory;
      if (selectedCategory && categories?.length) {
        categoryIds = getDescendantCategoryIds(selectedCategory, categories).join(",");
      }
      return {
        ...filters,
        search: keyword,
        status: status || "DISPOSE,DISPOSED",
        category_id: categoryIds,
        ...override,
      };
    },
    [filters, keyword, status, selectedCategory, categories, getDescendantCategoryIds]
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

  const handleKeywordChange = useCallback((value) => {
    setKeyword(value);
    reload(1, pageSize, buildFilters({ search: value }));
  }, [reload, pageSize, buildFilters, setKeyword]);

  const handleStatusChange = useCallback((value) => {
    setStatus(value);
    reload(1, pageSize, buildFilters({ status: value || "DISPOSE,DISPOSED" }));
  }, [reload, pageSize, buildFilters, setStatus]);

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
    reload(1, pageSize, buildFilters());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  useEffect(() => {
    if (setHeaderTitle) setHeaderTitle("List Depresiasi");
    if (setHeaderSubtitle) {
      setHeaderSubtitle("Monitor umur aset dan jadwal disposal / replacement.");
    }
  }, [setHeaderTitle, setHeaderSubtitle]);

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
          justify="space-between" 
          align="center" 
          wrap="wrap" 
          gap="middle" 
          style={{ marginBottom: '24px' }}
        >
          <div className="workspace-filter-area" style={{ flex: '1 1 300px' }}>
            <AssetFilter
              keyword={keyword}
              status={status}
              onKeywordChange={handleKeywordChange}
              onStatusChange={handleStatusChange}
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
          />
        </div>
      </Card>

      <AssetForm
        open={open}
        initialValues={editing}
        categories={categories}
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
