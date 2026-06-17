import React, { useState, useEffect } from "react";
import { Typography, Card, Table, Button, Space, Tag, message, Modal, InputNumber, Input, Tooltip, Popconfirm } from "antd";
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import standardMaintenanceService from "../services/standardMaintenanceService";
import "../StandardMaintenance/StandardMaintenancePage.css";

const { Title, Text } = Typography;

export default function YearlyStandardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [judul, setJudul] = useState("");
  const navigate = useNavigate();

  const loadYears = async () => {
    try {
      setLoading(true);
      const result = await standardMaintenanceService.getYears();
      setData(result.map((item, index) => ({ ...item, key: index })));
    } catch (err) {
      message.error("Gagal memuat daftar standard tahunan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadYears();
  }, []);

  const handleDelete = async (record) => {
    if (record.status_approval === "DRAFT") {
      const confirm = await Swal.fire({
        title: 'Hapus Standard?',
        text: 'Data DRAFT ini akan dihapus secara permanen beserta seluruh isinya.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
      });

      if (confirm.isConfirmed) {
        try {
          await standardMaintenanceService.deleteYearly(record.id);
          Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
          loadYears();
        } catch (error) {
          Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus data.', 'error');
        }
      }
    } else {
      const { value: alasan } = await Swal.fire({
        title: 'Pengajuan Hapus',
        input: 'textarea',
        inputLabel: 'Masukkan alasan penghapusan:',
        inputPlaceholder: 'Data ini sudah tidak relevan...',
        inputAttributes: {
          'aria-label': 'Masukkan alasan penghapusan'
        },
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'Anda harus memasukkan alasan!'
          }
        }
      });

      if (alasan) {
        try {
          await standardMaintenanceService.requestDeleteYearly(record.id, alasan);
          Swal.fire('Berhasil diajukan!', 'Pengajuan hapus telah dikirim untuk approval.', 'success');
          loadYears();
        } catch (error) {
          Swal.fire('Gagal!', 'Terjadi kesalahan saat mengajukan.', 'error');
        }
      }
    }
  };

  const openEditModal = (record) => {
    setIsEdit(true);
    setEditId(record.id);
    setSelectedYear(record.tahun);
    setJudul(record.judul);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: "No",
      key: "no",
      width: 60,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
      key: "tahun",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Judul",
      dataIndex: "judul",
      key: "judul",
    },
    {
      title: "Status Approval",
      dataIndex: "status_approval",
      key: "status_approval",
      render: (status) => {
        let color = "orange";
        if (status === "APPROVED") color = "green";
        if (status === "REJECTED") color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Aksi",
      key: "aksi",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Lihat Detail">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              shape="circle"
              onClick={() => navigate(`/itam/maintenance/standard?yearly_id=${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit Standard">
            <Button
              type="default"
              icon={<EditOutlined />}
              shape="circle"
              style={{ color: "#faad14", borderColor: "#faad14" }}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Hapus Standard">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              shape="circle"
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const tableHeader = () => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Text strong style={{ fontSize: "16px" }}>Daftar Standard Maintenance Tahunan</Text>
      <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={() => {
          setIsEdit(false);
          setJudul("");
          setSelectedYear(new Date().getFullYear());
          setIsModalOpen(true);
        }}
        style={{ borderRadius: "6px", fontWeight: 500 }}
      >
        Buat Standard Baru
      </Button>
    </div>
  );

  return (
    <div className="page-shell">
      {/* HEADER SECTION */}
      <div className="header-section" style={{ marginBottom: 24 }}>
        <Title level={3} className="header-title" style={{ margin: 0 }}>
          Yearly Standard Configuration
        </Title>
        <div className="header-breadcrumb" style={{ color: "#8c8c8c", marginTop: 4 }}>
          Maintenance / Yearly Standard Configuration
        </div>
      </div>

      <Card 
        bordered={false} 
        className="main-card" 
        style={{ 
          borderRadius: "12px", 
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)" 
        }}
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ pageSize: 10 }}
          title={tableHeader}
        />
      </Card>

      <Modal
        title={isEdit ? "Edit Standard Tahunan" : "Buat Standard Tahunan Baru"}
        open={isModalOpen}
        onOk={async () => {
          if (!judul.trim()) {
            message.error("Judul harus diisi");
            return;
          }
          try {
            setModalLoading(true);
            if (isEdit) {
              await standardMaintenanceService.updateYearly(editId, { tahun: selectedYear, judul });
              message.success("Standard Tahunan berhasil diperbarui");
            } else {
              await standardMaintenanceService.createYearly({ tahun: selectedYear, judul });
              message.success("Standard Tahunan berhasil dibuat");
            }
            setIsModalOpen(false);
            setJudul("");
            loadYears(); // Reload the table data
          } catch (error) {
            message.error(isEdit ? "Gagal memperbarui data" : "Gagal membuat Standard Tahunan");
          } finally {
            setModalLoading(false);
          }
        }}
        confirmLoading={modalLoading}
        onCancel={() => setIsModalOpen(false)}
        okText="Lanjut"
        cancelText="Batal"
        centered
      >
        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <Text strong>Judul Standard:</Text>
          <br />
          <Input 
            style={{ width: "100%", marginTop: 8, marginBottom: 16 }}
            size="large"
            placeholder="Contoh: Standard Maintenance Data Center 2024"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
          />

          <Text strong>Tahun:</Text>
          <br />
          <InputNumber
            style={{ width: "100%", marginTop: 8 }}
            size="large"
            value={selectedYear}
            onChange={(val) => setSelectedYear(val)}
            min={2000}
            max={2100}
          />
        </div>
      </Modal>
    </div>
  );
}
