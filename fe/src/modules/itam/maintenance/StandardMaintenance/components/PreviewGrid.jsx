import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Card, Typography, Select, Button, Space, Modal, Alert, Input, Form, message, Spin, Checkbox, Pagination } from "antd";
import { 
  PlusOutlined, 
  DeleteOutlined, 
  SaveOutlined, 
  CloseOutlined 
} from "@ant-design/icons";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isLeapYear from "dayjs/plugin/isLeapYear";
import "./PreviewGrid.css";

dayjs.extend(isoWeek);
dayjs.extend(customParseFormat);
dayjs.extend(isLeapYear);

const { Title, Text } = Typography;
const DEFAULT_PAGE_SIZE = 25;

const PERIODIK_OPTIONS = [
  { value: "DAILY", label: "Daily" },
  { value: "1X/MINGGU", label: "1X/Minggu" },
  { value: "2X/MINGGU", label: "2X/Minggu" },
  { value: "1X/BULAN", label: "1X/Bulan" },
  { value: "3X/BULAN", label: "3X/Bulan" },
  { value: "6X/BULAN", label: "6X/Bulan" },
  { value: "1X/TAHUN", label: "1X/Tahun" },
];

const generatePreviewDates = (year, periodik) => {
  const dates = [];
  const type = String(periodik).toUpperCase();
  const startOfYear = dayjs(`${year}-01-01`);
  const endOfYear = dayjs(`${year}-12-31`);

  const isWeekday = (dateObj) => {
    const d = dateObj.day();
    return d !== 0 && d !== 6;
  };

  const findWeekday = (startObj, maxDays = 15) => {
    let curr = startObj;
    for (let i = 0; i < maxDays; i++) {
      if (curr.year() === year && isWeekday(curr)) {
        return curr;
      }
      curr = curr.add(1, 'day');
    }
    return startObj;
  };

  if (type === "DAILY") {
    let curr = startOfYear;
    while (curr.isBefore(endOfYear) || curr.isSame(endOfYear, 'day')) {
      if (isWeekday(curr)) {
        dates.push(curr.format("YYYY-MM-DD"));
      }
      curr = curr.add(1, 'day');
    }
  } else if (type === "1X/MINGGU" || type === "1X/W" || type === "2X/MINGGU" || type === "2X/W") {
    const totalIsoWeeks = dayjs(`${year}-12-28`).isoWeek();
    const step = type.includes("2X") ? 2 : 1;
    for (let w = 1; w <= totalIsoWeeks; w += step) {
      let current = dayjs(`${year}-01-04`).isoWeek(w).startOf('isoWeek');
      let found = false;
      for (let i = 0; i < 5; i++) {
        let testDay = current.add(i, 'day');
        if (testDay.year() === year && isWeekday(testDay)) {
          dates.push(testDay.format("YYYY-MM-DD"));
          found = true;
          break;
        }
      }
      if (!found) {
        let testDay = current.add(3, 'day');
        if (testDay.year() === year) {
          dates.push(testDay.format("YYYY-MM-DD"));
        } else {
          dates.push(testDay.year() < year ? `${year}-01-01` : `${year}-12-31`);
        }
      }
    }
  } else if (type === "1X/BULAN" || type === "1X/M") {
    for (let m = 0; m < 12; m++) {
      let curr = dayjs().year(year).month(m).startOf('month');
      dates.push(findWeekday(curr).format("YYYY-MM-DD"));
    }
  } else if (type === "3X/BULAN" || type.includes("3 BULAN")) {
    [0, 3, 6, 9].forEach(m => {
      let curr = dayjs().year(year).month(m).startOf('month');
      dates.push(findWeekday(curr).format("YYYY-MM-DD"));
    });
  } else if (type === "6X/BULAN" || type.includes("6 BULAN")) {
    [0, 6].forEach(m => {
      let curr = dayjs().year(year).month(m).startOf('month');
      dates.push(findWeekday(curr).format("YYYY-MM-DD"));
    });
  } else if (type === "1X/TAHUN" || type.includes("TAHUN")) {
    let curr = dayjs().year(year).month(0).startOf('month');
    dates.push(findWeekday(curr).format("YYYY-MM-DD"));
  }

  return dates;
};

const GridRow = React.memo(function GridRow({
  row,
  rowIdx,
  calendarDates,
  selected,
  onSelectRow,
  onToggleCell,
  onPeriodikChange,
  onDeleteRow
}) {
  const plannedSet = useMemo(() => new Set(row.planned_dates || []), [row.planned_dates]);

  return (
    <tr className="excel-tr">
      <td className="excel-td sticky-col selector-col" style={{ left: 0 }}>
        <Checkbox checked={selected} onChange={(e) => onSelectRow(rowIdx, e.target.checked)} />
      </td>
      {/* Perangkat details (Sticky) */}
      <td className="excel-td sticky-col" style={{ left: 48 }}>
        <div style={{ fontWeight: "bold" }}>{row.namaPerangkat}</div>
        <div style={{ fontSize: "11px", color: "gray" }}>{row.subPerangkat !== "-" ? row.subPerangkat : ""}</div>
        <div style={{ fontSize: "10px", color: "#389e0d" }}>{row.subKategori}</div>
      </td>
      {/* Pengecekan details (Sticky) */}
      <td className="excel-td sticky-col" style={{ left: 188 }}>
        <div style={{ fontWeight: 500 }}>{row.pengecekan}</div>
        <div style={{ fontSize: "11px", color: "gray", fontStyle: "italic" }}>{row.standard}</div>
      </td>
      {/* Periodik selection dropdown (Sticky) */}
      <td className="excel-td sticky-col" style={{ left: 388 }}>
        <Select
          size="small"
          value={row.periodik}
          onChange={(val) => onPeriodikChange(rowIdx, val)}
          options={PERIODIK_OPTIONS}
          style={{ width: "100%" }}
        />
      </td>
      {/* Calendar cells for each day */}
      {calendarDates.map((d, colIdx) => {
        const isWeekend = d.dayOfWeek === 0 || d.dayOfWeek === 6;
        const isPlanned = plannedSet.has(d.dateStr);
        return (
          <td
            key={colIdx}
            className={`excel-td calendar-cell ${isWeekend ? "weekend-cell" : ""} ${isPlanned ? "planned-cell" : ""}`}
            onClick={() => onToggleCell(rowIdx, d.dateStr)}
            title={`${row.pengecekan} - ${d.dateStr}`}
          >
            {isPlanned ? "□" : ""}
          </td>
        );
      })}
      {/* Action cell */}
      <td className="excel-td" style={{ textAlign: "center" }}>
        <Button
          size="small"
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => onDeleteRow(rowIdx)}
        />
      </td>
    </tr>
  );
});

export default function PreviewGrid({ initialChecks, year, categoryName, loading = false, onSave, onCancel }) {
  const targetYear = parseInt(year) || new Date().getFullYear();

  const [checks, setChecks] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkPeriodik, setBulkPeriodik] = useState("1X/BULAN");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Load initial data
  useEffect(() => {
    if (initialChecks && initialChecks.length > 0) {
      const dateCache = new Map();
      const getPreviewDates = (periodik) => {
        const key = periodik || "1X/BULAN";
        if (!dateCache.has(key)) {
          dateCache.set(key, generatePreviewDates(targetYear, key));
        }
        return dateCache.get(key);
      };
      // Flatten nested structure if input is structured DB format
      const flat = [];
      initialChecks.forEach((sm) => {
        const details = sm.details || [];
        details.forEach((det) => {
          const pengecekanList = det.pengecekanList || [];
          pengecekanList.forEach((cek) => {
            flat.push({
              cekId: cek.id || cek.cekId || null,
              subKategori: sm.subKategori || "-",
              namaPerangkat: sm.namaPerangkat || "-",
              tipePerangkat: sm.tipePerangkat || "-",
              subPerangkat: sm.subPerangkat || "-",
              fungsi: det.fungsi || "-",
              deskripsi: det.deskripsi || "-",
              pengecekan: cek.pengecekan || "",
              standard: cek.standard || "",
              bagian: cek.bagian || "",
              metode: cek.metode || "",
              alat: cek.alat || "",
              periodik: cek.periodik || "1X/BULAN",
              planned_dates: (Array.isArray(cek.planned_dates) && cek.planned_dates.length > 0)
                ? cek.planned_dates 
                : getPreviewDates(cek.periodik || "1X/BULAN")
            });
          });
        });
      });
      // If flat is empty but we have flat list directly
      if (flat.length === 0 && Array.isArray(initialChecks)) {
        // checks might already be flat if parsed from excel
        setChecks(initialChecks.map(item => {
          let planned = Array.isArray(item.planned_dates) ? item.planned_dates : [];
          if (planned.length === 0 && item.periodik) {
            planned = getPreviewDates(item.periodik);
          }
          return { ...item, planned_dates: planned };
        }));
      } else {
        setChecks(flat);
      }
    } else {
      setChecks([]);
    }
    setSelectedRowKeys([]);
    setPage(1);
  }, [initialChecks, targetYear]);

  const visibleStartIndex = (page - 1) * pageSize;
  const visibleChecks = useMemo(
    () => checks.slice(visibleStartIndex, visibleStartIndex + pageSize),
    [checks, visibleStartIndex, pageSize]
  );
  const visibleIndexes = useMemo(
    () => visibleChecks.map((_, index) => visibleStartIndex + index),
    [visibleChecks, visibleStartIndex]
  );
  const allVisibleSelected = visibleIndexes.length > 0 && visibleIndexes.every((idx) => selectedRowKeys.includes(idx));

  // Generate all dates in targetYear
  const calendarDates = useMemo(() => {
    const dates = [];
    const start = dayjs(`${targetYear}-01-01`);
    const end = dayjs(`${targetYear}-12-31`);
    let curr = start;
    while (curr.isBefore(end) || curr.isSame(end, "day")) {
      dates.push({
        dateStr: curr.format("YYYY-MM-DD"),
        dayNum: curr.date(),
        monthNum: curr.month(),
        dayOfWeek: curr.day(), // 0 = Sunday, 6 = Saturday
        isoWeek: curr.isoWeek(),
      });
      curr = curr.add(1, "day");
    }
    return dates;
  }, [targetYear]);

  // Group dates by month for display header
  const monthsHeaders = useMemo(() => {
    const months = [
      { name: "JANUARI", count: 31 },
      { name: "FEBRUARI", count: dayjs(`${targetYear}-02-01`).isLeapYear() ? 29 : 28 },
      { name: "MARET", count: 31 },
      { name: "APRIL", count: 30 },
      { name: "MEI", count: 31 },
      { name: "JUNI", count: 30 },
      { name: "JULI", count: 31 },
      { name: "AGUSTUS", count: 31 },
      { name: "SEPTEMBER", count: 30 },
      { name: "OKTOBER", count: 31 },
      { name: "NOVEMBER", count: 30 },
      { name: "DESEMBER", count: 31 },
    ];
    return months;
  }, [targetYear]);

  // Handle cell click (toggle planned mapping)
  const handleToggleCell = useCallback((rowIdx, dateStr) => {
    setChecks(prev => {
      const updated = [...prev];
      const targetRow = updated[rowIdx];
      const planned = targetRow.planned_dates || [];
      const updatedPlanned = planned.includes(dateStr)
        ? planned.filter(d => d !== dateStr)
        : [...planned, dateStr];
      
      updated[rowIdx] = {
        ...targetRow,
        planned_dates: updatedPlanned
      };
      return updated;
    });
  }, []);

  const handleSelectRow = useCallback((rowIdx, checked) => {
    setSelectedRowKeys((prev) => {
      if (checked) return prev.includes(rowIdx) ? prev : [...prev, rowIdx];
      return prev.filter((idx) => idx !== rowIdx);
    });
  }, []);

  const handleSelectVisible = useCallback((checked) => {
    setSelectedRowKeys((prev) => {
      if (!checked) return prev.filter((idx) => !visibleIndexes.includes(idx));
      const merged = new Set([...prev, ...visibleIndexes]);
      return Array.from(merged);
    });
  }, [visibleIndexes]);

  const handleApplyBulkPeriodik = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning("Pilih minimal satu baris untuk set periodik masal");
      return;
    }

    setChecks((prev) => {
      const selected = new Set(selectedRowKeys);
      return prev.map((row, idx) => selected.has(idx)
        ? { ...row, periodik: bulkPeriodik, planned_dates: generatePreviewDates(targetYear, bulkPeriodik) }
        : row
      );
    });
    message.success(`${selectedRowKeys.length} baris berhasil diset ke ${bulkPeriodik}`);
  }, [bulkPeriodik, selectedRowKeys, targetYear]);

  // Change periodik dropdown
  const handlePeriodikChange = useCallback((rowIdx, val) => {
    setChecks(prev => {
      const updated = [...prev];
      updated[rowIdx] = {
        ...updated[rowIdx],
        periodik: val,
        planned_dates: generatePreviewDates(targetYear, val)
      };
      return updated;
    });
  }, [targetYear]);

  // Delete row
  const handleDeleteRow = useCallback((rowIdx) => {
    Modal.confirm({
      title: "Hapus Pengecekan",
      content: "Apakah Anda yakin ingin menghapus baris pengecekan ini dari draf?",
      okText: "Hapus",
      okType: "danger",
      cancelText: "Batal",
        onOk: () => {
          setChecks(prev => prev.filter((_, idx) => idx !== rowIdx));
          setSelectedRowKeys([]);
          message.success("Baris pengecekan dihapus");
        }
    });
  }, []);

  // Add new row from modal form
  const handleAddRowSubmit = (values) => {
    const newRow = {
      cekId: null,
      subKategori: values.subKategori || "-",
      namaPerangkat: values.namaPerangkat || "-",
      tipePerangkat: values.tipePerangkat || "-",
      subPerangkat: values.subPerangkat || "-",
      fungsi: values.fungsi || "-",
      deskripsi: values.deskripsi || "-",
      pengecekan: values.pengecekan,
      standard: values.standard || "",
      bagian: values.bagian || "",
      metode: values.metode || "",
      alat: values.alat || "",
      periodik: values.periodik || "1X/BULAN",
      planned_dates: generatePreviewDates(targetYear, values.periodik || "1X/BULAN")
    };
    setChecks([...checks, newRow]);
    setPage(Math.ceil((checks.length + 1) / pageSize));
    setModalOpen(false);
    form.resetFields();
    message.success("Item pengecekan baru ditambahkan");
  };

  // Run periodic validations
  const validateChecks = () => {
    const errors = [];

    // Helper to get ISO weeks of the year
    const totalIsoWeeks = dayjs(`${targetYear}-12-28`).isoWeek(); // ISO week of end of year usually 52 or 53

    checks.forEach((item, idx) => {
      const label = `Baris ${idx + 1} (${item.namaPerangkat} - ${item.pengecekan})`;
      const planned = item.planned_dates || [];
      const periodik = (item.periodik || "").toUpperCase();

      if (periodik === "DAILY") {
        if (planned.length < 200) {
          errors.push(`${label}: Wajib memiliki plan harian (minimal 200 hari kerja di tahun berjalan).`);
        }
      }
      else if (periodik === "1X/MINGGU" || periodik === "1X/W") {
        // Validate at least 1 plan per ISO week of targetYear
        const weekMap = new Set();
        planned.forEach(d => {
          const dateObj = dayjs(d);
          if (dateObj.year() === targetYear) {
            weekMap.add(dateObj.isoWeek());
          }
        });
        const missingWeeks = [];
        for (let w = 1; w <= totalIsoWeeks; w++) {
          if (!weekMap.has(w)) {
            missingWeeks.push(w);
          }
        }
        if (missingWeeks.length > 0) {
          errors.push(`${label}: Wajib memiliki minimal 1 plan di setiap minggu. Minggu yang kurang: ${missingWeeks.join(", ")}`);
        }
      } 
      else if (periodik === "2X/MINGGU" || periodik === "2X/W") {
        // Validate at least 1 plan per 2 weeks (biweekly)
        const blockMap = new Set();
        planned.forEach(d => {
          const dateObj = dayjs(d);
          if (dateObj.year() === targetYear) {
            const w = dateObj.isoWeek();
            const block = Math.ceil(w / 2);
            blockMap.add(block);
          }
        });
        const totalBlocks = Math.ceil(totalIsoWeeks / 2);
        const missingBlocks = [];
        for (let b = 1; b <= totalBlocks; b++) {
          if (!blockMap.has(b)) {
            missingBlocks.push(b);
          }
        }
        if (missingBlocks.length > 0) {
          errors.push(`${label}: Wajib memiliki minimal 1 plan setiap 2 minggu. Blok 2-mingguan yang kurang: ${missingBlocks.join(", ")}`);
        }
      } 
      else if (periodik === "1X/BULAN" || periodik === "1X/M") {
        // Validate at least 1 plan per calendar month (0-11)
        const monthMap = new Set();
        planned.forEach(d => {
          const dateObj = dayjs(d);
          if (dateObj.year() === targetYear) {
            monthMap.add(dateObj.month());
          }
        });
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const missingMonths = [];
        for (let m = 0; m < 12; m++) {
          if (!monthMap.has(m)) {
            missingMonths.push(monthNames[m]);
          }
        }
        if (missingMonths.length > 0) {
          errors.push(`${label}: Wajib memiliki minimal 1 plan di setiap bulan. Bulan yang kurang: ${missingMonths.join(", ")}`);
        }
      } 
      else if (periodik === "3X/BULAN" || periodik === "3 BULAN") {
        // Validate at least 1 plan per quarter
        // Q1: 0,1,2 | Q2: 3,4,5 | Q3: 6,7,8 | Q4: 9,10,11
        const quarters = [false, false, false, false];
        planned.forEach(d => {
          const dateObj = dayjs(d);
          if (dateObj.year() === targetYear) {
            const q = Math.floor(dateObj.month() / 3);
            quarters[q] = true;
          }
        });
        const missingQuarters = [];
        quarters.forEach((q, idx) => {
          if (!q) missingQuarters.push(`Q${idx + 1}`);
        });
        if (missingQuarters.length > 0) {
          errors.push(`${label}: Wajib memiliki minimal 1 plan di setiap triwulan (Quarter). Kuartal yang kurang: ${missingQuarters.join(", ")}`);
        }
      } 
      else if (periodik === "6X/BULAN" || periodik === "6 BULAN") {
        // Validate at least 1 plan per half-year (H1: Jan-Jun, H2: Jul-Dec)
        const halfs = [false, false];
        planned.forEach(d => {
          const dateObj = dayjs(d);
          if (dateObj.year() === targetYear) {
            const h = dateObj.month() < 6 ? 0 : 1;
            halfs[h] = true;
          }
        });
        const missing = [];
        if (!halfs[0]) missing.push("Semester 1 (Jan-Jun)");
        if (!halfs[1]) missing.push("Semester 2 (Jul-Dec)");
        if (missing.length > 0) {
          errors.push(`${label}: Wajib memiliki minimal 1 plan di setiap semester. Semester yang kurang: ${missing.join(", ")}`);
        }
      } 
      else if (periodik === "1X/TAHUN" || periodik === "1 TAHUN") {
        // Validate at least 1 plan in the whole year
        if (planned.length === 0) {
          errors.push(`${label}: Wajib memiliki minimal 1 plan di tahun berjalan.`);
        }
      }
    });

    return errors;
  };

  // Submit all configuration to backend
  const handleSaveAndGenerate = () => {
    if (checks.length === 0) {
      message.error("Tidak ada data pengecekan untuk disimpan!");
      return;
    }

    const validationErrors = validateChecks();
    if (validationErrors.length > 0) {
      Modal.error({
        title: "Validasi Periodik Gagal",
        width: 600,
        content: (
          <div style={{ maxHeight: 300, overflowY: "auto", marginTop: 12 }}>
            <p>Rencana penempatan plan tidak memenuhi target periodik wajib. Menampilkan maksimal 50 error pertama:</p>
            <ul style={{ paddingLeft: 20 }}>
              {validationErrors.slice(0, 50).map((err, i) => (
                <li key={i} style={{ color: "#d9363e", marginBottom: 6 }}>{err}</li>
              ))}
            </ul>
          </div>
        )
      });
      return;
    }

    Modal.confirm({
      title: "Simpan & Generate Jadwal",
      content: "Apakah Anda yakin ingin memproses data standard maintenance ini? Sistem akan men-generate schedule dan memperbarui actual matrix.",
      okText: "Ya, Generate",
      cancelText: "Batal",
      onOk: () => {
        onSave(checks);
      }
    });
  };

  return (
    <Spin spinning={loading} tip="Sedang generate schedule...">
      <Card className="preview-card" variant="borderless">
      <div className="preview-header">
        <div>
          <Title level={4} style={{ margin: 0 }}>Review Standard Maintenance & Date Mapping</Title>
          <Text type="secondary">Tahun: <strong>{targetYear}</strong> | Kategori: <strong>{categoryName}</strong></Text>
        </div>
        <Space>
          <Button onClick={onCancel} icon={<CloseOutlined />} disabled={loading}>Batal</Button>
          <Button type="dashed" onClick={() => setModalOpen(true)} icon={<PlusOutlined />} disabled={loading}>Tambah Item</Button>
          <Button type="primary" onClick={handleSaveAndGenerate} icon={<SaveOutlined />} loading={loading} style={{ backgroundColor: "#107c41", borderColor: "#107c41" }}>Generate Schedule</Button>
        </Space>
      </div>

      <Alert
        message="Petunjuk Pemetaan Plan"
        description="Klik pada sel kalender di baris pengecekan untuk menaruh Legend Plan (□). Preview dirender per halaman agar tetap ringan saat import banyak row. Gunakan checkbox untuk set periodik masal."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Space wrap style={{ marginBottom: 12 }}>
        <Text strong>{checks.length} row preview</Text>
        <Text type="secondary">{selectedRowKeys.length} dipilih</Text>
        <Select size="small" value={bulkPeriodik} onChange={setBulkPeriodik} options={PERIODIK_OPTIONS} style={{ width: 150 }} />
        <Button size="small" onClick={handleApplyBulkPeriodik} disabled={loading || selectedRowKeys.length === 0}>Set Periodik Masal</Button>
      </Space>

      <div className="grid-freeze-container">
        <div className="grid-scroll-wrapper">
          <table className="excel-table">
            <thead>
              {/* Month Header Row */}
              <tr>
                <th className="excel-th sticky-col selector-col" style={{ left: 0, zIndex: 10 }} rowSpan={2}>
                  <Checkbox checked={allVisibleSelected} onChange={(e) => handleSelectVisible(e.target.checked)} />
                </th>
                <th className="excel-th sticky-col" style={{ left: 48, minWidth: 140, zIndex: 10 }} rowSpan={2}>Perangkat</th>
                <th className="excel-th sticky-col" style={{ left: 188, minWidth: 200, zIndex: 10 }} rowSpan={2}>Pengecekan & Standar</th>
                <th className="excel-th sticky-col" style={{ left: 388, minWidth: 100, zIndex: 10 }} rowSpan={2}>Periodik</th>
                {monthsHeaders.map((m, idx) => (
                  <th key={idx} className="excel-th month-header" colSpan={m.count}>{m.name}</th>
                ))}
                <th className="excel-th action-header" style={{ minWidth: 60 }} rowSpan={2}>Aksi</th>
              </tr>
              {/* Days Header Row */}
              <tr>
                {calendarDates.map((d, idx) => {
                  const isWeekend = d.dayOfWeek === 0 || d.dayOfWeek === 6;
                  return (
                    <th
                      key={idx}
                      className={`excel-th day-header ${isWeekend ? "weekend-th" : ""}`}
                      title={d.dateStr}
                    >
                      {d.dayNum}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {visibleChecks.map((row, visibleIdx) => {
                const rowIdx = visibleStartIndex + visibleIdx;
                return (
                <GridRow
                  key={rowIdx}
                  row={row}
                  rowIdx={rowIdx}
                  calendarDates={calendarDates}
                  selected={selectedRowKeys.includes(rowIdx)}
                  onSelectRow={handleSelectRow}
                  onToggleCell={handleToggleCell}
                  onPeriodikChange={handlePeriodikChange}
                  onDeleteRow={handleDeleteRow}
                />
                );
              })}
              {checks.length === 0 && (
                <tr>
                  <td colSpan={4 + calendarDates.length + 1} style={{ textAlign: "center", padding: 24, color: "gray" }}>
                    Tidak ada baris pengecekan. Silakan upload file Excel atau klik "Tambah Item" secara manual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={checks.length}
          showSizeChanger
          pageSizeOptions={["10", "25", "50", "100"]}
          onChange={(nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          }}
          showTotal={(total, range) => `${range[0]}-${range[1]} dari ${total} row`}
        />
      </div>

      {/* MODAL TAMBAH ITEM */}
      <Modal
        title="Tambah Item Pengecekan Baru"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Tambah"
        cancelText="Batal"
      >
        <Form form={form} layout="vertical" onFinish={handleAddRowSubmit}>
          <Form.Item name="subKategori" label="Sub Kategori" rules={[{ required: true, message: "Wajib diisi" }]}>
            <Input placeholder="Contoh: CCTV" />
          </Form.Item>
          <Form.Item name="namaPerangkat" label="Nama Perangkat" rules={[{ required: true, message: "Wajib diisi" }]}>
            <Input placeholder="Contoh: NVR" />
          </Form.Item>
          <Form.Item name="subPerangkat" label="Sub Perangkat">
            <Input placeholder="Contoh: NVR" />
          </Form.Item>
          <Form.Item name="fungsi" label="Fungsi" rules={[{ required: true, message: "Wajib diisi" }]}>
            <Input placeholder="Contoh: Recording" />
          </Form.Item>
          <Form.Item name="deskripsi" label="Deskripsi">
            <Input.TextArea placeholder="Deskripsi detail perangkat" rows={2} />
          </Form.Item>
          <Form.Item name="pengecekan" label="Pengecekan" rules={[{ required: true, message: "Wajib diisi" }]}>
            <Input placeholder="Contoh: Cek visual lampu indikator" />
          </Form.Item>
          <Form.Item name="standard" label="Standar Normal" rules={[{ required: true, message: "Wajib diisi" }]}>
            <Input placeholder="Contoh: Lampu menyala hijau" />
          </Form.Item>
          <Form.Item name="bagian" label="Bagian">
            <Input placeholder="Contoh: Panel depan" />
          </Form.Item>
          <Form.Item name="metode" label="Metode">
            <Input placeholder="Contoh: Visual Check" />
          </Form.Item>
          <Form.Item name="alat" label="Alat">
            <Input placeholder="Contoh: Obeng / Tidak ada" />
          </Form.Item>
          <Form.Item name="periodik" label="Periodik" initialValue="1X/BULAN" rules={[{ required: true }]}>
            <Select options={PERIODIK_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
      </Card>
    </Spin>
  );
}
