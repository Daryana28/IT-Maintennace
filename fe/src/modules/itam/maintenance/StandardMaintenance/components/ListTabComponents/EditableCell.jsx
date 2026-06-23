import React from 'react';
import { Input, Select, Form } from 'antd';

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  let inputNode = <Input />;
  if (inputType === 'periodik') {
    inputNode = (
      <Select allowClear style={{ width: '100%' }}>
        <Select.Option value="1X/W">1X/W</Select.Option>
        <Select.Option value="2X/W">2X/W</Select.Option>
        <Select.Option value="Daily">Daily</Select.Option>
        <Select.Option value="Weekly">Weekly</Select.Option>
        <Select.Option value="Monthly">Monthly</Select.Option>
        <Select.Option value="3 Bulan">3 Bulan</Select.Option>
        <Select.Option value="6 Bulan">6 Bulan</Select.Option>
        <Select.Option value="Semester">Semester</Select.Option>
        <Select.Option value="Yearly">Yearly</Select.Option>
      </Select>
    );
  } else if (inputType === 'deskripsi') {
    inputNode = <Input.TextArea rows={1} />;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: ['fungsi', 'pengecekan', 'standard', 'periodik', 'subPerangkat'].includes(dataIndex),
              message: `Wajib diisi!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default EditableCell;
