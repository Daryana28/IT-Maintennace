import React, { useState, useCallback } from "react";
import { Card, Table, Form, message, Row, Col, Statistic, Tabs, Empty, Button } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useRBACStore } from "@/app/store/rbacStore";

import dayjs from "dayjs";
import "./MaintenanceSchedulePage.css";
import maintenanceScheduleService from "./services/maintenanceScheduleService";
import useScheduleData from "./hooks/useScheduleData";
import { useMaintenanceColumns } from "./hooks/useMaintenanceColumns";
import { filterAssetsByCategory } from "./utils/tableHelpers";
import SchedulePageHeader from "./components/SchedulePageHeader";
import ScheduleFilterBar from "./components/ScheduleFilterBar";
import ScheduleFormModal from "./components/ScheduleFormModal";
import CopyScheduleModal from "./components/CopyScheduleModal";
import CancelScheduleModal from "./components/CancelScheduleModal";
import HolidayModal from "./components/HolidayModal";

export default function MaintenanceSchedulePage() {
  const [viewMode, setViewMode] = useState("monthly");
  const [activeTab, setActiveTab] = useState("utama");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  
  const hasRole = useRBACStore((state) => state.hasRole);
  const isReadOnly = !hasRole("ADMIN");

  const {
    schedules,
    loading,
    holidays,
    standards,
    currentDate,
    days,
    activeYearId,
    setCurrentDate,
    loadHolidays,
    reload,
  } = useScheduleData(viewMode);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isManualCreateMode, setIsManualCreateMode] = useState(false);
  const [editScheduleId, setEditScheduleId] = useState(null);
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [assets, setAssets] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [form] = Form.useForm();

  const [isCopyModalVisible, setIsCopyModalVisible] = useState(false);
  const [copySourceSMId, setCopySourceSMId] = useState(null);
  const [copyTargetLevel, setCopyTargetLevel] = useState("jenis");
  const [copyTargetValue, setCopyTargetValue] = useState(null);

  const [isHolidayModalVisible, setIsHolidayModalVisible] = useState(false);
  const [holidayForm] = Form.useForm();
  const [holidayLoading, setHolidayLoading] = useState(false);

  const [cancelModal, setCancelModal] = useState({ open: false, scheduleId: null, reason: "" });

  const isHolidayOrWeekend = useCallback(
    (dateObj) => {
      if (dateObj.day() === 0 || dateObj.day() === 6) return true;
      const dtStr = dateObj.format("YYYY-MM-DD");
      return holidays.some((h) => h.holiday_date === dtStr);
    },
    [holidays]
  );

  const handleSync = useCallback(async () => {
    try {
      if (!activeYearId) {
        message.warning("Belum ada konfigurasi Standard Maintenance tahunan.");
        return;
      }
      const res = await maintenanceScheduleService.generateSchedule(activeYearId);
      message.success(res.message || "Berhasil sinkronisasi standard maintenance");
      reload();
    } catch (e) {
      message.error(e.response?.data?.message || "Gagal sinkronisasi standard maintenance");
    }
  }, [activeYearId, reload]);

  const handleExport = useCallback(() => {
    import("./utils/exportPdf").then(({ exportPDF }) => {
      exportPDF(schedules, viewMode, message);
    });
  }, [schedules, viewMode]);

  const handleDropReschedule = useCallback(
    async (scheduleIdsStr, newDateStr) => {
      try {
        const ids = String(scheduleIdsStr).split(",");
        await Promise.all(
          ids.map((id) =>
            maintenanceScheduleService.updateSchedule(id, {
              next_maintenance_date: newDateStr,
            })
          )
        );
        message.success("Berhasil memindahkan jadwal");
        reload();
      } catch (err) {
        console.error(err);
        message.error("Gagal memindahkan jadwal");
      }
    },
    [reload]
  );

  const handleToggleChecklist = useCallback(
    async (scheduleIds = [], shouldComplete = true) => {
      if (!Array.isArray(scheduleIds) || scheduleIds.length === 0) return;

      try {
        await Promise.all(
          scheduleIds.map((id) =>
            maintenanceScheduleService.updateSchedule(id, {
              status: shouldComplete ? "COMPLETED" : "PENDING",
            })
          )
        );
        message.success(shouldComplete ? "Checklist diperbarui" : "Checklist dibuka kembali");
        reload();
      } catch (error) {
        console.error(error);
        message.error(error.response?.data?.message || "Gagal memperbarui checklist");
      }
    },
    [reload]
  );

  const applyStandardToForm = useCallback(
    (standardId, assetPool = allAssets) => {
      const selectedStandard = standards.find((item) => item.id === standardId);
      if (!selectedStandard) return;

      const leafName =
        selectedStandard.subKategori ||
        selectedStandard.kategori ||
        selectedStandard.namaPerangkat ||
        "";

      const { assets: filteredAssets } = filterAssetsByCategory(assetPool, leafName);
      const activeAssets = filteredAssets.filter(
        (asset) => asset.status && asset.status.toLowerCase() === "active"
      );

      const defaultPeriodik =
        selectedStandard.details?.[0]?.pengecekanList?.[0]?.periodik
          ? selectedStandard.details[0].pengecekanList[0].periodik
              .trim()
              .split(/\s+/)
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(" ")
          : "1 Bulan";

      setAssets(activeAssets);
      setSelectedAssetIds([]);
      form.setFieldsValue({
        asset_ids: [],
        periodik: defaultPeriodik,
      });
    },
    [allAssets, form, standards]
  );

  const openCreateScheduleModal = useCallback(async () => {
    try {
      const { default: assetService } = await import("./../assetManagement/services/assetService");
      const assetData = await assetService.getAll({ pageSize: 1000 });
      const activeAssets = (assetData?.data || []).filter(
        (asset) => asset.status && asset.status.toLowerCase() === "active"
      );

      setAllAssets(activeAssets);
      setAssets(activeAssets);
      setIsManualCreateMode(true);
      setIsEditMode(false);
      setEditScheduleId(null);
      setIsSplitMode(false);
      setSelectedAssetIds([]);
      form.resetFields();
      form.setFieldsValue({
        asset_ids: [],
        periodik: "1 Bulan",
      });
      setIsModalVisible(true);
    } catch (error) {
      console.error(error);
      message.error("Gagal memuat data asset");
    }
  }, [form]);

  const handleCancelSchedule = useCallback(async () => {
    try {
      const ids = String(cancelModal.scheduleId).split(",");
      await Promise.all(
        ids.map((id) =>
          maintenanceScheduleService.cancelSchedule(id, cancelModal.reason)
        )
      );
      message.success("Jadwal berhasil dibatalkan");
      setCancelModal({ open: false, scheduleId: null, reason: "" });
      reload();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Gagal membatalkan jadwal");
    }
  }, [cancelModal, reload]);

  const handleAddHoliday = useCallback(
    async (values) => {
      try {
        setHolidayLoading(true);
        const { default: holidaySvc } = await import("./services/holidayService");
        await holidaySvc.create({
          holiday_date: values.holiday_date.format("YYYY-MM-DD"),
          description: values.description,
          holiday_type: values.holiday_type || "NATIONAL_HOLIDAY",
        });
        message.success("Berhasil menambahkan hari libur");
        holidayForm.resetFields();
        loadHolidays();
      } catch (error) {
        console.error(error);
        message.error(error.response?.data?.message || "Gagal menambahkan hari libur");
      } finally {
        setHolidayLoading(false);
      }
    },
    [holidayForm, loadHolidays]
  );

  const handleDeleteHoliday = useCallback(
    async (id) => {
      try {
        setHolidayLoading(true);
        const { default: holidaySvc } = await import("./services/holidayService");
        await holidaySvc.delete(id);
        message.success("Hari libur berhasil dihapus");
        loadHolidays();
      } catch (error) {
        console.error(error);
        message.error("Gagal menghapus hari libur");
      } finally {
        setHolidayLoading(false);
      }
    },
    [loadHolidays]
  );

  const handleCopySchedule = useCallback(async () => {
    if (!copyTargetValue) {
      message.warning("Pilih tujuan penyalinan");
      return;
    }
    try {
      const sourceItems = schedules.filter(
        (s) => s.sm_id === copySourceSMId && s.schedules && s.schedules.length > 0
      );
      
      let allDates = [];
      let sourceAssetIds = [];
      sourceItems.forEach((item) => {
        item.schedules.forEach((sch) => {
          if (sch.status !== "CANCELLED") {
            if (sch.asset_id) sourceAssetIds.push(sch.asset_id);
            if (sch.next_maintenance_date) {
              allDates.push(dayjs(sch.next_maintenance_date).format("YYYY-MM-DD"));
            }
          }
        });
      });
      
      const uniqueDates = [...new Set(allDates)].sort();
      const activeAssets = [...new Set(sourceAssetIds)];

      if (uniqueDates.length === 0 || activeAssets.length === 0) {
        message.warning("Tidak ada jadwal atau aset aktif di sumber untuk disalin");
        return;
      }

      let targetSMs = [];
      if (copyTargetLevel === "jenis") {
        const sm = standards.find((s) => s.id === copyTargetValue);
        if (sm) targetSMs.push(sm);
      } else if (copyTargetLevel === "perangkat") {
        targetSMs = standards.filter((s) => s.namaPerangkat === copyTargetValue);
      } else if (copyTargetLevel === "subkategori") {
        targetSMs = standards.filter((s) => s.subKategori === copyTargetValue);
      }

      if (targetSMs.length === 0) {
        message.error("Target SM tidak ditemukan");
        return;
      }

      let totalSuccess = 0;

      const promises = targetSMs.map(async (targetSM) => {

        const formattedDates = {};
        let dateIndex = 0;
        for (let i = 0; i < activeAssets.length; i++) {
          let assignDate = dayjs(uniqueDates[dateIndex]);
          while (isHolidayOrWeekend(assignDate)) {
            assignDate = assignDate.add(1, "day");
          }
          formattedDates[activeAssets[i]] = assignDate.format("YYYY-MM-DD");
          dateIndex = (dateIndex + 1) % uniqueDates.length;
        }

        let targetPeriodik = "1 Bulan";
        if (targetSM.details?.[0]?.pengecekanList?.[0]?.periodik) {
          targetPeriodik = targetSM.details[0].pengecekanList[0].periodik;
        }

        const payload = {
          asset_ids: activeAssets,
          standard_maintenance_id: targetSM.id,
          yearly_standard_id: activeYearId,
          periodik: targetPeriodik,
          asset_dates: formattedDates,
        };

        await maintenanceScheduleService.createSchedule(payload);
        totalSuccess++;
      });

      await Promise.all(promises);

      if (totalSuccess > 0) {
        message.success(`Berhasil menyalin jadwal ke ${totalSuccess} jenis perangkat`);
      } else {
        message.warning("Tidak ada jadwal yang disalin");
      }

      setIsCopyModalVisible(false);
      setCopySourceSMId(null);
      setCopyTargetValue(null);
      setCopyTargetLevel("jenis");
      reload();
    } catch (e) {
      console.error(e);
      message.error(e.response?.data?.message || "Gagal menyalin jadwal");
    }
  }, [copySourceSMId, copyTargetLevel, copyTargetValue, schedules, standards, activeYearId, isHolidayOrWeekend, reload]);

  const displaySchedules = schedules.filter(s => {
    const isClient = s.kategori && s.kategori.toLowerCase().includes("client");
    const matchTab = activeTab === "client" ? isClient : !isClient;
    const matchCategory = selectedCategory === "Semua" || s.subKategori === selectedCategory;
    
    let matchSchedule = true;
    
    return matchTab && matchCategory && matchSchedule;
  });

  const availableCategories = [...new Set(schedules
    .filter(s => {
      const isClient = s.kategori && s.kategori.toLowerCase().includes("client");
      return activeTab === "client" ? isClient : !isClient;
    })
    .map(s => s.subKategori)
    .filter(Boolean)
  )].sort();

  const activeColumns = useMaintenanceColumns({
    schedules: displaySchedules,
    days,
    viewMode,
    currentDate,
    holidays,
    handleDropReschedule,
    setCopySourceSMId,
    setIsCopyModalVisible,
    setEditScheduleId,
    setIsEditMode,
    form,
    setIsModalVisible,
    setActiveYearId: () => { },
    setAssets,
    setSelectedAssetIds,
    setCancelModal,
    setLoading: () => { },
    isReadOnly,
    handleToggleChecklist,
  });

  // Calculate statistics
  let totalTasks = displaySchedules.length;
  let totalScheduled = 0;
  let totalCompleted = 0;
  let totalPending = 0;

  displaySchedules.forEach((row) => {
    if (row.schedules && row.schedules.length > 0) {
      row.schedules.forEach((sch) => {
        totalScheduled++;
        if (sch.status === "COMPLETED") totalCompleted++;
        else if (sch.status !== "CANCELLED") totalPending++;
      });
    }
  });

  return (
    <div className="maintenance-schedule-page fade-in">
      {/* HEADER SECTION */}
      <SchedulePageHeader
        loading={loading}
        onExport={handleExport}
        onHoliday={() => setIsHolidayModalVisible(true)}
        onSync={handleSync}
        onRefresh={reload}
        isReadOnly={isReadOnly}
      />

      <Card variant="borderless" className="premium-content-card glass-effect">
        {/* FILTER BAR SECTION */}
        <ScheduleFilterBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          categories={availableCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onSearch={() => { }}
          onReset={() => {
            setSelectedCategory("Semua");
            // Bisa juga panggil reload() jika perlu memuat ulang data dari server
            // reload();
          }}
        />

        {/* STATISTIC SECTION */}
        <div style={{ marginBottom: 24, marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card size="small" variant="borderless" style={{ background: 'rgba(24, 144, 255, 0.05)', borderLeft: '4px solid #1890ff', borderRadius: '4px 8px 8px 4px' }}>
                <Statistic title={<span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Item Pengecekan</span>} value={totalTasks} styles={{ content: { color: '#1890ff', fontWeight: 'bold' } }} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" variant="borderless" style={{ background: 'rgba(250, 140, 22, 0.05)', borderLeft: '4px solid #fa8c16', borderRadius: '4px 8px 8px 4px' }}>
                <Statistic title={<span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Total Jadwal</span>} value={totalScheduled} styles={{ content: { color: '#fa8c16', fontWeight: 'bold' } }} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" variant="borderless" style={{ background: 'rgba(82, 196, 26, 0.05)', borderLeft: '4px solid #52c41a', borderRadius: '4px 8px 8px 4px' }}>
                <Statistic title={<span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Selesai</span>} value={totalCompleted} styles={{ content: { color: '#52c41a', fontWeight: 'bold' } }} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" variant="borderless" style={{ background: 'rgba(250, 173, 20, 0.05)', borderLeft: '4px solid #faad14', borderRadius: '4px 8px 8px 4px' }}>
                <Statistic title={<span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Menunggu</span>} value={totalPending} styles={{ content: { color: '#faad14', fontWeight: 'bold' } }} />
              </Card>
            </Col>
          </Row>
        </div>

        {/* TABS SECTION */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            { key: "utama", label: "Perangkat Utama" },
            { key: "client", label: "Perangkat Client" }
          ]}
          style={{ marginBottom: 16 }}
        />

        <div className="maintenance-excel__legend">
          <span className="maintenance-excel__legend-title">Legend:</span>
          <span className="maintenance-excel__legend-item">
            <span className="maintenance-excel__legend-box is-checked"><CheckOutlined /></span>
            Aktual
          </span>
          <span className="maintenance-excel__legend-item">
            <span className="maintenance-excel__legend-box is-pending" />
            Plan
          </span>
          <span className="maintenance-excel__legend-item">
            <span className="maintenance-excel__legend-box is-weekend" />
            Weekend
          </span>
          <span className="maintenance-excel__legend-item">
            <span className="maintenance-excel__legend-box is-holiday" />
            Holiday
          </span>
        </div>

        {/* GANTT TABLE SECTION */}
        {displaySchedules.length === 0 ? (
          <div className="maintenance-excel__empty">
            <Empty
              description="Belum ada jadwal maintenance"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {!isReadOnly && (
                <Button type="primary" className="action-btn-primary" onClick={openCreateScheduleModal}>
                  Tambah Jadwal
                </Button>
              )}
            </Empty>
          </div>
        ) : (
          <Table
            loading={loading}
            columns={activeColumns}
            dataSource={displaySchedules}
            pagination={{
              total: displaySchedules.length,
              showTotal: (total) => (
                <span className="pagination-total">Total {total} baris</span>
              ),
              pageSize: 20,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
            }}
            bordered
            size="middle"
            scroll={{ x: "max-content", y: "calc(100vh - 400px)" }}
            className="premium-gantt-table"
          />
        )}
      </Card>

      {/* MODALS SECTION */}
      <ScheduleFormModal
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsManualCreateMode(false);
          setIsEditMode(false);
          setEditScheduleId(null);
          setIsSplitMode(false);
          setSelectedAssetIds([]);
          form.resetFields();
        }}
        onOk={() => {
          form.validateFields().then(async (values) => {
            try {
              const payload = {
                ...values,
                yearly_standard_id: activeYearId,
                next_maintenance_date: values.next_maintenance_date_range && values.next_maintenance_date_range[0]
                  ? values.next_maintenance_date_range[0].format("YYYY-MM-DD HH:mm:ss")
                  : null,
                next_maintenance_end_date: values.next_maintenance_date_range && values.next_maintenance_date_range[1]
                  ? values.next_maintenance_date_range[1].format("YYYY-MM-DD HH:mm:ss")
                  : null,
              };
              if (isSplitMode && values.split_groups && values.split_groups.length > 0) {
                const formattedDates = {};
                values.split_groups.forEach((group) => {
                  if (group && group.date_range && group.asset_ids) {
                    const startStr = group.date_range[0].format("YYYY-MM-DD HH:mm:ss");
                    const endStr = group.date_range[1].format("YYYY-MM-DD HH:mm:ss");
                    group.asset_ids.forEach((aId) => {
                      formattedDates[aId] = { start: startStr, end: endStr };
                    });
                  }
                });
                payload.asset_dates = formattedDates;
                // Pastikan asset_ids pada payload hanya yang di-assign secara manual
                payload.asset_ids = Object.keys(formattedDates);
              }
              if (isEditMode) {
                const existingIds = String(editScheduleId).split(",");
                let originalSchedules = [];
                schedules.forEach(row => {
                  if (row.schedules) {
                    row.schedules.forEach(sch => {
                      if (existingIds.includes(String(sch.id))) {
                        originalSchedules.push(sch);
                      }
                    });
                  }
                });
                
                const currentAssetIds = values.asset_ids || [];
                const newAssetIds = currentAssetIds.filter(id => !originalSchedules.find(s => s.asset_id === id));
                const removedSchedules = originalSchedules.filter(s => !currentAssetIds.includes(s.asset_id));
                const keptSchedules = originalSchedules.filter(s => currentAssetIds.includes(s.asset_id));

                const promises = [];
                
                keptSchedules.forEach(sch => {
                  const updatePayload = { ...payload, asset_ids: [sch.asset_id] };
                  if (payload.asset_dates && payload.asset_dates[sch.asset_id]) {
                    const ad = payload.asset_dates[sch.asset_id];
                    updatePayload.next_maintenance_date = ad.start || ad;
                    updatePayload.next_maintenance_end_date = ad.end || null;
                  }
                  promises.push(maintenanceScheduleService.updateSchedule(sch.id, updatePayload));
                });

                if (newAssetIds.length > 0) {
                  promises.push(maintenanceScheduleService.createSchedule({ ...payload, asset_ids: newAssetIds }));
                }

                removedSchedules.forEach(sch => {
                  promises.push(maintenanceScheduleService.cancelSchedule(sch.id, "Dihapus dari form edit jadwal"));
                });

                await Promise.all(promises);
                message.success("Berhasil mengubah jadwal");
              } else {
                const res = await maintenanceScheduleService.createSchedule(payload);
                message.success(res.message || "Berhasil membuat jadwal manual");
              }
              setIsModalVisible(false);
              setIsManualCreateMode(false);
              setIsEditMode(false);
              setEditScheduleId(null);
              setIsSplitMode(false);
              setSelectedAssetIds([]);
              form.resetFields();
              reload();
            } catch (error) {
              message.error(error.response?.data?.message || "Gagal menyimpan jadwal");
            }
          });
        }}
        form={form}
        isEditMode={isEditMode}
        isSplitMode={isSplitMode}
        setIsSplitMode={setIsSplitMode}
        selectedAssetIds={selectedAssetIds}
        setSelectedAssetIds={setSelectedAssetIds}
        assets={assets}
        viewMode={viewMode}
        standards={standards}
        isReadOnly={isReadOnly}
        allowStandardSelection={isManualCreateMode}
        onStandardChange={applyStandardToForm}
      />

      <CopyScheduleModal
        open={isCopyModalVisible}
        onCancel={() => {
          setIsCopyModalVisible(false);
          setCopySourceSMId(null);
          setCopyTargetValue(null);
          setCopyTargetLevel("jenis");
        }}
        handleCopySchedule={handleCopySchedule}
        loading={loading}
        copyTargetLevel={copyTargetLevel}
        setCopyTargetLevel={setCopyTargetLevel}
        copyTargetValue={copyTargetValue}
        setCopyTargetValue={setCopyTargetValue}
        copySourceSMId={copySourceSMId}
        standards={standards}
      />

      <CancelScheduleModal
        open={cancelModal.open}
        cancelModalData={cancelModal}
        setCancelModal={setCancelModal}
        handleCancelSchedule={handleCancelSchedule}
        loading={loading}
      />

      <HolidayModal
        open={isHolidayModalVisible}
        onCancel={() => setIsHolidayModalVisible(false)}
        holidayForm={holidayForm}
        handleAddHoliday={handleAddHoliday}
        holidayLoading={holidayLoading}
        holidays={holidays}
        handleDeleteHoliday={handleDeleteHoliday}
      />
    </div>
  );
}
