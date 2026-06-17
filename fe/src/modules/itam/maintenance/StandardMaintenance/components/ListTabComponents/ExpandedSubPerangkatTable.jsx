import React, { useState, useEffect } from 'react';
import { Space, Button, Table, Typography, Tag, Tooltip, Form, message, AutoComplete } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import standardMaintenanceService from '../../../services/standardMaintenanceService';
import Swal from 'sweetalert2';
import ExpandedDetailTable from './ExpandedDetailTable';

const { Text } = Typography;

const ExpandedSubPerangkatTable = ({ parentRecord, subPerangkatList, onSave, yearlyStandardId, categories, globalExpandedRowKeys, onGlobalExpand }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(subPerangkatList || []);
  const [editingKey, setEditingKey] = useState('');

  useEffect(() => {
    setData(subPerangkatList || []);
  }, [subPerangkatList]);

  // Options for subPerangkat Select/AutoComplete
  const selectedTipePerangkat = categories.find(c => c.category_name === parentRecord.tipePerangkat); // Parent's tipePerangkat
  const formSubPerangkatOptions = selectedTipePerangkat
    ? categories.filter(c => c.parent_id === selectedTipePerangkat.category_id).map(c => ({ value: c.category_name, label: c.category_name }))
    : [];

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      subPerangkat: '',
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
        subKategori: parentRecord.subKategori,
        namaPerangkat: parentRecord.tipePerangkat,
        tipePerangkat: row.subPerangkat, // This is the Jenis Perangkat
      };

      if (item.id) {
        await standardMaintenanceService.updateParent(item.id, payload);
        message.success("Jenis Perangkat berhasil diperbarui");
      } else {
        item.subPerangkat = row.subPerangkat;
        setData(newData);
        message.success("Jenis Perangkat lokal ditambahkan. Silakan tambah Fungsi.");
      }

      setEditingKey('');
      if (item.id && onSave) onSave();
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
      title: 'Hapus Jenis Perangkat?',
      text: 'Semua fungsi dan pengecekan di bawah jenis perangkat ini akan ikut terhapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (confirm.isConfirmed) {
      try {
        if (record.id) {
          await standardMaintenanceService.deleteParent(record.id);
        }
        Swal.fire('Terhapus!', 'Jenis Perangkat berhasil dihapus.', 'success');
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
      subPerangkat: '', details: []
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
      title: "Jenis Perangkat", 
      dataIndex: "subPerangkat", 
      key: "subPerangkat", 
      editable: true,
      render: (text) => <Tag color="geekblue">{text || '-'}</Tag>
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'subPerangkat',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const SubPerangkatEditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
    let inputNode = <AutoComplete options={formSubPerangkatOptions} placeholder="Pilih atau ketik manual..." filterOption={(inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1} />;
    
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
    <div style={{ padding: '8px 24px 16px 24px', backgroundColor: '#fffbe6', border: '1px dashed #ffe58f', borderRadius: '4px', maxWidth: '100%', overflowX: 'auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-start', gap: '16px', alignItems: 'center' }}>
        <Text strong style={{ color: '#d48806' }}>Jenis Perangkat</Text>
        <Button type="primary" style={{ backgroundColor: '#faad14', borderColor: '#faad14' }} icon={<PlusOutlined />} onClick={handleAdd} size="small">Tambah Jenis Perangkat</Button>
      </div>
      <Form form={form} component={false}>
        <Table
          components={{ body: { cell: SubPerangkatEditableCell } }}
          bordered
          size="small"
          columns={mergedColumns}
          dataSource={data}
          pagination={false}
          rowClassName={() => 'custom-table-row'}
          expandable={{
            expandedRowKeys: globalExpandedRowKeys,
            onExpand: onGlobalExpand,
            expandedRowRender: (subPerangkatRecord) => (
              <ExpandedDetailTable 
                parentRecord={parentRecord} 
                subPerangkatRecord={subPerangkatRecord}
                details={subPerangkatRecord.details} 
                onSave={onSave} 
                yearlyStandardId={yearlyStandardId} 
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

export default ExpandedSubPerangkatTable;
