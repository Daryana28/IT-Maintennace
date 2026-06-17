import React, { useState, useEffect } from 'react';
import { Table, Typography, Button, Space, Tooltip, Form, message, AutoComplete, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import standardMaintenanceService from '../../../services/standardMaintenanceService';
import Swal from 'sweetalert2';
import ExpandedNamaPerangkatTable from './ExpandedNamaPerangkatTable';

const { Text } = Typography;

const ExpandedTipePerangkatTable = ({ parentRecord, subKatRecord, tipePerangkatList, onSave, yearlyStandardId, categories, globalExpandedRowKeys, onGlobalExpand, onAddNode }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(tipePerangkatList || []);
  const [editingKey, setEditingKey] = useState('');

  useEffect(() => {
    setData(tipePerangkatList || []);
  }, [tipePerangkatList]);

  const selectedSubKategori = categories.find(c => c.category_name === subKatRecord.subKategori);
  const formTipePerangkatOptions = selectedSubKategori
    ? categories.filter(c => c.parent_id === selectedSubKategori.category_id).map(c => ({ value: c.category_name, label: c.category_name }))
    : [];

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      tipePerangkat: '',
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
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
        tipePerangkat: row.tipePerangkat,
      };

      if (item.id) {
        await standardMaintenanceService.updateParent(item.id, payload);
        message.success("Tipe Perangkat berhasil diperbarui");
      }

      setEditingKey('');
      if (item.id && onSave) onSave();
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const handleDelete = async (record) => {
    const confirm = await Swal.fire({
      title: 'Hapus Tipe Perangkat?',
      text: 'Semua data di bawah tipe perangkat ini akan ikut terhapus permanen.',
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
        Swal.fire('Terhapus!', 'Tipe Perangkat berhasil dihapus.', 'success');
        if (onSave) onSave();
      } catch (error) {
        Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus data.', 'error');
      }
    }
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
      title: "Tipe Perangkat", 
      dataIndex: "tipePerangkat", 
      key: "tipePerangkat", 
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
        inputType: 'tipePerangkat',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const TipePerangkatEditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
    let inputNode = <AutoComplete options={formTipePerangkatOptions} placeholder="Pilih atau ketik manual..." filterOption={(inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1} />;
    
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
    <div style={{ padding: '8px 24px 16px 24px', backgroundColor: '#f6ffed', border: '1px dashed #b7eb8f', borderRadius: '4px', maxWidth: '100%', overflowX: 'auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-start', gap: '16px', alignItems: 'center' }}>
        <Text strong style={{ color: '#389e0d' }}>Tipe Perangkat</Text>
        <Button 
          type="primary" 
          ghost 
          icon={<PlusOutlined />} 
          size="small" 
          onClick={() => onAddNode && onAddNode({ kategori: parentRecord.kategori, subKategori: subKatRecord.subKategori })}
        >
          Tambah Tipe Perangkat
        </Button>
      </div>
      <Form form={form} component={false}>
        <Table
          components={{ body: { cell: TipePerangkatEditableCell } }}
          bordered
          size="small"
          columns={mergedColumns}
          dataSource={data}
          pagination={false}
          rowClassName={() => 'custom-table-row'}
          expandable={{
            expandedRowKeys: globalExpandedRowKeys,
            onExpand: onGlobalExpand,
            expandedRowRender: (tipeRecord) => (
              <ExpandedNamaPerangkatTable 
                parentRecord={parentRecord} 
                subKatRecord={subKatRecord}
                tipeRecord={tipeRecord}
                namaPerangkatList={tipeRecord.namaPerangkatList} 
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

export default ExpandedTipePerangkatTable;
