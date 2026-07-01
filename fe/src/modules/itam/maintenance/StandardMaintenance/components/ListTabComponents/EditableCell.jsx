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
        <Select.Option value="DAILY">Daily</Select.Option>
        <Select.Option value="1X/MINGGU">1X/Minggu</Select.Option>
        <Select.Option value="2X/MINGGU">2X/Minggu</Select.Option>
        <Select.Option value="1X/BULAN">1X/Bulan</Select.Option>
        <Select.Option value="3X/BULAN">3X/Bulan</Select.Option>
        <Select.Option value="6X/BULAN">6X/Bulan</Select.Option>
        <Select.Option value="1X/TAHUN">1X/Tahun</Select.Option>
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
