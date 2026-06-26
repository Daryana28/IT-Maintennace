import React, { useEffect } from "react";
import { Modal, Form, Input, message } from "antd";
import dayjs from "dayjs";
import assetService from "../services/assetService";

export default function AssetReplacementModal({
  open,
  asset,
  replacementDate,
  onCancel,
  onSuccess,
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && asset) {
      const effectiveReplacementDate =
        replacementDate ||
        asset.depreciation_date ||
        dayjs().format("YYYY-MM-DD");

      form.setFieldsValue({
        asset_code: asset.asset_code,
        asset_name: asset.asset_name,
        replacement_date: effectiveReplacementDate,
      });
    } else {
      form.resetFields();
    }
  }, [open, asset, replacementDate, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await assetService.replace(asset?.asset_id, {
        new_asset_code: values.new_asset_code,
        replacement_date: values.replacement_date,
        new_hostname: values.new_hostname || null,
        new_ip_main: values.new_ip_main || null,
        new_ip_backup: values.new_ip_backup || null,
        reason: values.reason || null,
      });
      message.success("Replacement asset berhasil disimpan.");
      if (onSuccess) {
        await onSuccess();
      } else {
        onCancel();
      }
    } catch (error) {
      if (error?.errorFields) return;
      message.error(error?.response?.data?.message || error?.message || "Gagal menyimpan replacement");
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
          label="Tanggal Replace"
          name="replacement_date"
          extra="Tanggal ini otomatis mengikuti sel timeline yang Anda pilih."
        >
          <Input disabled />
        </Form.Item>
        <Form.Item 
          label="No Asset Baru" 
          name="new_asset_code"
          rules={[{ required: true, message: "Masukkan no asset baru" }]}
        >
          <Input placeholder="Contoh: FI-00999" />
        </Form.Item>
        <Form.Item 
          label="Hostname Baru" 
          name="new_hostname"
        >
          <Input placeholder="Opsional" />
        </Form.Item>
        <Form.Item 
          label="IP Main Baru" 
          name="new_ip_main"
        >
          <Input placeholder="Opsional" />
        </Form.Item>
        <Form.Item 
          label="IP Backup Baru" 
          name="new_ip_backup"
        >
          <Input placeholder="Opsional" />
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
