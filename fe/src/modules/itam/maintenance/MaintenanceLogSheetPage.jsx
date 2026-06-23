import React, { useState, useEffect, useCallback } from "react";
import { Card, Table, Typography, Button, Space, Modal, Form, Input, DatePicker, Select, message, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";

import logSheetService from "./services/logSheetService";
import maintenanceScheduleService from "./services/maintenanceScheduleService";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function MaintenanceLogSheetPage() {
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  const category = pathParts[pathParts.length - 2]; 

  const titleMap = {
    hardware: "Hardware Logsheet Abnormal",
    "software-hardware": "Software Hardware Logsheet Abnormal",
    application: "Application Logsheet Abnormal",
    network: "Network Logsheet Abnormal",
    networking: "Networking Logsheet Abnormal",
    software: "Application Logsheet Abnormal",
    cyber: "Cyber Logsheet Abnormal",
    "cyber-security": "Cyber Security Logsheet Abnormal",
    "network-cyber": "Network & Cyber Logsheet Abnormal",
  };
  const title = titleMap[category] || "Logsheet Abnormal";

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  const [logSheets, setLogSheets] = useState([]);
  const [logSheetLoading, setLogSheetLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [form] = Form.useForm();

  // Load schedules (For simplicity, we'll load schedules first to allow linking findings to schedules)
  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all schedules (or pass a filter based on category if needed)
      // For now we get all and filter locally or show all
      const data = await maintenanceScheduleService.getSchedules();
      
      // Basic filtering: Only show schedules whose standard maintenance category matches the route
      // (This logic depends on how standard maintenance is structured)
      // As a fallback, we show all if structure is too complex
      const formatted = [];
      data.forEach(item => {
        if(item.schedules) {
          item.schedules.forEach(sch => {
            if (sch.status !== 'CANCELLED') {
               formatted.push({
                 ...sch,
                 kategori: item.kategori,
                 subKategori: item.subKategori,
                 namaPerangkat: item.namaPerangkat,
                 assetName: sch.asset?.nama_asset || sch.asset_id,
               });
            }
          });
        }
      });
      setSchedules(formatted);
    } catch (err) {
      message.error("Gagal memuat jadwal maintenance");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLogSheets = useCallback(async () => {
    try {
      setLogSheetLoading(true);
      const data = await logSheetService.getLogSheets();
      setLogSheets(data);
    } catch (err) {
      message.error("Gagal memuat log sheet");
    } finally {
      setLogSheetLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
    fetchLogSheets();
  }, [fetchSchedules, fetchLogSheets]);

  const handleOpenModal = (record = null, scheduleInfo = null) => {
    setEditingLog(record);
    setSelectedSchedule(scheduleInfo);
    if (record) {
      form.setFieldsValue({
        ...record,
        tanggal_temuan: record.tanggal_temuan ? dayjs(record.tanggal_temuan) : dayjs(),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        tanggal_temuan: dayjs(),
        status_temuan: "OPEN",
        schedule_id: scheduleInfo?.id
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLog(null);
    setSelectedSchedule(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        tanggal_temuan: values.tanggal_temuan.format("YYYY-MM-DD"),
      };

      if (editingLog) {
        await logSheetService.updateLogSheet(editingLog.id, payload);
        message.success("Log sheet berhasil diperbarui");
      } else {
        await logSheetService.createLogSheet(payload);
        message.success("Log sheet berhasil ditambahkan");
      }
      handleCloseModal();
      fetchLogSheets();
    } catch (error) {
      message.error("Gagal menyimpan log sheet");
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Hapus Log Sheet",
      content: "Apakah Anda yakin ingin menghapus temuan ini?",
      okText: "Ya, Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk: async () => {
        try {
          await logSheetService.deleteLogSheet(id);
          message.success("Berhasil menghapus log sheet");
          fetchLogSheets();
        } catch (error) {
          message.error("Gagal menghapus log sheet");
        }
      },
    });
  };

  const columns = [
    {
      title: "Tanggal Temuan",
      dataIndex: "tanggal_temuan",
      key: "tanggal_temuan",
      render: (text) => dayjs(text).format("DD MMM YYYY"),
    },
    {
      title: "Aset / Perangkat",
      key: "asset",
      render: (_, record) => record.schedule?.asset?.nama_asset || "-",
    },
    {
      title: "Temuan / Masalah",
      dataIndex: "temuan",
      key: "temuan",
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
      render: (status) => (
        <Tag color={status === "RESOLVED" ? "success" : status === "IN_PROGRESS" ? "processing" : "error"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record, record.schedule)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="fade-in" style={{ padding: 24 }}>
      <Card variant="borderless" className="premium-content-card glass-effect">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Title level={4} style={{ color: "#ff9b2f", margin: 0 }}>
            {title}
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal(null, null)}
          >
            Input Temuan Baru
          </Button>
        </div>

        <Table
          loading={logSheetLoading}
          dataSource={logSheets}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
          size="middle"
          className="premium-gantt-table"
        />
      </Card>

      <Modal
        title={editingLog ? "Edit Temuan" : "Input Temuan Baru"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="schedule_id"
            label="Pilih Jadwal Maintenance (Aset)"
            rules={[{ required: true, message: "Pilih aset/jadwal" }]}
          >
            <Select
              showSearch
              placeholder="Pilih Aset dari Jadwal"
              optionFilterProp="children"
              disabled={!!editingLog}
            >
              {schedules.map((sch) => (
                <Option key={sch.id} value={sch.id}>
                  {sch.assetName} - {dayjs(sch.next_maintenance_date).format("DD MMM YYYY")}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="tanggal_temuan"
            label="Tanggal Temuan"
            rules={[{ required: true, message: "Tanggal wajib diisi" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD MMM YYYY" />
          </Form.Item>

          <Form.Item
            name="temuan"
            label="Deskripsi Temuan / Masalah"
            rules={[{ required: true, message: "Deskripsi wajib diisi" }]}
          >
            <TextArea rows={4} placeholder="Jelaskan temuan..." />
          </Form.Item>

          <Form.Item
            name="tindakan"
            label="Tindakan / Solusi (Opsional)"
          >
            <TextArea rows={3} placeholder="Jelaskan tindakan yang dilakukan..." />
          </Form.Item>

          <Form.Item
            name="status_temuan"
            label="Status Perbaikan"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="OPEN">OPEN (Belum Ditangani)</Option>
              <Option value="IN_PROGRESS">IN PROGRESS (Sedang Ditangani)</Option>
              <Option value="RESOLVED">RESOLVED (Selesai)</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
