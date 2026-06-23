import React, { useEffect } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import maintenanceScheduleService from "../services/maintenanceScheduleService";

const { TextArea } = Input;
const { Option } = Select;

export default function AbnormalModal({ open, actualData, onCancel, onSuccess }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && actualData) {
      form.setFieldsValue({
        deskripsi_kerusakan: actualData.abnormal?.deskripsi_kerusakan || "",
        tindakan: actualData.abnormal?.tindakan || "",
        status_temuan: actualData.abnormal?.status || "OPEN",
      });
    } else {
      form.resetFields();
    }
  }, [open, actualData, form]);

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const actualId = actualData.actual_id;
        await maintenanceScheduleService.submitAbnormalLog(actualId, values);
        message.success("Laporan abnormal berhasil disubmit");
        if (onSuccess) onSuccess();
        onCancel();
      } catch (err) {
        message.error(err.response?.data?.message || "Gagal menyimpan laporan abnormal");
      }
    });
  };

  return (
    <Modal
      title="⚠️ Log Temuan Abnormal"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Submit Abnormal"
      cancelText="Batal"
      destroyOnClose
    >
      <div style={{ marginBottom: 16, padding: "12px", background: "#f8fafc", borderRadius: "6px", fontSize: "13px" }}>
        <div><strong>Perangkat:</strong> {actualData?.namaPerangkat} ({actualData?.subPerangkat || "-"})</div>
        <div><strong>Aset:</strong> {actualData?.asset?.nama_asset || actualData?.asset?.hostname || "-"}</div>
        <div><strong>Tanggal:</strong> {actualData?.date}</div>
        <div><strong>Pengecekan:</strong> {actualData?.pengecekan}</div>
      </div>
      
      <Form form={form} layout="vertical">
        <Form.Item
          name="deskripsi_kerusakan"
          label="Deskripsi Kerusakan"
          rules={[{ required: true, message: "Deskripsi kerusakan wajib diisi" }]}
        >
          <TextArea rows={4} placeholder="Jelaskan detail kerusakan/abnormal yang ditemukan..." />
        </Form.Item>

        <Form.Item
          name="tindakan"
          label="Tindakan yang Dilakukan"
          rules={[{ required: true, message: "Tindakan wajib diisi" }]}
        >
          <TextArea rows={3} placeholder="Jelaskan tindakan perbaikan sementara/permanen..." />
        </Form.Item>

        <Form.Item
          name="status_temuan"
          label="Status Temuan"
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
  );
}
