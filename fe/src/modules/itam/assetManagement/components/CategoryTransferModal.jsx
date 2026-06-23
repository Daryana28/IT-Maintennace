import React from "react";
import { Modal, Form, Select } from "antd";

export default function CategoryTransferModal({
  open,
  editingCategory,
  form,
  parentOptions,
  onCancel,
  onSave,
}) {
  return (
    <Modal
      open={open}
      title={`Move Category: ${editingCategory?.category_name || ""}`}
      okText="Move"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={onSave}
      destroyOnHidden
      width={400}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="parent_id"
          label="New Parent Category"
          rules={[{ required: true, message: "Please select a new parent" }]}
        >
          <Select
            showSearch
            allowClear
            placeholder="Select new parent category"
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={parentOptions}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
