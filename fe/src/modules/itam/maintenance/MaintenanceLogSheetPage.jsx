/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, Table, Typography, Button, Space, Modal, message, Tag } from "antd";
import { EditOutlined, DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import maintenanceScheduleService from "./services/maintenanceScheduleService";
import AbnormalModal from "./components/AbnormalModal";

const { Title, Text } = Typography;

export default function MaintenanceLogSheetPage({ overrideCategory }) {
  const category = overrideCategory; 

  const titleMap = {
    hardware: "Hardware Logsheet",
    "software-hardware": "Software Logsheet",
    application: "Application Logsheet",
    network: "Network Logsheet",
    networking: "Networking Logsheet",
    software: "Application Logsheet",
    cyber: "Cyber Logsheet",
    "cyber-security": "Cyber Security Logsheet",
    "network-cyber": "Network & Cyber Logsheet",
  };
  const title = titleMap[category] || "Logsheet";

  const [logSheets, setLogSheets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCellData, setSelectedCellData] = useState(null);

  const fetchLogSheets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await maintenanceScheduleService.getAllAbnormalLogs();
      setLogSheets(data || []);
    } catch {
      message.error("Gagal memuat log sheet abnormal");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogSheets();
  }, [fetchLogSheets]);

  // Frontend filter by category
  const filteredLogs = useMemo(() => {
    if (!category) return logSheets;
    
    const catMap = {
      "hardware": ["hardware"],
      "software-hardware": ["software_hw", "software-hardware", "software_hardware"],
      "application": ["application", "software"],
      "network-cyber": ["network_cyber", "network-cyber", "networking", "cyber"]
    };
    
    const mapped = catMap[category.toLowerCase()] || [category.toLowerCase()];
    
    return logSheets.filter(log => {
      // Check category name in standard maintenance or asset
      const logCat = (log.actual?.schedule?.asset?.category?.category_name || "").toLowerCase();
      const parentCat = (log.actual?.schedule?.asset?.category?.parent?.category_name || "").toLowerCase();
      const checkCat = (log.actual?.check?.standard_maintenance_detail?.standard_maintenance?.kategori || "").toLowerCase();
      return mapped.some(c => logCat.includes(c) || parentCat.includes(c) || checkCat.includes(c));
    });
  }, [logSheets, category]);

  const handleOpenEditModal = (record) => {
    setSelectedCellData({
      actual_id: record.actual_id || record.actual?.id,
      date: record.actual?.tanggal,
      pengecekan: record.actual?.check?.pengecekan,
      namaPerangkat: record.actual?.schedule?.StandardMaintenance?.namaPerangkat || "Perangkat",
      subPerangkat: record.actual?.schedule?.StandardMaintenance?.subPerangkat || "",
      asset: record.actual?.schedule?.asset,
      abnormal: {
        deskripsi_kerusakan: record.deskripsi_kerusakan,
        tindakan: record.tindakan,
        status: record.status_temuan
      }
    });
    setIsModalOpen(true);
  };

  const handleDelete = (record) => {
    const actualId = record.actual_id || record.actual?.id;
    if (!actualId) return;

    Modal.confirm({
      title: "Hapus Log Sheet & Reset Status",
      content: "Menghapus temuan abnormal ini akan me-reset status checkbox pada jadwal kembali menjadi PLAN (□). Apakah Anda yakin?",
      okText: "Ya, Hapus & Reset",
      okType: "danger",
      cancelText: "Batal",
      onOk: async () => {
        try {
          await maintenanceScheduleService.updateActualStatus(actualId, "PLAN");
          message.success("Berhasil menghapus temuan dan me-reset status");
          fetchLogSheets();
        } catch {
          message.error("Gagal menghapus log sheet");
        }
      },
    });
  };

  const columns = [
    {
      title: "Tanggal Temuan",
      key: "tanggal_temuan",
      width: 130,
      render: (_, record) => record.actual?.tanggal ? dayjs(record.actual.tanggal).format("DD MMM YYYY") : "-",
    },
    {
      title: "Aset / Perangkat",
      key: "asset",
      width: 200,
      render: (_, record) => {
        const asset = record.actual?.schedule?.asset;
        if (!asset) return "-";
        return asset.hostname && asset.hostname !== "-" ? asset.hostname : asset.nama_asset;
      },
    },
    {
      title: "Pengecekan",
      key: "pengecekan",
      width: 150,
      render: (_, record) => record.actual?.check?.pengecekan || "-",
    },
    {
      title: "Temuan / Masalah",
      dataIndex: "deskripsi_kerusakan",
      key: "deskripsi_kerusakan",
    },
    {
      title: "Tindakan / Solusi",
      dataIndex: "tindakan",
      key: "tindakan",
    },
    {
      title: "Status",
      dataIndex: "status_temuan",
      key: "status_temuan",
      width: 120,
      align: "center",
      render: (status) => (
        <Tag color={status === "RESOLVED" || status === "APPROVED" ? "success" : status === "IN_PROGRESS" ? "processing" : "error"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 180,
      align: "center",
      render: (_, record) => {
        const status = record.status_temuan;
        const actualId = record.actual_id || record.actual?.id;
        
        return (
          <Space>
            {status === "OPEN" && (
              <Button 
                type="primary" 
                size="small"
                onClick={async () => {
                  try {
                    await maintenanceScheduleService.submitAbnormalLog(actualId, {
                      deskripsi_kerusakan: record.deskripsi_kerusakan,
                      tindakan: record.tindakan || "Sedang ditangani",
                      status_temuan: "IN_PROGRESS"
                    });
                    message.success("Status diubah ke IN PROGRESS");
                    fetchLogSheets();
                  } catch {
                    message.error("Gagal mengubah status");
                  }
                }}
              >
                Kerjakan
              </Button>
            )}
            {status === "IN_PROGRESS" && (
              <Button 
                type="primary"
                style={{ background: "#eab308", borderColor: "#eab308", color: "#fff" }}
                size="small"
                onClick={() => {
                  Modal.confirm({
                    title: "Selesaikan Masalah",
                    content: "Apakah Anda yakin ingin menyelesaikan temuan abnormal ini?",
                    okText: "Ya, Selesaikan",
                    cancelText: "Batal",
                    onOk: async () => {
                      try {
                        await maintenanceScheduleService.submitAbnormalLog(actualId, {
                          deskripsi_kerusakan: record.deskripsi_kerusakan,
                          tindakan: record.tindakan || "Perbaikan selesai dilakukan",
                          status_temuan: "RESOLVED"
                        });
                        message.success("Temuan abnormal berhasil diselesaikan");
                        fetchLogSheets();
                      } catch {
                        message.error("Gagal menyelesaikan temuan");
                      }
                    }
                  });
                }}
              >
                Selesaikan
              </Button>
            )}
            <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenEditModal(record)} />
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
          </Space>
        );
      },
    },
  ];

  return (
    <div className="fade-in">
      <Card variant="borderless" className="premium-content-card glass-effect">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Title level={4} style={{ color: "#ff9b2f", margin: 0 }}>
            {title}
          </Title>
        </div>

        <Table
          loading={loading}
          dataSource={filteredLogs}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 15 }}
          bordered
          size="middle"
          className="premium-gantt-table"
        />
      </Card>

      <AbnormalModal
        open={isModalOpen}
        actualData={selectedCellData}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedCellData(null);
        }}
        onSuccess={fetchLogSheets}
      />
    </div>
  );
}
