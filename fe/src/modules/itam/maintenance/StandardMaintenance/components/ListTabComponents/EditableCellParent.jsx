import React from 'react';
import { Input, Select, Form } from 'antd';

const EditableCellParent = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  level1Categories,
  formSubKategoriOptions,
  formTipePerangkatOptions,
  formJenisPerangkatOptions,
  handleKategoriChange,
  handleSubKategoriChange,
  handleTipePerangkatChange,
  ...restProps
}) => {
  let inputNode = <Input />;

  if (inputType === 'kategori') {
    inputNode = (
      <Select
        showSearch
        allowClear
        options={level1Categories?.map(c => ({ value: c.category_name, label: c.category_name }))}
        onChange={handleKategoriChange}
      />
    );
  } else if (inputType === 'subKategori') {
    inputNode = (
      <Select showSearch allowClear options={formSubKategoriOptions} onChange={handleSubKategoriChange} />
    );
  } else if (inputType === 'tipePerangkat') {
    inputNode = (
      <Select showSearch allowClear options={formTipePerangkatOptions} onChange={handleTipePerangkatChange} />
    );
  } else if (inputType === 'jenisPerangkat') {
    inputNode = <Select showSearch allowClear options={formJenisPerangkatOptions} />;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `Wajib diisi!` }]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default EditableCellParent;
