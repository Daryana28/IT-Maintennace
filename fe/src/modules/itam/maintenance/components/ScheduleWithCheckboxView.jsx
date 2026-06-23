import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, Table, Typography, Tag, Select, Button, Space, Row, Col, Dropdown, Menu, Tooltip, Empty, Checkbox } from "antd";
import { SearchOutlined, ReloadOutlined, InfoCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import maintenanceScheduleService from "../services/maintenanceScheduleService";
import standardMaintenanceService from "../services/standardMaintenanceService";
import AbnormalModal from "./AbnormalModal";

dayjs.extend(isoWeek);
const { Title, Text } = Typography;
const { Option } = Select;

export default function ScheduleWithCheckboxView({ overrideCategory, overrideYearlyId }) {
  const [loading, setLoading] = useState(false);
  const [matrixData, setMatrixData] = useState([]);
  
  // Year & Month states
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1); // 1-indexed
  const [availableYears, setAvailableYears] = useState([]);

  // Abnormal Modal states
  const [abnormalModalOpen, setAbnormalModalOpen] = useState(false);
  const [selectedCellData, setSelectedCellData] = useState(null);

  // Fetch available years
  const fetchYears = async () => {
    try {
      const years = await standardMaintenanceService.getYears();
      if (years && years.length > 0) {
        setAvailableYears(years.map(y => y.tahun));
        // Default to latest year if current not found
        const currentYear = dayjs().year();
        if (years.some(y => y.tahun === currentYear)) {
          setSelectedYear(currentYear);
        } else {
          setSelectedYear(years[0].tahun);
        }
      } else {
        setAvailableYears([dayjs().year()]);
      }
    } catch (err) {
      console.error("Gagal memuat tahun standard", err);
      setAvailableYears([dayjs().year()]);
    }
  };

  // Fetch matrix data
  const loadMatrixData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await maintenanceScheduleService.getMonthlyView(selectedYear, selectedMonth, overrideCategory);
      setMatrixData(data || []);
    } catch (err) {
      console.error("Gagal memuat data matrix schedule", err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, overrideCategory]);

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (selectedYear && selectedMonth) {
      loadMatrixData();
    }
  }, [selectedYear, selectedMonth, overrideCategory, loadMatrixData]);

  // Determine days of the selected month
  const daysInMonth = useMemo(() => {
    const totalDays = dayjs(`${selectedYear}-${selectedMonth}-01`).daysInMonth();
    const days = [];
    for (let d = 1; d <= totalDays; d++) {
      days.push(d);
    }
    return days;
  }, [selectedYear, selectedMonth]);

  // Handle cell status updates
  const handleUpdateStatus = async (actualId, newStatus) => {
    try {
      setLoading(true);
      await maintenanceScheduleService.updateActualStatus(actualId, newStatus);
      loadMatrixData();
    } catch (err) {
      console.error("Gagal update status checkbox", err);
    } finally {
      setLoading(false);
    }
  };

  // Cell merge helper
  const getRowSpan = (dataList, record, index, colName, parentCols = []) => {
    if (index > 0) {
      const prev = dataList[index - 1];
      const isSame = prev[colName] === record[colName] &&
                     parentCols.every(p => {
                       if (p === 'asset') {
                         return prev.asset?.asset_id === record.asset?.asset_id;
                       }
                       return prev[p] === record[p];
                     });
      if (isSame) return 0;
    }
    
    let span = 1;
    for (let i = index + 1; i < dataList.length; i++) {
      const next = dataList[i];
      const isSame = next[colName] === record[colName] &&
                     parentCols.every(p => {
                       if (p === 'asset') {
                         return next.asset?.asset_id === record.asset?.asset_id;
                       }
                       return next[p] === record[p];
                     });
      if (isSame) span++;
      else break;
    }
    return span;
  };

  // Render checkbox matrix cell
  const renderCell = (record, dayNum) => {
    const checkbox = (record.checkboxes || []).find(cb => dayjs(cb.date).date() === dayNum);
    if (!checkbox) {
      // No check planned for this day
      return <div style={{ minHeight: "28px", background: "#f1f5f9", borderRadius: "4px" }} />;
    }

    const { status, legend, actual_id, date, abnormal } = checkbox;
    
    // Status visual mapping
    let bgColor = "#f1f5f9";
    let textColor = "#475569";
    let label = "□";
    let tooltipText = `Plan: ${dayjs(date).format("DD MMM YYYY")}`;

    if (status === "ACTUAL") {
      bgColor = "#dcfce7";
      textColor = "#15803d";
      label = "✓";
      tooltipText = `Selesai: ${dayjs(date).format("DD MMM YYYY")}`;
    } else if (status === "ABNORMAL") {
      bgColor = "#fee2e2";
      textColor = "#b91c1c";
      label = "✗";
      tooltipText = `Kerusakan: ${abnormal?.deskripsi_kerusakan || "Abnormal"}`;
    }

    const menuItems = [
      {
        key: "actual",
        label: "Set Selesai (✓)",
        onClick: () => handleUpdateStatus(actual_id, "ACTUAL")
      },
      {
        key: "plan",
        label: "Set Plan / Belum Selesai (□)",
        onClick: () => handleUpdateStatus(actual_id, "PLAN")
      },
      {
        key: "abnormal",
        label: "⚠️ Laporkan Kerusakan (✗)",
        onClick: () => {
          setSelectedCellData({
            ...record,
            actual_id,
            date,
            abnormal,
            pengecekan: record.pengecekan
          });
          setAbnormalModalOpen(true);
        }
      }
    ];

    const cellElement = (
      <button
        style={{
          width: "100%",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: bgColor,
          color: textColor,
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: "6px",
          fontWeight: "bold",
          fontSize: "14px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
        }}
      >
        {label}
      </button>
    );

    return (
      <Tooltip title={tooltipText} placement="top">
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          {cellElement}
        </Dropdown>
      </Tooltip>
    );
  };

  // Define Table columns
  const columns = [
    {
      title: "No",
      key: "no",
      width: 50,
      align: "center",
      fixed: "left",
      render: (_, __, idx) => idx + 1
    },
    {
      title: "Ktg",
      dataIndex: "subKategori",
      key: "subKategori",
      width: 100,
      fixed: "left",
      onCell: (record, idx) => ({
        rowSpan: getRowSpan(matrixData, record, idx, "subKategori", []),
        style: { verticalAlign: "top", background: "#fff" }
      }),
      render: (val) => val || "-"
    },
    {
      title: "Perangkat",
      dataIndex: "namaPerangkat",
      key: "namaPerangkat",
      width: 120,
      fixed: "left",
      onCell: (record, idx) => ({
        rowSpan: getRowSpan(matrixData, record, idx, "namaPerangkat", ["subKategori"]),
        style: { verticalAlign: "top", background: "#fff" }
      }),
      render: (val) => val || "-"
    },
    {
      title: "Sub Pk",
      dataIndex: "subPerangkat",
      key: "subPerangkat",
      width: 110,
      fixed: "left",
      onCell: (record, idx) => ({
        rowSpan: getRowSpan(matrixData, record, idx, "subPerangkat", ["subKategori", "namaPerangkat"]),
        style: { verticalAlign: "top", background: "#fff" }
      }),
      render: (val) => val || "-"
    },
    {
      title: "Aset",
      key: "asset",
      width: 150,
      fixed: "left",
      onCell: (record, idx) => ({
        rowSpan: getRowSpan(matrixData, record, idx, "asset", ["subKategori", "namaPerangkat", "subPerangkat"]),
        style: { verticalAlign: "top", background: "#fff" }
      }),
      render: (_, record) => {
        const hostname = record.asset?.hostname;
        const name = record.asset?.nama_asset;
        const code = record.asset?.asset_code;
        return (
          <div>
            <Text strong>{hostname && hostname !== "-" ? hostname : name || "-"}</Text>
            {code && code !== "-" && <div style={{ fontSize: "11px", color: "#64748b" }}>{code}</div>}
          </div>
        );
      }
    },
    {
      title: "Fungsi",
      dataIndex: "fungsi",
      key: "fungsi",
      width: 130,
      onCell: (record, idx) => ({
        rowSpan: getRowSpan(matrixData, record, idx, "fungsi", ["subKategori", "namaPerangkat", "subPerangkat", "asset"]),
        style: { verticalAlign: "top", background: "#fff" }
      })
    },
    {
      title: "Desc",
      dataIndex: "deskripsi",
      key: "deskripsi",
      width: 150,
      onCell: (record, idx) => ({
        rowSpan: getRowSpan(matrixData, record, idx, "deskripsi", ["subKategori", "namaPerangkat", "subPerangkat", "asset", "fungsi"]),
        style: { verticalAlign: "top", background: "#fff" }
      })
    },
    {
      title: "Pengecekan",
      dataIndex: "pengecekan",
      key: "pengecekan",
      width: 150,
      render: (val) => <Tag color="blue">{val || "-"}</Tag>
    },
    {
      title: "Standar",
      dataIndex: "standard",
      key: "standard",
      width: 110,
    },
    {
      title: "Periodik",
      dataIndex: "periodik",
      key: "periodik",
      width: 90,
      align: "center",
      render: (val) => <Tag color="purple">{val || "-"}</Tag>
    },
    {
      title: dayjs(`${selectedYear}-${selectedMonth}-01`).format("MMMM YYYY").toUpperCase(),
      children: daysInMonth.map((d) => ({
        title: String(d),
        key: `day_${d}`,
        width: 45,
        align: "center",
        render: (_, record) => renderCell(record, d)
      }))
    }
  ];

  const monthOptions = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" }
  ];

  return (
    <Card variant="borderless" className="premium-content-card glass-effect">
      {/* FILTER BAR */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }} wrap>
        <Col>
          <Space size="middle" wrap>
            <div>
              <span style={{ marginRight: 8, fontWeight: 500 }}>Tahun:</span>
              <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 100 }}>
                {availableYears.map(y => (
                  <Option key={y} value={y}>{y}</Option>
                ))}
              </Select>
            </div>
            
            <div>
              <span style={{ marginRight: 8, fontWeight: 500 }}>Bulan:</span>
              <Select value={selectedMonth} onChange={setSelectedMonth} style={{ width: 140 }}>
                {monthOptions.map(m => (
                  <Option key={m.value} value={m.value}>{m.label}</Option>
                ))}
              </Select>
            </div>
          </Space>
        </Col>
        
        <Col>
          <Button icon={<ReloadOutlined />} onClick={loadMatrixData} loading={loading}>Refresh Matrix</Button>
        </Col>
      </Row>

      {/* LEGEND BAR */}
      <div 
        style={{ 
          display: "flex", 
          gap: "16px", 
          marginBottom: 16, 
          padding: "10px 16px", 
          background: "#f8fafc", 
          borderRadius: "8px", 
          fontSize: "12px",
          alignItems: "center"
        }}
      >
        <span style={{ fontWeight: 600, color: "#64748b" }}>Status Legend:</span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ display: "inline-flex", width: "20px", height: "20px", background: "#f1f5f9", color: "#475569", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "4px", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>□</span>
          Plan (Belum Dikerjakan)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ display: "inline-flex", width: "20px", height: "20px", background: "#dcfce7", color: "#15803d", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "4px", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>✓</span>
          Actual (Selesai Normal)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ display: "inline-flex", width: "20px", height: "20px", background: "#fee2e2", color: "#b91c1c", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "4px", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>✗</span>
          Abnormal (Temuan Kerusakan)
        </span>
        <span style={{ flexGrow: 1 }} />
        <Tooltip title="Klik cell checkbox untuk mengubah status plan/actual atau merekam log temuan kerusakan.">
          <InfoCircleOutlined style={{ color: "#94a3b8", fontSize: "14px" }} />
        </Tooltip>
      </div>

      {/* MATRIX TABLE */}
      {matrixData.length === 0 ? (
        <Empty description="Tidak ada jadwal maintenance untuk filter kategori & periode ini." style={{ padding: "40px 0" }} />
      ) : (
        <Table
          loading={loading}
          columns={columns}
          dataSource={matrixData}
          rowKey={(record) => `matrix-${record.schedule_id}-${record.check_id}`}
          bordered
          size="middle"
          pagination={{ pageSize: 25 }}
          scroll={{ x: "max-content", y: "calc(100vh - 420px)" }}
          className="premium-gantt-table"
        />
      )}

      {/* ABNORMAL MODAL */}
      <AbnormalModal
        open={abnormalModalOpen}
        actualData={selectedCellData}
        onCancel={() => {
          setAbnormalModalOpen(false);
          setSelectedCellData(null);
        }}
        onSuccess={loadMatrixData}
      />
    </Card>
  );
}
