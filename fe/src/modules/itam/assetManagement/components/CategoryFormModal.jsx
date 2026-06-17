import React from "react";
import { Modal, Form, Input, InputNumber, Row, Col, Switch, Select } from "antd";

export default function CategoryFormModal({
  open,
  editingCategory,
  form,
  parentOptions,
  onCancel,
  onSave,
}) {
  const isSubcategory = Form.useWatch("is_subcategory", form);

  return (
    <Modal
      open={open}
      title={editingCategory ? "Edit Category" : "Add Category"}
      okText="Save"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={onSave}
      destroyOnHidden
      width={600}
    >
      <Form form={form} layout="vertical" className="category-form">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="category_name"
              label="Category Name"
              rules={[
                { required: true, message: "Please input the category name" },
                { max: 150, message: "Maximum 150 characters allowed" },
              ]}
            >
              <Input placeholder="e.g. Laptop, Hardware" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="sort_no"
              label="Sort No"
              rules={[{ required: true, message: "Please input the sort number" }]}
            >
              <InputNumber 
                min={0} 
                style={{ width: "100%" }} 
                className="category-sort-input" 
                placeholder="Default 0" 
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="is_active" 
              label="Status" 
              valuePropName="checked"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="show_in_tabs"
          label="Tampilkan di Tab"
          tooltip="Jika aktif, kategori ini akan ditampilkan sebagai pilihan Tab di halaman lain."
          valuePropName="checked"
        >
          <Switch checkedChildren="Ya" unCheckedChildren="Tidak" />
        </Form.Item>

        <Form.Item
          name="is_subcategory"
          label="Hierarchy"
          valuePropName="checked"
        >
          <Switch
            checkedChildren="Sub-Category"
            unCheckedChildren="Main Category"
            onChange={(checked) => {
              if (!checked) {
                form.setFieldValue("parent_id", undefined);
              }
            }}
          />
        </Form.Item>

        {isSubcategory && (
          <Form.Item
            name="parent_id"
            label="Parent Category"
            rules={[{ required: true, message: "Please select a parent category" }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Select parent category"
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={parentOptions}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
