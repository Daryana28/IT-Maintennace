import React, { useState, useEffect } from 'react';
import { Table, Typography, Button, Space, Tooltip, Form, message, AutoComplete, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import standardMaintenanceService from '../../../services/standardMaintenanceService';
import Swal from 'sweetalert2';
import ExpandedJenisPerangkatTable from './ExpandedJenisPerangkatTable';

const { Text } = Typography;

const ExpandedNamaPerangkatTable = ({ parentRecord, subKatRecord, namaPerangkatList, onSave, yearlyStandardId, categories, globalExpandedRowKeys, onGlobalExpand }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(namaPerangkatList || []);
  const [editingKey, setEditingKey] = useState('');

  useEffect(() => {
    setData(namaPerangkatList || []);
  }, [namaPerangkatList]);

  const selectedSubKategori = categories.find(c => c.category_name === subKatRecord.subKategori);
  const formNamaPerangkatOptions = selectedSubKategori
    ? categories.filter(c => c.parent_id === selectedSubKategori.category_id).map(c => ({ value: c.category_name, label: c.category_name }))
    : [];

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      namaPerangkat: '',
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
    if (editingKey.startsWith('new')) {
      setData(data.filter(item => item.key !== editingKey));
    }
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      const item = newData[index];

      const payload = {
        yearly_standard_id: yearlyStandardId,
        kategori: parentRecord.kategori,
        subKategori: subKatRecord.subKategori,
        namaPerangkat: row.namaPerangkat,
      };

      if (item.id) {
        await standardMaintenanceService.updateParent(item.id, payload);
        message.success("Nama Perangkat berhasil diperbarui");
      } else {
        await standardMaintenanceService.create(payload);
        message.success("Nama Perangkat berhasil ditambahkan.");
      }

      setEditingKey('');
      if (onSave) onSave();
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const handleDelete = async (record) => {
    if (record.key.startsWith('new')) {
      setData(data.filter(item => item.key !== record.key));
      return;
    }

    const confirm = await Swal.fire({
      title: 'Hapus Nama Perangkat?',
      text: 'Semua data di bawah nama perangkat ini akan ikut terhapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (confirm.isConfirmed) {
      try {
        if (record.id) {
          await standardMaintenanceService.deleteParent(record.id, 'namaPerangkat');
        }
        Swal.fire('Terhapus!', 'Nama Perangkat berhasil dihapus.', 'success');
        if (onSave) onSave();
      } catch (error) {
        Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus data.', 'error');
      }
    }
  };

  const handleAdd = () => {
    if (editingKey !== '') {
      message.warning("Selesaikan proses edit terlebih dahulu");
      return;
    }
    const newKey = `new-${Date.now()}`;
    const newRecord = {
      key: newKey,
      namaPerangkat: '', jenisPerangkatList: []
    };
    setData([newRecord, ...data]);
    form.setFieldsValue({ ...newRecord });
    setEditingKey(newKey);
  };

  const columns = [
    {
      title: "Aksi",
      key: "aksi",
      align: 'center',
      width: 100,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space size={4}>
            <Tooltip title="Simpan">
              <Button type="text" icon={<SaveOutlined />} onClick={() => save(record.key)} style={{ color: '#52c41a' }} />
            </Tooltip>
            <Tooltip title="Batal">
              <Button type="text" icon={<CloseOutlined />} onClick={cancel} />
            </Tooltip>
          </Space>
        ) : (
          <Space size={4}>
            <Tooltip title="Edit">
              <Button type="text" icon={<EditOutlined />} onClick={() => edit(record)} disabled={editingKey !== ''} />
            </Tooltip>
            <Tooltip title="Hapus">
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} disabled={editingKey !== ''} />
            </Tooltip>
          </Space>
        );
      },
    },
    { 
      title: "Nama Perangkat", 
      dataIndex: "namaPerangkat", 
      key: "namaPerangkat", 
      editable: true,
      render: (text) => <Text strong>{text || '-'}</Text>
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'namaPerangkat',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const NamaPerangkatEditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
    let inputNode = <AutoComplete options={formNamaPerangkatOptions} placeholder="Pilih atau ketik manual..." filterOption={(inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1} />;
    
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item name={dataIndex} style={{ margin: 0 }} rules={[{ required: true, message: 'Wajib diisi!' }]}>
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  return (
    <div style={{ padding: '8px 24px 16px 24px', backgroundColor: '#e6fffb', border: '1px dashed #87e8de', borderRadius: '4px', maxWidth: '100%', overflowX: 'auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-start', gap: '16px', alignItems: 'center' }}>
        <Text strong style={{ color: '#08979c' }}>Nama Perangkat</Text>
        <Button type="primary" style={{ backgroundColor: '#13c2c2', borderColor: '#13c2c2' }} ghost icon={<PlusOutlined />} onClick={handleAdd} size="small">Tambah Nama Perangkat</Button>
      </div>
      <Form form={form} component={false}>
        <Table
          components={{ body: { cell: NamaPerangkatEditableCell } }}
          bordered
          size="small"
          columns={mergedColumns}
          dataSource={data}
          pagination={false}
          rowClassName={() => 'custom-table-row'}
          expandable={{
            expandedRowKeys: globalExpandedRowKeys,
            onExpand: onGlobalExpand,
            expandedRowRender: (namaRecord) => (
              <ExpandedJenisPerangkatTable 
                parentRecord={parentRecord} 
                subKatRecord={subKatRecord}
                namaRecord={namaRecord}
                jenisPerangkatList={namaRecord.jenisPerangkatList} 
                onSave={onSave} 
                yearlyStandardId={yearlyStandardId} 
                categories={categories}
                globalExpandedRowKeys={globalExpandedRowKeys}
                onGlobalExpand={onGlobalExpand}
              />
            ),
          }}
        />
      </Form>
    </div>
  );
};

export default ExpandedNamaPerangkatTable;
