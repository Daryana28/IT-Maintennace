import { useState, useCallback, useEffect, useMemo } from "react";
import { Card, Space, Button, Flex, DatePicker, Modal, Form, Select, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { usePageHeader } from "@/layouts/MainLayout/MainLayout";
import dayjs from "dayjs";

import AssetTable from "./components/AssetTable";
import AssetReplacementModal from "./components/AssetReplacementModal";

import useAsset from "./hooks/useAsset";
import assetService from "./services/assetService";
import {
  getAssetRouteActionLabel,
  getAssetRouteGroup,
  getAssetRouteGroupLabel,
  assetBelongsToRouteGroup,
  getScopedCategoryIds,
} from "./utils/routeCategoryScope";

export default function ScheduleAssetPage() {
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
  } = useAsset();
  const [headerFilters, setHeaderFilters] = useState({
    asset_code: "",
    asset_name: "",
    type: "",
    division: "",
    department: "",
    owner_name: "",
    nik: "",
    purchase_date: "",
    depreciation_date: "",
    hostname: "",
    ip_main: "",
    ip_backup: "",
    status: "",
  });
  const [filterDate, setFilterDate] = useState(null);
  const [filterYear, setFilterYear] = useState(null);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [timelineSaving, setTimelineSaving] = useState(false);
  const [timelineContext, setTimelineContext] = useState(null);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [replaceAsset, setReplaceAsset] = useState(null);
  const [timelineForm] = Form.useForm();
  const routeGroup = getAssetRouteGroup(location.pathname);

  const sortedRows = useMemo(() => {
    const scopedRows = (rows || []).filter((row) =>
      assetBelongsToRouteGroup(row, categories, routeGroup)
    );

    return [...scopedRows].sort((a, b) => {
      const typeA = a.category?.category_name || "";
      const typeB = b.category?.category_name || "";
      const typeCompare = typeA.localeCompare(typeB);
      
      if (typeCompare !== 0) return typeCompare;

      if (!a.depreciation_date && !b.depreciation_date) return 0;
      if (!a.depreciation_date) return 1;
      if (!b.depreciation_date) return -1;
      
      const dateA = new Date(a.depreciation_date).getTime();
      const dateB = new Date(b.depreciation_date).getTime();
      return dateA - dateB;
    });
  }, [rows]);

  const displayedRows = useMemo(() => {
    let result = sortedRows;
    if (filterDate) {
      const dateStr = filterDate.format("YYYY-MM-DD");
      result = result.filter(row => row.depreciation_date === dateStr);
    }
    if (filterYear) {
      const yearStr = filterYear.format("YYYY");
      result = result.filter(row => row.depreciation_date && row.depreciation_date.startsWith(yearStr));
    }
    return result;
  }, [sortedRows, filterDate, filterYear]);

  const handleTableChange = useCallback((pagination) => {
    const scopedCategoryIds = getScopedCategoryIds(categories, routeGroup);
    reload(
      pagination.current,
      pagination.pageSize,
      { ...filters, ...headerFilters, ...(scopedCategoryIds ? { category_id: scopedCategoryIds } : {}) }
    );
  }, [reload, filters, headerFilters, categories, routeGroup]);

  const handleHeaderFilterChange = useCallback((field, value) => {
    const scopedCategoryIds = getScopedCategoryIds(categories, routeGroup);
    setHeaderFilters((prev) => ({ ...prev, [field]: value }));
    reload(1, pageSize, {
      ...filters,
      ...headerFilters,
      ...(scopedCategoryIds ? { category_id: scopedCategoryIds } : {}),
      [field]: value,
    });
  }, [reload, pageSize, filters, headerFilters, categories, routeGroup]);

  const buildScopedFilters = useCallback(() => {
    const scopedCategoryIds = getScopedCategoryIds(categories, routeGroup);
    return {
      ...filters,
      ...headerFilters,
      ...(scopedCategoryIds ? { category_id: scopedCategoryIds } : {}),
    };
  }, [categories, filters, headerFilters, routeGroup]);

  const closeTimelineModal = useCallback(() => {
    setTimelineModalOpen(false);
    setTimelineContext(null);
    timelineForm.resetFields();
  }, [timelineForm]);

  const handleTimelineClick = useCallback((record, markers = [], cell = {}) => {
    const defaultStatus = markers.some((marker) => marker.type === "replace")
      ? "replace"
      : markers.some((marker) => marker.type === "planning")
      ? "planning"
      : "new";

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
      setReplaceOpen(true);
      setTimelineModalOpen(false);
      return;
    }

    const payload = {};
    if (targetStatus === "new") {
      payload.purchase_date = targetDate.format("YYYY-MM-DD");
      payload.depreciation_date = targetDate.add(6, "year").format("YYYY-MM-DD");
      payload.status = "ACTIVE";
    }

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
      await reload(1, pageSize, buildScopedFilters());
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || "Gagal memperbarui timeline asset.");
    } finally {
      setTimelineSaving(false);
    }
  }, [buildScopedFilters, closeTimelineModal, pageSize, reload, timelineContext, timelineForm]);

  useEffect(() => {
    const routeGroupLabel = getAssetRouteGroupLabel(routeGroup);
    const routeActionLabel = getAssetRouteActionLabel(location.pathname);
    const breadcrumbParts = ["Asset Management"];
    if (routeGroupLabel) breadcrumbParts.push(routeGroupLabel);
    if (routeActionLabel) breadcrumbParts.push(routeActionLabel);

    if (setHeaderBreadcrumb) setHeaderBreadcrumb(breadcrumbParts.join(" > "));
    if (setHeaderTitle) setHeaderTitle("Jadwal Aset");
    if (setHeaderSubtitle) {
      setHeaderSubtitle("Pantau jadwal pemeliharaan dan pergerakan aset.");
    }
  }, [location.pathname, routeGroup, setHeaderBreadcrumb, setHeaderTitle, setHeaderSubtitle]);

  useEffect(() => {
    const scopedCategoryIds = getScopedCategoryIds(categories, routeGroup);
    if (categories.length > 0) {
      reload(1, pageSize, {
        ...buildScopedFilters(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, routeGroup, buildScopedFilters]);

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


        <Flex gap="middle" style={{ marginBottom: '16px' }} align="center" wrap="wrap">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#8c8c8c' }}>FILTER TANGGAL</span>
            <DatePicker 
              placeholder="Pilih Tanggal" 
              onChange={(date) => setFilterDate(date)} 
              format="YYYY-MM-DD"
              allowClear
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#8c8c8c' }}>FILTER TAHUN</span>
            <DatePicker 
              picker="year" 
              placeholder="Pilih Tahun" 
              onChange={(date) => setFilterYear(date)} 
              allowClear
            />
          </div>
        </Flex>

        <div className="workspace-table-container">
          <AssetTable
            rows={displayedRows}
            categories={categories}
            loading={loading}
            page={page}
            pageSize={pageSize}
            total={total}
            onChange={handleTableChange}
            headerFilters={headerFilters}
            onHeaderFilterChange={handleHeaderFilterChange}
            hideActionColumn={true}
            hideIpAndStatus={true}
            contextRouteGroup={routeGroup}
            onDepreciationClick={handleTimelineClick}
          />
        </div>
      </Card>

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
                { value: "new", label: "New" },
                { value: "planning", label: "Planning" },
                { value: "replace", label: "Replace" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <AssetReplacementModal
        open={replaceOpen}
        asset={replaceAsset}
        onCancel={() => {
          setReplaceOpen(false);
          setReplaceAsset(null);
        }}
        onSuccess={async () => {
          setReplaceOpen(false);
          setReplaceAsset(null);
          await reload(1, pageSize, buildScopedFilters());
        }}
      />
    </div>
  );
}
