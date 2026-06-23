import React, { useEffect } from "react";
import { Modal, Form, Input, DatePicker, message, Select } from "antd";

export default function AssetReplacementModal({ open, asset, onCancel, onSuccess }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && asset) {
      form.setFieldsValue({
        asset_code: asset.asset_code,
        asset_name: asset.asset_name,
      });
    } else {
      form.resetFields();
    }
  }, [open, asset, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Placeholder untuk integrasi API
      console.log("Replacement payload:", { asset_id: asset?.asset_id, ...values });
      message.success("Pengajuan replacement berhasil disimpan.");
      if (onSuccess) onSuccess();
      onCancel();
    } catch (error) {
      // Form validation error
    }
  };

  return (
    <Modal
      title="Pengajuan Replacement Aset"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Simpan"
      cancelText="Batal"
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item label="No Asset" name="asset_code">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Nama Aset" name="asset_name">
          <Input disabled />
        </Form.Item>
        <Form.Item 
          label="Budget Code (Anggaran Aset)" 
          name="budget_code"
          rules={[{ required: true, message: "Pilih budget code untuk replacement ini" }]}
        >
          <Select placeholder="Pilih Budget Code">
            <Select.Option value="OP-2026-001">OP-2026-001 - Microsoft 365</Select.Option>
            <Select.Option value="OP-2026-002">OP-2026-002 - AWS Hosting</Select.Option>
            <Select.Option value="OP-2026-003">OP-2026-003 - Internet ISP</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item 
          label="Tanggal Replacement" 
          name="replacement_date"
          rules={[{ required: true, message: "Pilih tanggal replacement" }]}
        >
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item 
          label="Alasan Replacement" 
          name="reason"
          rules={[{ required: true, message: "Masukkan alasan replacement" }]}
        >
          <Input.TextArea rows={4} placeholder="Masukkan alasan mengapa aset ini perlu diganti..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
